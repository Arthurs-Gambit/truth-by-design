import {
  CheckCircle2,
  ShieldCheck,
  Scale,
  AlertTriangle,
  XCircle,
  Flame,
} from "lucide-react";

// Six-class verdict system. Every verdict pairs a color with a text label + icon.
// Never rely on color alone — always render the label and icon alongside.
export const VERDICTS = {
  true: {
    label: "True",
    icon: CheckCircle2,
    text: "text-emerald-800",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-700",
    bar: "bg-emerald-700",
    softText: "text-emerald-700",
  },
  mostly_true: {
    label: "Mostly True",
    icon: ShieldCheck,
    text: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
    dot: "bg-teal-600",
    bar: "bg-teal-600",
    softText: "text-teal-700",
  },
  half_true: {
    label: "Half True",
    icon: Scale,
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-600",
    bar: "bg-amber-600",
    softText: "text-amber-700",
  },
  mostly_false: {
    label: "Mostly False",
    icon: AlertTriangle,
    text: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-600",
    bar: "bg-orange-600",
    softText: "text-orange-700",
  },
  false: {
    label: "False",
    icon: XCircle,
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-600",
    bar: "bg-red-600",
    softText: "text-red-700",
  },
  pants_on_fire: {
    label: "Pants on Fire",
    icon: Flame,
    text: "text-rose-900",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-800",
    bar: "bg-rose-800",
    softText: "text-rose-800",
  },
};

export const VERDICT_ORDER = [
  "true",
  "mostly_true",
  "half_true",
  "mostly_false",
  "false",
  "pants_on_fire",
];

export const AGENTS = {
  openai: { label: "OpenAI", accent: "text-emerald-700", dot: "bg-emerald-600" },
  claude: { label: "Claude", accent: "text-orange-700", dot: "bg-orange-600" },
  gemini: { label: "Gemini", accent: "text-blue-700", dot: "bg-blue-600" },
};

export const STRATEGIES = {
  moe: {
    label: "Calibration-Weighted MoE",
    description:
      "Primary strategy. Each agent's output is weighted by its historical calibration accuracy, producing a single transparent consensus.",
  },
  majority: {
    label: "Majority Voting",
    description: "Each agent casts one equal vote; the verdict with the most votes wins.",
  },
  confidence_weighted: {
    label: "Confidence-Weighted Voting",
    description: "Votes weighted by each agent's self-reported confidence score.",
  },
  gate_routing: {
    label: "Gate-Specific Routing",
    description: "Routes sub-questions to the agent with the best per-gate expertise.",
  },
};