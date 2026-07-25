import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ScanSearch, Sparkles, Layers, GitBranch } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Disclaimer from "@/components/Disclaimer";

const CATEGORIES = [
  { value: "other", label: "General" },
  { value: "politics", label: "Politics" },
  { value: "science", label: "Science" },
  { value: "health", label: "Health" },
  { value: "economics", label: "Economics" },
  { value: "history", label: "History" },
  { value: "technology", label: "Technology" },
  { value: "social", label: "Social" },
];

const PIPELINE = [
  {
    icon: Layers,
    title: "Pauli–Frankfurt Pre-check",
    description: "Tests whether the claim is verifiable and meaningful before deeper analysis.",
  },
  {
    icon: Sparkles,
    title: "CRAAP Epistemic Assessment",
    description: "Scores Currency, Relevance, Authority, Accuracy, and Purpose.",
  },
  {
    icon: GitBranch,
    title: "Ethical-Risk Assessment",
    description: "Flags misinformation, harm, and bias risks with mitigations.",
  },
  {
    icon: ScanSearch,
    title: "Six-Class Factual Verdict",
    description: "Resolves to True, Mostly True, Half True, Mostly False, False, or Pants on Fire.",
  },
];

export default function Analyze() {
  const navigate = useNavigate();
  const [claim, setClaim] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("other");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!claim.trim()) return;
    navigate("/processing", { state: { claim: claim.trim(), source, category } });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Mixture-of-Experts Fact-Checking"
        title="Truth by Design"
        description="Submit a factual claim. Three independent AI agents analyze it through the same ordered pipeline, then a calibration-weighted MoE combines their outputs into one transparent consensus."
      />

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <label htmlFor="claim" className="mb-2 block text-sm font-medium text-foreground">
            Claim to verify
          </label>
          <textarea
            id="claim"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            rows={5}
            placeholder="e.g. “The global temperature has risen by 1.2°C since the pre-industrial era.”"
            className="w-full resize-y rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="source" className="mb-2 block text-sm font-medium text-foreground">
                Source (optional)
              </label>
              <input
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="URL or citation"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="category" className="mb-2 block text-sm font-medium text-foreground">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Analysis runs three agents in parallel.
            </p>
            <button
              type="submit"
              disabled={!claim.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Analyze Claim
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Shared analysis pipeline
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Every agent runs the same four ordered stages.
            </p>
            <ol className="mt-4 space-y-4">
              {PIPELINE.map(({ icon: Icon, title, description }, i) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-xs font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      {title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}