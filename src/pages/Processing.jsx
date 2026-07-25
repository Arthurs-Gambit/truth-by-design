import { useLocation, useNavigate } from "react-router-dom";
import { Cpu, Layers, Sparkles, GitBranch, ScanSearch, ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Disclaimer from "@/components/Disclaimer";
import { AGENTS } from "@/lib/verdicts";

const STAGES = [
  { key: "pre_check", icon: Layers, label: "Pauli–Frankfurt Pre-check" },
  { key: "craap", icon: Sparkles, label: "CRAAP Assessment" },
  { key: "ethics", icon: GitBranch, label: "Ethical-Risk Assessment" },
  { key: "verdict", icon: ScanSearch, label: "Factual Verdict" },
];

function AgentColumn({ agentKey }) {
  const agent = AGENTS[agentKey];
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <span className={`h-2.5 w-2.5 rounded-full ${agent.dot}`} />
        <h3 className={`font-heading text-sm font-semibold ${agent.accent}`}>{agent.label}</h3>
      </div>
      <ul className="space-y-3">
        {STAGES.map(({ key, icon: Icon, label }) => (
          <li key={key} className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-secondary">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Processing() {
  const location = useLocation();
  const navigate = useNavigate();
  const claim = location.state?.claim;

  return (
    <div>
      <PageHeader
        eyebrow="Processing"
        title="Three-agent analysis"
        description="Each agent runs the shared pipeline independently. The calibration-weighted MoE then combines their outputs into a transparent consensus."
      />

      {claim ? (
        <div className="mb-6 rounded-xl border border-border bg-secondary/40 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Claim</p>
          <p className="mt-1 text-sm text-foreground">{claim}</p>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-dashed border-border bg-card px-5 py-6 text-center">
          <Cpu className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No active claim. Submit one from the Analyze page to begin processing.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {Object.keys(AGENTS).map((key) => (
          <AgentColumn key={key} agentKey={key} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Cpu className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Calibration-Weighted MoE</p>
            <p className="text-xs text-muted-foreground">Combines agent outputs into a consensus verdict.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/results")}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          View results
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}