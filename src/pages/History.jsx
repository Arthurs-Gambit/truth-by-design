import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { History as HistoryIcon, Search, Loader2, ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import Disclaimer from "@/components/Disclaimer";
import HistoryItem from "@/components/history/HistoryItem";
import ConfirmDeleteDialog from "@/components/history/ConfirmDeleteDialog";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { VERDICTS, VERDICT_ORDER } from "@/lib/verdicts";

const DOMAIN_FILTERS = [
  { value: "all", label: "All domains" },
  { value: "politics", label: "Political" },
  { value: "science", label: "Scientific" },
  { value: "other", label: "General" },
];

export default function History() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState(null);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("all");
  const [verdict, setVerdict] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await base44.auth.me();
        const claims = await base44.entities.Claim.filter(
          { created_by_id: user.id },
          "-created_date",
          100
        );
        if (active) setItems(claims.map((c) => ({ claim: c })));
      } catch {
        if (active) setItems([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!items) return null;
    const q = query.trim().toLowerCase();
    return items.filter(({ claim }) => {
      if (domain !== "all" && claim.category !== domain) return false;
      if (verdict !== "all" && claim.final_verdict !== verdict) return false;
      if (q && !(claim.text || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, domain, verdict]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await base44.entities.AnalysisHistory.deleteMany({ claim_id: deleteTarget.claim.id });
      await base44.entities.Claim.delete(deleteTarget.claim.id);
      setItems((prev) => prev.filter((i) => i.claim.id !== deleteTarget.claim.id));
      setDeleteTarget(null);
      toast({ title: "Analysis deleted" });
    } catch (e) {
      toast({ title: "Could not delete", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const open = (item) => navigate("/results", { state: { claimId: item.claim.id } });

  return (
    <div>
      <PageHeader
        eyebrow="Analysis history"
        title="Saved analyses"
        description="Your submitted claims and their consensus results, saved for later review and comparison."
      />

      {items === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
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
      ) : (
        <>
          {/* Filters */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search claim text…"
                className="pl-9"
              />
            </div>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOMAIN_FILTERS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={verdict} onValueChange={setVerdict}>
              <SelectTrigger className="sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All verdicts</SelectItem>
                {VERDICT_ORDER.map((v) => (
                  <SelectItem key={v} value={v}>
                    {VERDICTS[v].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matches"
              description="Try a different keyword, domain, or verdict filter."
            />
          ) : (
            <ul className="space-y-3">
              {filtered.map((item) => (
                <HistoryItem
                  key={item.claim.id}
                  item={item}
                  onOpen={open}
                  onDelete={setDeleteTarget}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <div className="mt-8">
        <Disclaimer />
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        item={deleteTarget}
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}