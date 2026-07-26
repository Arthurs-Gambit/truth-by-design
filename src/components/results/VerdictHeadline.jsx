import { VERDICTS } from "@/lib/verdicts";
import { AlertTriangle } from "lucide-react";

export default function VerdictHeadline({ verdict, confidence, degraded }) {
  const config = VERDICTS[verdict] || VERDICTS.half_true;
  const Icon = config.icon;
  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-6`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Consensus verdict
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full border ${config.border} ${config.bg} ${config.text}`}
          >
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <p className={`font-heading text-2xl font-bold ${config.text}`}>{config.label}</p>
            <p className="text-xs text-muted-foreground">Six-class factual verdict</p>
          </div>
        </div>
        <div className="ml-auto text-right">
          <p className="font-heading text-3xl font-bold text-foreground">
            {Math.round(confidence * 100)}%
          </p>
          <p className="text-xs text-muted-foreground">Overall confidence</p>
        </div>
      </div>
      {degraded && (
        <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-amber-800">
          <AlertTriangle className="h-3.5 w-3.5" />
          Degraded consensus — one provider failed; computed from 2 valid agents.
        </p>
      )}
    </div>
  );
}