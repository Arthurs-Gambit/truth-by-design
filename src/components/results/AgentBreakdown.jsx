import { useState } from "react";
import { ChevronDown } from "lucide-react";
import VerdictBadge from "@/components/VerdictBadge";
import { AGENTS, VERDICTS } from "@/lib/verdicts";
import { cn } from "@/lib/utils";

const RISK_STYLES = {
  low: "text-emerald-700 bg-emerald-50 border-emerald-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  high: "text-orange-700 bg-orange-50 border-orange-200",
  critical: "text-red-700 bg-red-50 border-red-200",
};

const CRAAP_KEYS = ["currency", "relevance", "authority", "accuracy", "purpose"];

function GateSection({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

export default function AgentBreakdown({ items }) {
  const [open, setOpen] = useState({});
  const toggle = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const agent = AGENTS[item.agentKey];
        const isOpen = !!open[item.agentKey];
        return (
          <div
            key={item.agentKey}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggle(item.agentKey)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-secondary/40"
            >
              <span className={cn("h-2.5 w-2.5 rounded-full", agent.dot)} />
              <span className={cn("font-heading text-sm font-semibold", agent.accent)}>
                {agent.label}
              </span>
              {item.status === "completed" ? (
                <>
                  <VerdictBadge verdict={item.summary.verdict} size="sm" className="ml-auto" />
                  <span className="w-12 text-right text-xs text-muted-foreground">
                    {Math.round(item.summary.confidence * 100)}%
                  </span>
                </>
              ) : (
                <span className="ml-auto text-xs font-medium text-destructive">Failed</span>
              )}
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {isOpen && item.status === "completed" && item.details && (
              <div className="space-y-4 border-t border-border bg-background px-5 py-4">
                <GateSection label="Pauli–Frankfurt pre-check">
                  <p className="text-xs text-foreground">
                    Passed:{" "}
                    <span className="font-medium">
                      {item.details.preCheck.passed ? "Yes" : "No"}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.details.preCheck.reasoning}
                  </p>
                  {item.details.preCheck.issues !== "None detected." && (
                    <p className="mt-0.5 text-xs text-amber-700">
                      Issues: {item.details.preCheck.issues}
                    </p>
                  )}
                </GateSection>

                <GateSection label="CRAAP assessment">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {CRAAP_KEYS.map((k) => (
                      <div key={k}>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {k}
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {item.details.craap[k]}/10
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {item.details.craap.notes}
                  </p>
                </GateSection>

                <GateSection label="Ethical-risk assessment">
                  <span
                    className={cn(
                      "inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
                      RISK_STYLES[item.details.ethics.risk_level]
                    )}
                  >
                    {item.details.ethics.risk_level} risk
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.details.ethics.risks}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mitigation: {item.details.ethics.mitigations}
                  </p>
                </GateSection>

                <GateSection label="Reasoning summary">
                  <ul className="space-y-1.5">
                    {item.details.points.map((p, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-xs leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </GateSection>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}