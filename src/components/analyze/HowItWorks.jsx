import { Fragment } from "react";
import { ArrowRight, FileText, Users, ListOrdered, Scale, ClipboardCheck } from "lucide-react";

const STEPS = [
  { icon: FileText, label: "Claim", sub: "You submit a factual claim" },
  { icon: Users, label: "3 Independent Agents", sub: "OpenAI · Claude · Gemini" },
  { icon: ListOrdered, label: "Ordered Reasoning Gates", sub: "Pre-check · CRAAP · Ethics · Verdict" },
  { icon: Scale, label: "Calibrated MoE", sub: "Weighted by accuracy" },
  { icon: ClipboardCheck, label: "Transparent Result", sub: "Consensus + alternatives" },
];

export default function HowItWorks() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-heading text-base font-semibold text-foreground">How it works</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        A shared, auditable pipeline from claim to consensus.
      </p>
      <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {STEPS.map(({ icon: Icon, label, sub }, i) => (
          <Fragment key={label}>
            <div className="flex-1 rounded-lg border border-border bg-background px-3 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold text-foreground">{label}</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{sub}</p>
            </div>
            {i < STEPS.length - 1 && (
              <ArrowRight className="mx-auto hidden h-4 w-4 shrink-0 text-muted-foreground/50 sm:block" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}