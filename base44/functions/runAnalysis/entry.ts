import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

const VERDICTS = ["true", "mostly_true", "half_true", "mostly_false", "false", "pants_on_fire"];
const AGENT_KEYS = ["openai", "claude", "gemini"];

function buildPrompt(claim, domain, context) {
  return [
    "You are a rigorous, neutral fact-checking expert.",
    "Analyze the claim below and return ONLY a JSON object (no prose, no code fences) with this exact shape:",
    '{ "verdict": one of "true","mostly_true","half_true","mostly_false","false","pants_on_fire", "confidence": number between 0 and 1, "points": [two concise evidence-based bullet points, each <= 120 characters] }',
    "Verdict scale: true = fully accurate; mostly_true = accurate with minor omission; half_true = partially accurate; mostly_false = mostly inaccurate; false = inaccurate; pants_on_fire = wildly false.",
    `Claim: "${claim}"`,
    `Domain hint: ${domain || "auto"}`,
    `Additional context: ${context || "none"}`,
    "Assess only what is verifiable from general knowledge; do not invent citations. Return only the JSON.",
  ].join("\n");
}

function extractJson(text) {
  if (!text) return null;
  let t = String(text).trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalizeSummary(raw) {
  if (!raw || typeof raw !== "object") return null;
  const verdict = String(raw.verdict || "").toLowerCase();
  if (!VERDICTS.includes(verdict)) return null;
  let conf = Number(raw.confidence);
  if (!isFinite(conf)) conf = 0.5;
  conf = Math.max(0, Math.min(1, conf));
  let points = Array.isArray(raw.points) ? raw.points.map(String).slice(0, 2) : [];
  if (points.length === 0) points = ["No supporting points returned."];
  return { verdict, confidence: conf, points };
}

async function runOpenAI(prompt) {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("Missing OPENAI_API_KEY");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return extractJson(data?.choices?.[0]?.message?.content);
}

async function runClaude(prompt) {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("Missing ANTHROPIC_API_KEY");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json();
  return extractJson(data?.content?.[0]?.text);
}

async function runGemini(prompt) {
  const key = Deno.env.get("GOOGLE_API_KEY");
  if (!key) throw new Error("Missing GOOGLE_API_KEY");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return extractJson(data?.candidates?.[0]?.content?.parts?.[0]?.text);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const claim = String(body?.claim || "").trim();
    if (!claim) return Response.json({ error: "Claim is required" }, { status: 400 });
    const domain = body?.domain || "auto";
    const context = body?.context || "";

    const prompt = buildPrompt(claim, domain, context);

    const settled = await Promise.allSettled([
      runOpenAI(prompt),
      runClaude(prompt),
      runGemini(prompt),
    ]);

    const agents = {};
    AGENT_KEYS.forEach((k, i) => {
      const r = settled[i];
      if (r.status === "fulfilled") {
        const summary = normalizeSummary(r.value);
        agents[k] = summary
          ? { status: "completed", summary }
          : { status: "failed", error: "Provider returned an unparseable result." };
      } else {
        agents[k] = {
          status: "failed",
          error: String(r.reason?.message || r.reason || "Provider call failed."),
        };
      }
    });

    const valid = AGENT_KEYS.filter((k) => agents[k].status === "completed").length;
    const outcome = valid >= 2 ? (valid === 3 ? "normal" : "degraded") : "human_review";

    return Response.json({ agents, outcome });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});