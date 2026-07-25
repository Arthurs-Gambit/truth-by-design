import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StageProgress({ stages, currentStage }) {
  return (
    <ol className="space-y-3">
      {stages.map((label, i) => {
        const done = i < currentStage;
        const active = i === currentStage;
        return (
          <li key={label} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary bg-primary/10 text-primary",
                !done && !active && "border-border bg-background text-muted-foreground"
              )}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : active ? <Loader2 className="h-4 w-4 animate-spin" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-sm",
                done || active ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}