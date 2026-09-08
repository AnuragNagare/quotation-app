import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Printer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getCompanyById } from "@/lib/companies";
import { getEnquiriesByIds, getClientProfiles } from "@/lib/enquiries";
import { getQuoteById, listQuoteLineItems } from "@/lib/quotes";
import { formatINR } from "@/lib/format";
import type { Company, Profile, Quote, QuoteLineItem } from "@/types/database";

const QUOTE_STATUS_VARIANT: Record<string, "default" | "gold" | "success" | "danger" | "info" | "warning"> = {
  draft: "default",
  sent: "info",
  pending: "warning",
  approved: "success",
  revision: "gold",
  cancelled: "danger",
};

function lineTotal(item: QuoteLineItem) {
  return item.quantity * item.unit_price * (1 - item.discount_percent / 100);
}

export function QuotePreview() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [client, setClient] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!quoteId) return;
    setLoading(true);
    getQuoteById(quoteId)
      .then(async (q) => {
        if (!q) {
          setNotFound(true);
          return;
        }
        setQuote(q);
        const [items, comp, enquiryRows] = await Promise.all([
          listQuoteLineItems(q.id),
          getCompanyById(q.company_id),
          getEnquiriesByIds([q.enquiry_id]),
        ]);
        setLineItems(items);
        setCompany(comp);
        const enquiryRow = enquiryRows[0];
        if (enquiryRow) {
          const map = await getClientProfiles([enquiryRow.client_id]);
          setClient(map.get(enquiryRow.client_id) ?? null);
        }
      })
      .finally(() => setLoading(false));
  }, [quoteId]);

  if (loading) {
    return <p className="p-8 text-sm font-semibold text-muted">Loading quote…</p>;
  }

  if (notFound || !quote) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-danger-light text-danger">
          <AlertCircle className="size-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-charcoal">Quote Not Found</h1>
        <Link
          to="/"
          className="mt-2 rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Back Home
        </Link>
      </div>
    );
  }

  const subtotal = lineItems.reduce((sum, item) => sum + lineTotal(item), 0);
  const tax = (subtotal * quote.tax_rate_percent) / 100;
  const grandTotal = subtotal + tax;

  return (
    <div className="min-h-svh bg-cream print:bg-white">
      <div className="sticky top-0 z-10 border-b border-cream-deep bg-white px-6 py-3 shadow-soft print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-charcoal"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2 text-xs font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <Printer className="size-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 print:py-4">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="font-extrabold text-charcoal">{company?.name ?? "Company"}</p>
            {company?.description && (
              <p className="text-xs text-muted">{company.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-charcoal">
              QT-{quote.id.slice(0, 8).toUpperCase()}
            </p>
            <div className="mt-1">
              <Badge variant={QUOTE_STATUS_VARIANT[quote.status] ?? "default"}>{quote.status}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted">
              {new Date(quote.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-muted">
            Billed To
          </p>
          <p className="font-bold text-charcoal">{client?.full_name ?? "Client"}</p>
          <p className="text-sm text-charcoal-soft">{client?.email}</p>
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-soft">
          <div className="px-6 py-4">
            <h2 className="font-extrabold text-charcoal">Line Items</h2>
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-y border-cream-soft text-left text-xs font-semibold text-muted">
                <th className="w-8 px-4 py-3 text-right">#</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Discount</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={item.id} className="border-b border-cream-soft last:border-0">
                  <td className="px-4 py-3 text-right font-mono text-xs text-muted">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-charcoal">{item.name}</td>
                  <td className="px-4 py-3 text-center text-charcoal-soft">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-charcoal-soft">
                    {formatINR(item.unit_price)}
                  </td>
                  <td className="px-4 py-3 text-right text-charcoal-soft">
                    {item.discount_percent > 0 ? `${item.discount_percent}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-charcoal">
                    {formatINR(lineTotal(item))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-cream-deep px-6 py-4">
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm text-charcoal-soft">
                <span>Subtotal</span>
                <span className="font-semibold">{formatINR(subtotal)}</span>
              </div>
              {quote.tax_rate_percent > 0 && (
                <div className="flex justify-between text-sm text-charcoal-soft">
                  <span>Tax ({quote.tax_rate_percent}%)</span>
                  <span className="font-semibold">{formatINR(tax)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-cream-deep pt-2 text-base font-extrabold text-charcoal">
                <span>Grand Total</span>
                <span>{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {quote.notes && (
          <div className="mb-4 rounded-2xl bg-white p-6 shadow-soft">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">Notes</p>
            <p className="text-sm text-charcoal-soft">{quote.notes}</p>
          </div>
        )}

        {quote.terms && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-soft">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">
              Terms &amp; Conditions
            </p>
            <p className="text-sm text-charcoal-soft">{quote.terms}</p>
          </div>
        )}
      </div>
    </div>
  );
}
