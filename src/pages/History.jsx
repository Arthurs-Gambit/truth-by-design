import { Link } from "react-router-dom";
import { History as HistoryIcon, ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import Disclaimer from "@/components/Disclaimer";

export default function History() {
  return (
    <div>
      <PageHeader
        eyebrow="Analysis history"
        title="Saved analyses"
        description="Your submitted claims and their consensus results, saved for later review and comparison."
      />

      <EmptyState
        icon={HistoryIcon}
        title="No saved analyses yet"
        description="Claims you analyze and save will be listed here with their verdicts and timestamps."
        action={
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Analyze a claim
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}