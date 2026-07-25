import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Disclaimer({ className }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600",
        className
      )}
    >
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
      <p>
        <span className="font-semibold text-slate-700">AI-generated assessment.</span>{" "}
        Verify consequential claims with authoritative sources and qualified human review.
      </p>
    </div>
  );
}