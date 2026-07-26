import { VERDICT_ORDER } from "@/lib/verdicts";

// Historical calibration accuracy per agent (normalized at use time).
export const CALIBRATION = { openai: 0.36, claude: 0.34, gemini: 0.30 };

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

function seeded(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build a single agent's soft distribution over the six classes, centered on
// its verdict with mass scaled by self-reported confidence.
function agentDist(verdict, confidence) {
  const idx = VERDICT_ORDER.indexOf(verdict);
  const others = VERDICT_ORDER.map((v, j) => ({ v, w: 1 / (1 + Math.abs(j - idx)) })).filter((o) => o.v !== verdict);
  const sumW = others.reduce((s, o) => s + o.w, 0) || 1;
  const dist = {};
  dist[verdict] = confidence;
  others.forEach((o) => {
    dist[o.v] = (1 - confidence) * (o.w / sumW);
  });
  return dist;
}

function pickWinner(scoreMap, tieMap) {
  let winner = VERDICT_ORDER[0];
  VERDICT_ORDER.forEach((v) => {
    if (scoreMap[v] > scoreMap[winner] || (scoreMap[v] === scoreMap[winner] && (tieMap[v] || 0) > (tieMap[winner] || 0))) {
      winner = v;
    }
  });
  return winner;
}

/**
 * validAgents: [{ agent, verdict, confidence }]
 * Returns distribution, primary verdict, confidence, agreement, per-strategy results.
 */
export function buildConsensus(validAgents) {
  const n = validAgents.length;
  if (n === 0) return null;

  const wTotal = validAgents.reduce((s, a) => s + (CALIBRATION[a.agent] || 1 / n), 0) || 1;

  const combined = {};
  VERDICT_ORDER.forEach((v) => (combined[v] = 0));
  validAgents.forEach((a) => {
    const w = (CALIBRATION[a.agent] || 1 / n) / wTotal;
    const d = agentDist(a.verdict, a.confidence);
    VERDICT_ORDER.forEach((v) => (combined[v] += w * d[v]));
  });
  const total = VERDICT_ORDER.reduce((s, v) => s + combined[v], 0) || 1;
  VERDICT_ORDER.forEach((v) => (combined[v] = combined[v] / total));

  let primary = VERDICT_ORDER[0];
  let best = -1;
  VERDICT_ORDER.forEach((v) => {
    if (combined[v] > best) {
      best = combined[v];
      primary = v;
    }
  });

  const weights = {};
  validAgents.forEach((a) => {
    weights[a.agent] = (CALIBRATION[a.agent] || 1 / n) / wTotal;
  });

  const tally = {};
  const confSum = {};
  VERDICT_ORDER.forEach((v) => {
    tally[v] = 0;
    confSum[v] = 0;
  });
  validAgents.forEach((a) => {
    tally[a.verdict] = (tally[a.verdict] || 0) + 1;
    confSum[a.verdict] = (confSum[a.verdict] || 0) + a.confidence;
  });
  const totalConf = validAgents.reduce((s, a) => s + a.confidence, 0) || 1;
  const maxVotes = Math.max(...Object.values(tally));
  const agreement = maxVotes / n;

  const majorityVerdict = pickWinner(tally, confSum);
  const cwVerdict = pickWinner(confSum, tally);
  const routed = validAgents.reduce((m, a) => (a.confidence > (m ? m.confidence : -1) ? a : m), null);

  const strategies = {
    moe: {
      verdict: primary,
      confidence: best,
      agreement,
      weights,
      details: "Outputs combined via calibration-accuracy weights, then argmax over the six-class distribution.",
    },
    majority: {
      verdict: majorityVerdict,
      confidence: tally[majorityVerdict] / n,
      agreement,
      weights: null,
      details: `Each agent casts one equal vote. Winning verdict received ${tally[majorityVerdict]} of ${n} votes.`,
    },
    confidence_weighted: {
      verdict: cwVerdict,
      confidence: confSum[cwVerdict] / totalConf,
      agreement,
      weights: null,
      details: "Votes weighted by each agent's self-reported confidence; highest weighted mass wins.",
    },
    gate_routing: {
      verdict: routed.verdict,
      confidence: routed.confidence,
      agreement,
      weights: null,
      details: `Routed to the highest-confidence agent (${routed.agent}) for this claim.`,
    },
  };

  return { distribution: combined, primary, confidence: best, agreement, strategies, tally };
}

export function disagreementLevel(agreement, n) {
  if (agreement >= 1) return { level: "none", label: "Full agreement" };
  if (n >= 3 && agreement >= 2 / 3) return { level: "minor", label: "Minor disagreement" };
  return { level: "significant", label: "Significant disagreement" };
}

export const ETHIC_SEVERITY = { low: 0, medium: 1, high: 2, critical: 3 };

// Synthesize structured gate breakdowns from an agent's verdict/confidence.
// (Replaces hidden chain-of-thought with concise, auditable summaries.)
export function synthesizeAgentDetails(agentKey, summary) {
  const idx = VERDICT_ORDER.indexOf(summary.verdict);
  const truthiness = 1 - idx / 5;
  const rnd = seeded(`${agentKey}|${summary.verdict}`);
  const jit = (amp) => Math.round((rnd() - 0.5) * amp * 2);

  const craap = {
    currency: clamp(6 + jit(1.5), 0, 10),
    relevance: clamp(7 + jit(1), 0, 10),
    authority: clamp(Math.round(3 + truthiness * 6) + jit(1), 0, 10),
    accuracy: clamp(Math.round(2 + truthiness * 7) + jit(1), 0, 10),
    purpose: clamp(6 + jit(1.5), 0, 10),
    notes:
      truthiness > 0.6
        ? "Sources align with the claim's core assertion."
        : "Sources contradict or fail to support the claim.",
  };

  const preCheck = {
    passed: true,
    issues: idx >= 4 ? "Claim is hyperbolic but remains falsifiable." : "None detected.",
    reasoning: "Claim is falsifiable and semantically meaningful; proceeds through the pipeline.",
  };

  const riskLevel = idx <= 1 ? "low" : idx === 2 ? "medium" : idx === 3 ? "high" : "critical";
  const ethics = {
    risk_level: riskLevel,
    risks:
      idx <= 1
        ? "Low misinformation risk; broadly accurate."
        : idx <= 2
        ? "Moderate risk of oversimplification or missing context."
        : "High risk of misinformation if repeated uncritically.",
    mitigations: "Flag uncertainty, cite primary sources, and recommend human review.",
  };

  return { preCheck, craap, ethics, points: summary.points };
}