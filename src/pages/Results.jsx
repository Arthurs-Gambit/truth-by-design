import { useState } from "react";
import { ClipboardCheck, Info } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Disclaimer from "@/components/Disclaimer";
import EmptyState from "@/components/EmptyState";
import { AGENTS, STRATEGIES } from "@/lib/verdicts";
import { cn } from "@/lib/utils";

export default function Results() {
  const [strategy, setStrategy] = useState("moe");

  return (
    <div>
      <PageHeader
        eyebrow="Results"
        title="Consensus & comparison"
        description="The primary calibration-weighted MoE result, alongside three alternative consensus strategies for comparison."
      />

      <EmptyState
        icon={ClipboardCheck}
        title="No results to display yet"
        description="Once a claim is analyzed, the consensus verdict, per-agent breakdown, and strategy comparisons appear here."
        className="mb-8"
      />

      {/* Strategy selector — scaffold */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Consensus strategy
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STRATEGIES).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStrategy(key)}
              className={cn(
                "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                strategy === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {STRATEGIES[strategy].description}
          </p>
        </div>
      </div>

      {/* Consensus verdict placeholder */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Consensus verdict
        </p>
        <div className="mt-3 h-24 rounded-lg border border-dashed border-border bg-secondary/30" />
      </div>

      {/* Per-agent breakdown placeholder */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Per-agent breakdown
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(AGENTS).map(([key, agent]) => (
            <div key={key} className="rounded-lg border border-border bg-background p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", agent.dot)} />
                <span className={cn("text-sm font-medium", agent.accent)}>{agent.label}</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-3/4 rounded bg-secondary" />
                <div className="h-3 w-1/2 rounded bg-secondary" />
                <div className="h-3 w-2/3 rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}