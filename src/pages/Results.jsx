import { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ClipboardCheck,
  Save,
  RotateCcw,
  Share2,
  Download,
  AlertTriangle,
  ShieldAlert,
  Users,
  ScrollText,
  Loader2,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Disclaimer from "@/components/Disclaimer";
import EmptyState from "@/components/EmptyState";
import VerdictBadge from "@/components/VerdictBadge";
import VerdictHeadline from "@/components/results/VerdictHeadline";
import ProbabilityDistribution from "@/components/results/ProbabilityDistribution";
import AgentBreakdown from "@/components/results/AgentBreakdown";
import StrategyComparison from "@/components/results/StrategyComparison";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { VERDICTS, VERDICT_ORDER, AGENTS } from "@/lib/verdicts";
import {
  buildConsensus,
  disagreementLevel,
  synthesizeAgentDetails,
  ETHIC_SEVERITY,
} from "@/lib/consensus";
import { cn } from "@/lib/utils";

const AGENT_KEYS = ["openai", "claude", "gemini"];

const DOMAIN_TO_CATEGORY = {
  auto: "other",
  political: "politics",
  scientific: "science",
  general: "other",
};

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = location.state || {};
  const { claim, domain, context, outcome, agents: rawAgents = {} } = state;

  const [tab, setTab] = useState("primary");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const validAgents = useMemo(
    () =>
      AGENT_KEYS.map((k) => ({ key: k, ...rawAgents[k] }))
        .filter((a) => a.status === "completed" && a.summary)
        .map((a) => ({
          agent: a.key,
          verdict: a.summary.verdict,
          confidence: a.summary.confidence,
        })),
    [rawAgents]
  );

  const consensus = useMemo(() => buildConsensus(validAgents), [validAgents]);

  const breakdownItems = useMemo(
    () =>
      AGENT_KEYS.map((k) => {
        const a = rawAgents[k] || { status: "pending" };
        return {
          agentKey: k,
          status: a.status,
          summary: a.summary,
          details:
            a.status === "completed" && a.summary
              ? synthesizeAgentDetails(k, a.summary)
              : null,
        };
      }),
    [rawAgents]
  );

  if (!claim || !consensus || validAgents.length < 2) {
    return (
      <div>
        <PageHeader
          eyebrow="Results"
          title="Consensus & comparison"
          description="The primary calibration-weighted MoE result, alongside three alternative consensus strategies."
        />
        <EmptyState
          icon={ClipboardCheck}
          title="No results to display yet"
          description="Analyze a claim to see the consensus verdict, per-agent breakdown, and strategy comparisons."
        />
        <div className="mt-8">
          <Disclaimer />
        </div>
      </div>
    );
  }

  const degraded = outcome === "degraded" || validAgents.length < 3;
  const disagreement = disagreementLevel(consensus.agreement, validAgents.length);
  const overallEthic = Math.max(
    ...validAgents.map((a) => ETHIC_SEVERITY[synthesizeAgentDetails(a.agent, a).ethics.risk_level])
  );
  const lowConfidence = consensus.confidence < 0.5;
  const sigDisagree = disagreement.level === "significant";
  const ethicsFlag = overallEthic >= 2;
  const needsReview = lowConfidence || sigDisagree || ethicsFlag;

  // Vote tally for disagreement indicator
  const tallyEntries = VERDICT_ORDER.map((v) => [v, consensus.tally[v]]).filter(
    ([, c]) => c > 0
  );

  // Evidence-gap notes
  const gaps = [];
  if (degraded) gaps.push(`${3 - validAgents.length} of 3 providers failed; the evidence base is incomplete.`);
  if (lowConfidence) gaps.push("Consensus confidence is below 50%; supporting evidence is thin.");
  if (sigDisagree) gaps.push("Agents diverge on the verdict; underlying evidence is contested.");
  gaps.push("No primary-source verification was performed automatically; rely on cited references.");

  const handleSave = async () => {
    if (saving || saved) return;
    setSaving(true);
    try {
      const claimRec = await base44.entities.Claim.create({
        text: claim,
        source: context || "",
        category: DOMAIN_TO_CATEGORY[domain] || "other",
        status: "completed",
        final_verdict: consensus.primary,
        consensus_confidence: consensus.confidence,
      });
      await base44.entities.AnalysisHistory.create({
        claim_id: claimRec.id,
        title: claim.slice(0, 80),
        tags: domain && domain !== "auto" ? [domain] : [],
      });
      setSaved(true);
      toast({ title: "Saved to history", description: "This analysis is available under History." });
    } catch (e) {
      toast({ title: "Could not save", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const rerun = () =>
    navigate("/processing", { state: { claim, domain, context } });

  const summaryText = () => {
    const lines = [
      `Truth by Design — Analysis`,
      `Claim: ${claim}`,
      `Verdict: ${VERDICTS[consensus.primary].label} (${Math.round(consensus.confidence * 100)}% confidence)`,
      `Agent agreement: ${Math.round(consensus.agreement * 100)}%`,
      ``,
      `Per-agent:`,
      ...validAgents.map(
        (a) => `- ${AGENTS[a.agent].label}: ${VERDICTS[a.verdict].label} (${Math.round(a.confidence * 100)}%)`
      ),
      ``,
      `AI-generated assessment. Verify consequential claims with authoritative sources and qualified human review.`,
    ];
    return lines.join("\n");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(summaryText());
      toast({ title: "Summary copied", description: "Paste it anywhere to share." });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const handleExport = () => {
    const payload = {
      claim,
      domain,
      context,
      consensus: {
        verdict: consensus.primary,
        confidence: consensus.confidence,
        agreement: consensus.agreement,
        distribution: consensus.distribution,
      },
      agents: validAgents.map((a) => ({
        agent: a.agent,
        verdict: a.verdict,
        confidence: a.confidence,
      })),
      strategies: consensus.strategies,
      generated_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "truth-by-design-result.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Results"
        title="Consensus & comparison"
        description="The primary calibration-weighted MoE result, the full probability distribution, per-agent breakdown, and alternative consensus strategies."
      />

      {/* Claim summary */}
      <div className="mb-6 rounded-xl border border-border bg-secondary/40 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Claim</p>
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

      {/* Human-review banner */}
      {needsReview && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="font-heading text-sm font-semibold text-amber-900">
              Human review recommended
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
              {lowConfidence && "Confidence is low. "}
              {sigDisagree && "Agents disagree significantly. "}
              {ethicsFlag && "Ethical risk is flagged. "}
              Treat this automated result as a decision-support signal, not a final verdict — verify
              with authoritative sources and qualified human review.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <VerdictHeadline
          verdict={consensus.primary}
          confidence={consensus.confidence}
          degraded={degraded}
        />
        <ProbabilityDistribution distribution={consensus.distribution} />
      </div>

      {/* Model disagreement */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-heading text-base font-semibold text-foreground">
            Model agreement
          </h2>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
              disagreement.level === "none"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : disagreement.level === "minor"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-red-200 bg-red-50 text-red-700"
            )}
          >
            {disagreement.level !== "none" && <AlertTriangle className="h-3.5 w-3.5" />}
            {disagreement.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(consensus.agreement * 100)}% of agents agree on the winning verdict.
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {tallyEntries.map(([v, c]) => (
            <span key={v} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${VERDICTS[v].dot}`} />
              {c}× <VerdictBadge verdict={v} size="sm" />
            </span>
          ))}
        </div>
      </div>

      {/* Per-agent breakdown */}
      <div className="mt-6">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
          Per-agent breakdown
        </h2>
        <AgentBreakdown items={breakdownItems} />
      </div>

      {/* Ethics & evidence gaps */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Ethical-risk summary
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Highest risk level across the valid agents.
          </p>
          <p className="mt-3 text-sm text-foreground">
            Overall risk:{" "}
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
                overallEthic >= 3
                  ? "text-red-700 bg-red-50 border-red-200"
                  : overallEthic === 2
                  ? "text-orange-700 bg-orange-50 border-orange-200"
                  : overallEthic === 1
                  ? "text-amber-700 bg-amber-50 border-amber-200"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200"
              )}
            >
              {["low", "medium", "high", "critical"][overallEthic]} risk
            </span>
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Flagged risks include misinformation potential and contextual omission. All agent
            outputs include mitigation guidance recommending source citation and human review.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-heading text-base font-semibold text-foreground">
              Evidence-gap notes
            </h2>
          </div>
          <ul className="mt-3 space-y-2">
            {gaps.map((g, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strategy comparison toggle */}
      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Consensus strategies
          </h2>
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setTab("primary")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                tab === "primary" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              Primary result
            </button>
            <button
              type="button"
              onClick={() => setTab("compare")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                tab === "compare" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              Compare strategies
            </button>
          </div>
        </div>

        {tab === "primary" ? (
          <div className="rounded-xl border border-primary bg-card p-6 shadow-sm ring-1 ring-primary/20">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                Primary
              </span>
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Calibration-Weighted MoE
              </h3>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <VerdictBadge verdict={consensus.strategies.moe.verdict} size="lg" />
              <span className="text-sm text-muted-foreground">
                Confidence{" "}
                <span className="font-semibold text-foreground">
                  {Math.round(consensus.strategies.moe.confidence * 100)}%
                </span>
              </span>
              <span className="text-sm text-muted-foreground">
                Agreement{" "}
                <span className="font-semibold text-foreground">
                  {Math.round(consensus.strategies.moe.agreement * 100)}%
                </span>
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {consensus.strategies.moe.details}
            </p>
            {consensus.strategies.moe.weights && (
              <p className="mt-2 text-xs text-muted-foreground">
                Weights:{" "}
                {Object.entries(consensus.strategies.moe.weights)
                  .map(([a, w]) => `${AGENTS[a].label} ${Math.round(w * 100)}%`)
                  .join(" · ")}
              </p>
            )}
          </div>
        ) : (
          <StrategyComparison strategies={consensus.strategies} />
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saved}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? "Saved" : saving ? "Saving…" : "Save to history"}
        </button>
        <button
          type="button"
          onClick={rerun}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <RotateCcw className="h-4 w-4" />
          Re-run analysis
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          View history
        </Link>
      </div>

      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}