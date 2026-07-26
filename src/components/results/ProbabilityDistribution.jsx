import { VERDICTS, VERDICT_ORDER } from "@/lib/verdicts";

export default function ProbabilityDistribution({ distribution }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-heading text-base font-semibold text-foreground">
        Probability distribution
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Consensus probability mass across the six verdict classes.
      </p>
      <ul className="mt-4 space-y-3">
        {VERDICT_ORDER.map((v) => {
          const cfg = VERDICTS[v];
          const Icon = cfg.icon;
          const pct = Math.round((distribution[v] || 0) * 100);
          return (
            <li key={v} className="flex items-center gap-3">
              <span className="flex w-32 shrink-0 items-center gap-1.5 text-xs text-foreground">
                <Icon className={`h-3.5 w-3.5 ${cfg.softText}`} />
                {cfg.label}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className={`h-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="w-10 text-right text-xs font-medium text-muted-foreground">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}