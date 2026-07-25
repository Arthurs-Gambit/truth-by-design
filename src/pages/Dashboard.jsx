import { LayoutDashboard, BarChart3, Scale, Activity } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import Disclaimer from "@/components/Disclaimer";
import { VERDICT_ORDER, VERDICTS, AGENTS } from "@/lib/verdicts";

const STATS = [
  { icon: LayoutDashboard, label: "Total analyses", value: "—" },
  { icon: Scale, label: "Avg. agent agreement", value: "—" },
  { icon: Activity, label: "Primary strategy", value: "Calibration MoE" },
  { icon: BarChart3, label: "Verdict distribution", value: "—" },
];

export default function Dashboard() {
  return (
    <div>
      <PageHeader
        eyebrow="Research dashboard"
        title="System performance"
        description="Aggregate metrics on analyses run, verdict distribution, and per-agent calibration — a transparency view of the MoE system."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-muted-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 font-heading text-2xl font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Verdict distribution
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Frequency of each six-class verdict across all analyses.
          </p>
          <ul className="mt-5 space-y-3">
            {VERDICT_ORDER.map((v) => {
              const config = VERDICTS[v];
              return (
                <li key={v} className="flex items-center gap-3">
                  <span className="flex w-32 shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full w-0 ${config.bar}`} />
                  </div>
                  <span className="w-8 text-right text-xs text-muted-foreground">—</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Agent calibration
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Historical accuracy weights applied by the MoE.
          </p>
          <ul className="mt-5 space-y-4">
            {Object.entries(AGENTS).map(([key, agent]) => (
              <li key={key} className="flex items-center gap-3">
                <span className={`flex w-24 shrink-0 items-center gap-1.5 text-xs ${agent.accent}`}>
                  <span className={`h-2 w-2 rounded-full ${agent.dot}`} />
                  {agent.label}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-0 bg-muted-foreground/40" />
                </div>
                <span className="w-10 text-right text-xs text-muted-foreground">—</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <EmptyState
          icon={BarChart3}
          title="No data yet"
          description="Run and save analyses to populate system-wide metrics here."
          className="hidden"
        />
        <Disclaimer />
      </div>
    </div>
  );
}