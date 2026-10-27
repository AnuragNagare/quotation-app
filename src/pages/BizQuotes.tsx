import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Eye, FileSpreadsheet, FileText, Pencil, Search, Send, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanies } from "@/context/CompanyContext";
import { getClientProfiles } from "@/lib/enquiries";
import { exportQuoteToExcel } from "@/lib/exportQuote";
import { formatINR } from "@/lib/format";
import { listQuoteLineItems, listQuoteSummaries, updateQuote, type QuoteSummary } from "@/lib/quotes";
import type { QuoteStatus } from "@/types/database";

const STATUS_VARIANT: Record<string, "default" | "gold" | "success" | "danger"> = {
  draft: "default",
  sent: "gold",
  pending: "gold",
  approved: "success",
  cancelled: "danger",
  revision: "gold",
};

const STATUS_FILTERS: ("all" | QuoteStatus)[] = [
  "all",
  "draft",
  "sent",
  "pending",
  "approved",
  "revision",
  "cancelled",
];

// Statuses a business user can still push to the client; anything else has
// already been sent or is closed out.
const SENDABLE: QuoteStatus[] = ["draft", "revision"];

function quoteNumber(id: string) {
  return `QT-${id.slice(0, 8).toUpperCase()}`;
}

function totalWithTax(q: QuoteSummary) {
  return q.subtotal * (1 + Number(q.tax_rate_percent) / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface Toast {
  id: string;
  message: string;
  tone: "success" | "error";
}

export function BizQuotes() {
  const { activeCompany, companies } = useCompanies();

  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | QuoteStatus>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function toast(message: string, tone: Toast["tone"] = "success") {
    const id = Date.now().toString() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  useEffect(() => {
    if (!activeCompany) return;
    setLoading(true);
    setError(null);
    listQuoteSummaries(activeCompany.id)
      .then(setQuotes)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCompany?.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quotes.filter((quote) => {
      if (statusFilter !== "all" && quote.status !== statusFilter) return false;
      if (!q) return true;
      return (
        quoteNumber(quote.id).toLowerCase().includes(q) ||
        quote.client_name.toLowerCase().includes(q) ||
        quote.client_email.toLowerCase().includes(q)
      );
    });
  }, [quotes, query, statusFilter]);

  async function handleSend(quote: QuoteSummary) {
    setBusyId(quote.id);
    try {
      const updated = await updateQuote(quote.id, { status: "sent" });
      setQuotes((prev) => prev.map((x) => (x.id === quote.id ? { ...x, ...updated } : x)));
      toast(`${quoteNumber(quote.id)} sent to ${quote.client_name || quote.client_email}.`);
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleExport(quote: QuoteSummary) {
    if (!activeCompany) return;
    setBusyId(quote.id);
    try {
      const [lineItems, clients] = await Promise.all([
        listQuoteLineItems(quote.id),
        getClientProfiles([quote.client_id]),
      ]);
      await exportQuoteToExcel({
        quote,
        lineItems,
        company: activeCompany,
        client: clients.get(quote.client_id) ?? null,
      });
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusyId(null);
    }
  }

  function Actions({ quote }: { quote: QuoteSummary }) {
    const busy = busyId === quote.id;
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" asChild>
          <Link to={`/biz/quotes/${quote.enquiry_id}`}>
            <Pencil className="size-3.5" />
            Details
          </Link>
        </Button>
        <Button size="sm" variant="secondary" asChild>
          <Link to={`/quotes/${quote.id}/preview`}>
            <Eye className="size-3.5" />
            Preview
          </Link>
        </Button>
        <Button size="sm" variant="secondary" onClick={() => handleExport(quote)} disabled={busy}>
          <FileSpreadsheet className="size-3.5" />
          Excel
        </Button>
        {SENDABLE.includes(quote.status) && (
          <Button size="sm" onClick={() => handleSend(quote)} disabled={busy}>
            <Send className="size-3.5" />
            Send to client
          </Button>
        )}
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
        <FileText className="size-8 text-muted" />
        <p className="text-sm font-bold text-charcoal">No company selected</p>
        <p className="max-w-sm text-xs text-muted">
          {companies.length === 0
            ? "Create a company first to start quoting."
            : "Choose a company to view its quotes."}
        </p>
        <Button asChild className="mt-2">
          <Link to="/companies">Go to Companies</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2 sm:right-6 sm:top-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-in slide-in-from-top-4 fade-in flex max-w-sm items-start gap-3 rounded-2xl border border-black/[0.04] bg-white p-4 shadow-soft-lg duration-300"
          >
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                t.tone === "error" ? "bg-danger-light text-danger" : "bg-success-light text-success"
              }`}
            >
              {t.tone === "error" ? <X className="size-4" /> : <CheckCircle2 className="size-4" />}
            </div>
            <p className="flex-1 text-sm font-semibold text-charcoal">{t.message}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">Quotes</h1>
          <p className="mt-1 text-sm text-muted">
            For <span className="font-semibold text-charcoal">{activeCompany.name}</span>
          </p>
        </div>
        <div className="rounded-card border border-black/[0.03] bg-white px-5 py-3 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Total quotes
          </p>
          <p className="text-2xl font-extrabold text-charcoal">{loading ? "…" : quotes.length}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by quote no. or client…"
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | QuoteStatus)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All statuses" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="text-sm font-semibold text-muted">Loading quotes…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
          <FileText className="mx-auto mb-3 size-8 text-muted" />
          <p className="text-sm font-bold text-charcoal">
            {quotes.length === 0 ? "No quotes yet" : "No quotes match your filters"}
          </p>
          {quotes.length === 0 && (
            <p className="mt-1 text-xs text-muted">
              Open an enquiry and convert it to a quote to see it here.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-black/[0.03] bg-white shadow-soft">
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="bg-cream-soft text-xs font-semibold text-charcoal-soft">
              <tr>
                <th className="px-5 py-3">Quote</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Total (incl. tax)</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {filtered.map((quote) => (
                <tr key={quote.id}>
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-charcoal">
                    {quoteNumber(quote.id)}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-charcoal">{quote.client_name || "Unnamed"}</p>
                    <p className="text-xs text-muted">{quote.client_email}</p>
                  </td>
                  <td className="px-5 py-3 text-charcoal-soft">{formatDate(quote.created_at)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-charcoal">
                    {formatINR(totalWithTax(quote))}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={STATUS_VARIANT[quote.status] ?? "default"}>{quote.status}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Actions quote={quote} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divide-y divide-black/[0.03] md:hidden">
            {filtered.map((quote) => (
              <div key={quote.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-muted">
                      {quoteNumber(quote.id)} · {formatDate(quote.created_at)}
                    </p>
                    <p className="truncate font-semibold text-charcoal">
                      {quote.client_name || "Unnamed"}
                    </p>
                    <p className="truncate text-xs text-muted">{quote.client_email}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[quote.status] ?? "default"}>{quote.status}</Badge>
                </div>
                <p className="text-sm font-bold text-charcoal">
                  {formatINR(totalWithTax(quote))}
                  <span className="ml-1 text-xs font-medium text-muted">incl. tax</span>
                </p>
                <Actions quote={quote} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
