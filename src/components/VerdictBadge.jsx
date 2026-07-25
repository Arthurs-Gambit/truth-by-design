import { cn } from "@/lib/utils";
import { VERDICTS } from "@/lib/verdicts";

export default function VerdictBadge({ verdict, size = "md", className }) {
  const config = VERDICTS[verdict] || VERDICTS.half_true;
  const Icon = config.icon;
  const sizes = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.text,
        config.bg,
        config.border,
        sizes[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
}