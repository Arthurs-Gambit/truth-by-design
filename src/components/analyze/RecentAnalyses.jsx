import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { History as HistoryIcon, ArrowRight, Loader2 } from "lucide-react";
import VerdictBadge from "@/components/VerdictBadge";
import EmptyState from "@/components/EmptyState";
import { formatDistanceToNow } from "date-fns";

export default function RecentAnalyses() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await base44.auth.me();
        const claims = await base44.entities.Claim.filter(
          { created_by_id: user.id },
          "-created_date",
          5
        );
        if (active) setItems(claims);
      } catch {
        if (active) setItems([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold text-foreground">Recent analyses</h2>
        {items && items.length > 0 && (
          <Link
            to="/history"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {items === null ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-card px-6 py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No analyses yet"
          description="Claims you analyze will appear here for quick access."
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {items.map((claim) => (
            <li key={claim.id}>
              <Link
                to="/results"
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/50"
              >
                <p className="line-clamp-1 flex-1 text-sm text-foreground">{claim.text}</p>
                {claim.final_verdict ? (
                  <VerdictBadge verdict={claim.final_verdict} size="sm" />
                ) : (
                  <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {claim.status || "pending"}
                  </span>
                )}
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                  {formatDistanceToNow(new Date(claim.created_date), { addSuffix: true })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}