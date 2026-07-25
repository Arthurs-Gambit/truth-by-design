import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import HowItWorks from "@/components/analyze/HowItWorks";
import RecentAnalyses from "@/components/analyze/RecentAnalyses";

const MAX_LENGTH = 1000;
const MIN_LENGTH = 10;

const DOMAINS = [
  { value: "auto", label: "Auto-detect" },
  { value: "political", label: "Political" },
  { value: "scientific", label: "Scientific" },
  { value: "general", label: "General" },
];

const EXAMPLES = [
  "The global average temperature has risen by 1.2°C since the pre-industrial era.",
  "A new study shows drinking coffee daily reduces lifespan by 20%.",
  "The unemployment rate fell to its lowest level in 50 years last quarter.",
  "Solar panels now generate electricity more cheaply than coal in most countries.",
];

export default function Analyze() {
  const navigate = useNavigate();
  const [claim, setClaim] = useState("");
  const [domain, setDomain] = useState("auto");
  const [context, setContext] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (value) => {
    if (!value.trim()) return "Please enter a claim to analyze.";
    if (value.trim().length < MIN_LENGTH)
      return `Claim is too short — at least ${MIN_LENGTH} characters.`;
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = validate(claim);
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      navigate("/processing", {
        state: { claim: claim.trim(), domain, context: context.trim() },
      });
    }, 600);
  };

  const remaining = MAX_LENGTH - claim.length;

  return (
    <div className="space-y-10">
      <header>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-primary">
          Mixture-of-Experts Fact-Checking
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Truth by Design
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Submit a factual claim and three independent AI agents analyze it through the same
          ordered pipeline, then a calibration-weighted mixture-of-experts combines their
          outputs into one transparent consensus.
        </p>
      </header>

      <HowItWorks />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="claim" className="text-sm font-medium text-foreground">
            Claim to verify
          </label>
          <span
            className={`text-xs ${
              remaining < 50 ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {remaining} characters left
          </span>
        </div>
        <textarea
          id="claim"
          value={claim}
          onChange={(e) => {
            const next = e.target.value.slice(0, MAX_LENGTH);
            setClaim(next);
            if (error) setError("");
          }}
          rows={5}
          maxLength={MAX_LENGTH}
          placeholder="e.g. “The global temperature has risen by 1.2°C since the pre-industrial era.”"
          aria-invalid={!!error}
          className={`w-full resize-y rounded-lg border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            error ? "border-destructive" : "border-input"
          }`}
        />
        {error && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}

        {/* Example chips */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setClaim(ex);
                  setError("");
                }}
                className="max-w-full truncate rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-foreground"
                title={ex}
              >
                {ex.length > 48 ? ex.slice(0, 48) + "…" : ex}
              </button>
            ))}
          </div>
        </div>

        {/* Domain selector */}
        <div className="mt-6">
          <span className="mb-2 block text-sm font-medium text-foreground">Domain</span>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDomain(d.value)}
                className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                  domain === d.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional context */}
        <div className="mt-6">
          <label htmlFor="context" className="mb-2 block text-sm font-medium text-foreground">
            Context <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. date, speaker, location, or source"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Submit */}
        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                Analyze Claim
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <RecentAnalyses />
    </div>
  );
}