import { Trash2 } from "lucide-react";
import VerdictBadge from "@/components/VerdictBadge";
import { format } from "date-fns";

const DOMAIN_LABELS = {
  politics: "Political",
  science: "Scientific",
  other: "General",
  health: "Health",
  economics: "Economics",
  history: "History",
  technology: "Technology",
  social: "Social",
};

export default function HistoryItem({ item, onOpen, onDelete }) {
  const { claim } = item;
  return (
    <li className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="min-w-0 flex-1 text-left"
      >
        <p className="line-clamp-2 text-sm font-medium text-foreground">{claim.text}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-border bg-secondary/50 px-2 py-0.5">
            {DOMAIN_LABELS[claim.category] || "General"}
          </span>
          <span>{format(new Date(claim.created_date), "MMM d, yyyy")}</span>
        </div>
      </button>
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex flex-col items-end gap-1">
          {claim.final_verdict ? (
            <VerdictBadge verdict={claim.final_verdict} size="sm" />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
          {claim.consensus_confidence != null && (
            <span className="text-xs text-muted-foreground">
              {Math.round(claim.consensus_confidence * 100)}%
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(item)}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete analysis"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}