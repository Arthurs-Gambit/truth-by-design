import VerdictBadge from "@/components/VerdictBadge";
import { STRATEGIES, AGENTS } from "@/lib/verdicts";
import { cn } from "@/lib/utils";

export default function StrategyComparison({ strategies }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Object.entries(strategies).map(([key, s]) => {
        const meta = STRATEGIES[key];
        const isPrimary = key === "moe";
        return (
          <div
            key={key}
            className={cn(
              "flex flex-col rounded-xl border bg-card p-5 shadow-sm",
              isPrimary ? "border-primary ring-1 ring-primary/30" : "border-border"
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold text-foreground">
                {meta.label}
              </h3>
              {isPrimary && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  Primary
                </span>
              )}
            </div>
            <div className="mt-3">
              <VerdictBadge verdict={s.verdict} />
            </div>
            <dl className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Confidence</dt>
                <dd className="font-medium text-foreground">
                  {Math.round(s.confidence * 100)}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Agent agreement</dt>
                <dd className="font-medium text-foreground">
                  {Math.round(s.agreement * 100)}%
                </dd>
              </div>
            </dl>
            {s.weights && (
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Weights:{" "}
                {Object.entries(s.weights)
                  .map(([a, w]) => `${AGENTS[a].label} ${Math.round(w * 100)}%`)
                  .join(" · ")}
              </p>
            )}
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {meta.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}