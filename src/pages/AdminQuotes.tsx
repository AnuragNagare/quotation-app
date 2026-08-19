import { useEffect, useMemo, useState } from "react";
import { FileText, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { adminDeleteQuote, listAllQuotesAdmin } from "@/lib/admin";
import { listAllCompanies } from "@/lib/companies";
import { getClientProfiles } from "@/lib/enquiries";
import { listQuoteLineItems } from "@/lib/quotes";
import { supabase } from "@/lib/supabaseClient";
import { formatINR } from "@/lib/format";
import type { Company, Profile, Quote, QuoteLineItem } from "@/types/database";

const STATUS_VARIANT: Record<string, "default" | "gold" | "success" | "danger"> = {
  draft: "default",
  sent: "gold",
  pending: "gold",
  approved: "success",
  cancelled: "danger",
  revision: "gold",
};

export function AdminQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [companies, setCompanies] = useState<Map<string, Company>>(new Map());
  const [clients, setClients] = useState<Map<string, Profile>>(new Map());
  const [quoteToEnquiryClient, setQuoteToEnquiryClient] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<QuoteLineItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Quote | null>(null);

  async function load() {
    setLoading(true);
    try {
      const rows = await listAllQuotesAdmin();
      const allCompanies = await listAllCompanies();
      const companyMap = new Map(allCompanies.map((c) => [c.id, c]));

      const enquiryIds = [...new Set(rows.map((q) => q.enquiry_id))];
      const { data: enquiryRows } = await supabase
        .from("roxy_enquiries")
        .select("id, client_id")
        .in("id", enquiryIds.length ? enquiryIds : ["00000000-0000-0000-0000-000000000000"]);

      const enquiryToClient = new Map((enquiryRows ?? []).map((e) => [e.id, e.client_id]));
      const quoteToClient = new Map(rows.map((q) => [q.id, enquiryToClient.get(q.enquiry_id) ?? ""]));

      const clientMap = await getClientProfiles([...new Set([...enquiryToClient.values()])]);

      setQuotes(rows);
      setCompanies(companyMap);
      setClients(clientMap);
      setQuoteToEnquiryClient(quoteToClient);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleExpand(quote: Quote) {
    if (expandedId === quote.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(quote.id);
    setExpandedItems(await listQuoteLineItems(quote.id));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await adminDeleteQuote(deleteTarget.id);
    setQuotes((prev) => prev.filter((q) => q.id !== deleteTarget.id));
  }

  const grandTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of expandedItems) {
      map.set(
        item.quote_id,
        (map.get(item.quote_id) ?? 0) + item.quantity * item.unit_price * (1 - item.discount_percent / 100)
      );
    }
    return map;
  }, [expandedItems]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">Quotes</h1>
        <p className="mt-1 text-sm text-muted">
          Platform-wide, view-only — content can only be edited by the business user who owns it.
        </p>
      </div>

      {loading ? (
        <p className="text-sm font-semibold text-muted">Loading…</p>
      ) : quotes.length === 0 ? (
        <div className="rounded-card border border-dashed border-cream-deep bg-white p-10 text-center">
          <FileText className="mx-auto mb-3 size-8 text-muted" />
          <p className="text-sm font-bold text-charcoal">No quotes yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {quotes.map((quote) => {
            const company = companies.get(quote.company_id);
            const clientId = quoteToEnquiryClient.get(quote.id);
            const client = clientId ? clients.get(clientId) : undefined;
            const expanded = expandedId === quote.id;

            return (
              <div
                key={quote.id}
                className="overflow-hidden rounded-card border border-black/[0.03] bg-white shadow-soft"
              >
                <button
                  onClick={() => toggleExpand(quote)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div>
                    <p className="text-sm font-bold text-charcoal">
                      {company?.name ?? "Unknown company"} → {client?.full_name || client?.email || "Unknown client"}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(quote.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · Tax {quote.tax_rate_percent}%
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={STATUS_VARIANT[quote.status] ?? "default"}>{quote.status}</Badge>
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(quote);
                      }}
                      className="flex size-8 items-center justify-center rounded-lg text-danger hover:bg-danger-light"
                      aria-label="Delete quote"
                    >
                      <Trash2 className="size-4" />
                    </span>
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-black/[0.03] bg-cream-soft px-5 py-3">
                    {expandedItems.length === 0 ? (
                      <p className="text-xs text-muted">No line items.</p>
                    ) : (
                      <>
                        {expandedItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-1 text-xs">
                            <span className="text-charcoal-soft">
                              {item.name} × {item.quantity}
                              {item.discount_percent > 0 && ` (−${item.discount_percent}%)`}
                            </span>
                            <span className="font-semibold text-charcoal">
                              {formatINR(item.quantity * item.unit_price * (1 - item.discount_percent / 100))}
                            </span>
                          </div>
                        ))}
                        <div className="mt-1 flex items-center justify-between border-t border-cream-deep pt-1 text-xs font-bold">
                          <span className="text-charcoal">Subtotal</span>
                          <span className="text-charcoal">
                            {formatINR(grandTotals.get(quote.id) ?? 0)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this quote?"
        description="This also deletes its line items and revision history. This cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
