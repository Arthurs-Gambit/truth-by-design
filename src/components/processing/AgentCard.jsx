import { CheckCircle2, Loader2, XCircle, AlertCircle, CircleDashed } from "lucide-react";
import VerdictBadge from "@/components/VerdictBadge";
import { AGENTS } from "@/lib/verdicts";
import { cn } from "@/lib/utils";

const STATUS = {
  pending: {
    icon: CircleDashed,
    label: "Pending",
    className: "border-border bg-secondary text-muted-foreground",
  },
  running: {
    icon: Loader2,
    label: "Running",
    className: "border-primary/40 bg-primary/10 text-primary",
    spin: true,
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    className: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
};

function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.pending;
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        s.className
      )}
    >
      <Icon className={cn("h-3 w-3", s.spin && "animate-spin")} />
      {s.label}
    </span>
  );
}

export default function AgentCard({ agentKey, status, summary, error }) {
  const agent = AGENTS[agentKey];
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", agent.dot)} />
          <h3 className={cn("font-heading text-sm font-semibold", agent.accent)}>
            {agent.label}
          </h3>
        </div>
        <StatusPill status={status} />
      </div>

      {status === "pending" && (
        <p className="text-xs text-muted-foreground">Waiting in queue…</p>
      )}
      {status === "running" && (
        <p className="text-xs text-muted-foreground">Running ordered pipeline…</p>
      )}
      {status === "failed" && (
        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error || "Provider returned an error. Excluded from consensus."}
        </p>
      )}
      {status === "completed" && summary && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <VerdictBadge verdict={summary.verdict} size="sm" />
            <span className="text-xs text-muted-foreground">
              {Math.round(summary.confidence * 100)}% confidence
            </span>
          </div>
          <ul className="space-y-1.5">
            {summary.points.map((p, i) => (
              <li
                key={i}
                className="flex gap-2 text-xs leading-relaxed text-muted-foreground"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}