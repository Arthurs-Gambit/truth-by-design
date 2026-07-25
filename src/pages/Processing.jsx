import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Cpu,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  FileQuestion,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Disclaimer from "@/components/Disclaimer";
import StageProgress from "@/components/processing/StageProgress";
import AgentCard from "@/components/processing/AgentCard";

const AGENT_KEYS = ["openai", "claude", "gemini"];
const FAIL_PROBABILITY = 0.12;

const STAGES = [
  "Preparing claim",
  "Running three independent expert analyses",
  "Validating structured outputs",
  "Calculating MoE consensus",
];

const BULLET_POOL = [
  "Corroborated by two independent sources.",
  "Requires minor contextual qualification.",
  "Statistical framing is accurate but simplified.",
  "Primary source confirms the core figure.",
  "Detects an omission of relevant scope.",
  "Causal claim is overstated relative to evidence.",
];

const BASE_VERDICTS = ["true", "mostly_true", "half_true", "mostly_false", "false"];

function pickDistinct(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

function mockSummary(base) {
  return {
    verdict: base,
    confidence: Math.round((0.62 + Math.random() * 0.33) * 100) / 100,
    points: pickDistinct(BULLET_POOL, 2),
  };
}

const INITIAL_AGENTS = {
  openai: { status: "pending" },
  claude: { status: "pending" },
  gemini: { status: "pending" },
};

export default function Processing() {
  const location = useLocation();
  const navigate = useNavigate();
  const claim = location.state?.claim;
  const domain = location.state?.domain;
  const context = location.state?.context;

  const [stage, setStage] = useState(0);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [outcome, setOutcome] = useState(null); // null | "normal" | "degraded" | "human_review"
  const [retryKey, setRetryKey] = useState(0);
  const resultsRef = useRef({});
  const baseRef = useRef(null);

  useEffect(() => {
    if (!claim) return;
    const timers = [];
    const addT = (fn, ms) => timers.push(setTimeout(fn, ms));

    // Reset
    setStage(0);
    setAgents(INITIAL_AGENTS);
    setOutcome(null);
    resultsRef.current = {};
    baseRef.current = BASE_VERDICTS[Math.floor(Math.random() * BASE_VERDICTS.length)];

    // Stage 0 → 1
    addT(() => setStage(1), 900);

    const starts = { openai: 1000, claude: 1300, gemini: 1600 };
    const durations = { openai: 2200, claude: 2600, gemini: 2000 };

    AGENT_KEYS.forEach((k) => {
      addT(() => setAgents((p) => ({ ...p, [k]: { status: "running" } })), starts[k]);
      addT(() => {
        const fail = Math.random() < FAIL_PROBABILITY;
        const result = fail
          ? { status: "failed", error: "Provider returned an error during analysis." }
          : { status: "completed", summary: mockSummary(baseRef.current) };
        setAgents((p) => ({ ...p, [k]: result }));
        resultsRef.current[k] = result;
      }, starts[k] + durations[k]);
    });

    const allDoneAt =
      Math.max(...AGENT_KEYS.map((k) => starts[k] + durations[k])) + 200;

    addT(() => setStage(2), allDoneAt);
    addT(() => setStage(3), allDoneAt + 1000);
    addT(() => {
      const valid = AGENT_KEYS.filter(
        (k) => resultsRef.current[k]?.status === "completed"
      ).length;
      const next = valid >= 2 ? (valid === 3 ? "normal" : "degraded") : "human_review";
      setOutcome(next);
      setStage(4);
    }, allDoneAt + 2000);

    return () => timers.forEach(clearTimeout);
  }, [claim, retryKey]);

  const retry = () => setRetryKey((k) => k + 1);

  const viewResults = () =>
    navigate("/results", {
      state: {
        claim,
        domain,
        context,
        outcome,
        agents: resultsRef.current,
        baseVerdict: baseRef.current,
      },
    });

  if (!claim) {
    return (
      <div>
        <PageHeader
          eyebrow="Processing"
          title="Three-agent analysis"
          description="No active claim was found for processing."
        />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <FileQuestion className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Submit a claim from the Analyze page to begin processing.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Go to Analyze
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const validCount = AGENT_KEYS.filter(
    (k) => agents[k]?.status === "completed"
  ).length;

  return (
    <div>
      <PageHeader
        eyebrow="Processing"
        title="Three-agent analysis"
        description="Each agent runs the shared pipeline independently. A calibration-weighted MoE then combines valid outputs into a consensus."
      />

      {/* Claim summary */}
      <div className="mb-6 rounded-xl border border-border bg-secondary/40 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Claim
        </p>
        <p className="mt-1 text-sm text-foreground">{claim}</p>
        {(domain || context) && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {domain && domain !== "auto" && (
              <span className="rounded-full border border-border bg-background px-2 py-0.5">
                Domain: {domain}
              </span>
            )}
            {context && (
              <span className="rounded-full border border-border bg-background px-2 py-0.5">
                Context: {context}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Stage progress */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-heading text-sm font-semibold text-foreground">
            Progress
          </h2>
          <StageProgress stages={STAGES} currentStage={stage} />
        </div>

        {/* Agents + outcome */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 font-heading text-sm font-semibold text-foreground">
              Independent expert analyses
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {AGENT_KEYS.map((k) => (
                <AgentCard
                  key={k}
                  agentKey={k}
                  status={agents[k].status}
                  summary={agents[k].summary}
                  error={agents[k].error}
                />
              ))}
            </div>
          </div>

          {/* Outcome card */}
          <OutcomeCard
            stage={stage}
            outcome={outcome}
            validCount={validCount}
            onViewResults={viewResults}
            onRetry={retry}
          />
        </div>
      </div>

      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}

function OutcomeCard({ stage, outcome, validCount, onViewResults, onRetry }) {
  if (stage < 3) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-muted-foreground">
          <Cpu className="h-4 w-4" />
        </span>
        <p className="text-sm text-muted-foreground">
          Waiting for agent outputs before consensus…
        </p>
      </div>
    );
  }

  if (stage === 3) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Cpu className="h-4 w-4 animate-pulse" />
        </span>
        <p className="text-sm font-medium text-foreground">Calculating MoE consensus…</p>
      </div>
    );
  }

  // stage === 4, done
  if (outcome === "human_review") {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-5 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h3 className="font-heading text-base font-semibold text-foreground">
              Human Review Required
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Fewer than two providers returned valid results
              {validCount === 1 ? " (only 1 of 3 succeeded)" : " (0 of 3 succeeded)"}. No
              automated consensus is available — please retry, or verify this claim with
              authoritative sources and qualified human review.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <RotateCcw className="h-4 w-4" />
              Retry analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (outcome === "degraded") {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h3 className="font-heading text-base font-semibold text-amber-900">
              Degraded consensus
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-amber-800">
              One provider failed; consensus was computed from {validCount} valid agent
              outputs. Treat with extra caution.
            </p>
            <button
              type="button"
              onClick={onViewResults}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              View results
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // normal
  return (
    <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h3 className="font-heading text-base font-semibold text-emerald-900">
            Consensus reached
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-emerald-800">
            All three providers returned valid results. Calibration-weighted MoE consensus
            computed.
          </p>
          <button
            type="button"
            onClick={onViewResults}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            View results
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}