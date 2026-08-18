import { useParams } from "react-router-dom";
import { Printer, Mail, AlertCircle } from "lucide-react";

import { getQuotation } from "@/data/quotationStore";
import { formatINR } from "@/lib/format";
import type { QuotationLineItem } from "@/types";

function lineTotal(item: QuotationLineItem) {
  return item.quantity * item.unitPrice * (1 - item.discountPercent / 100);
}

export function PublicQuote() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const quote = quoteId ? getQuotation(quoteId) : undefined;

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!quote) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-danger-light text-danger">
          <AlertCircle className="size-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-charcoal">Quote Not Found</h1>
        <p className="max-w-sm text-sm text-muted">
          This link may have expired or been revoked. Please request a new link from the ROXY
          team.
        </p>
        <a
          href="mailto:support@roxyevents.com"
          className="mt-2 rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Contact ROXY
        </a>
      </div>
    );
  }

  const subtotal = quote.lineItems.reduce((sum, item) => sum + lineTotal(item), 0);
  const tax = (subtotal * quote.taxRatePercent) / 100;
  const grandTotal = subtotal + tax;

  return (
    <div className="min-h-svh bg-cream print:bg-white">
      {/* Top action bar — hidden on print */}
      <div className="print:hidden sticky top-0 z-10 border-b border-cream-deep bg-white px-6 py-3 shadow-soft">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gold text-white shadow-soft">
              <span className="text-base font-extrabold">R</span>
            </div>
            <div>
              <p className="text-sm font-extrabold text-charcoal">ROXY</p>
              <p className="text-[10px] text-muted">Events. Perfected.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="mailto:support@roxyevents.com"
              className="flex items-center gap-1.5 rounded-xl border border-cream-deep bg-white px-4 py-2 text-xs font-semibold text-charcoal-soft shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <Mail className="size-3.5" />
              Contact Us
            </a>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2 text-xs font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <Printer className="size-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* Quote document */}
      <div className="mx-auto max-w-3xl px-6 py-10 print:py-4">
        {/* Document header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold text-white">
                <span className="text-lg font-extrabold">R</span>
              </div>
              <div>
                <p className="font-extrabold text-charcoal">ROXY Events &amp; Production</p>
                <p className="text-xs text-muted">402, Corporate Avenue, Andheri East, Mumbai</p>
              </div>
            </div>
            <p className="text-xs text-muted">GSTIN: 27AAACR1234B1ZQ</p>
            <p className="text-xs text-muted">support@roxyevents.com · +91 98765 00000</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-charcoal">{quote.id}</p>
            <span
              className={`mt-1 inline-block rounded-pill px-3 py-1 text-xs font-bold capitalize ${
                quote.status === "approved"
                  ? "bg-success-light text-success"
                  : quote.status === "cancelled"
                  ? "bg-danger-light text-danger"
                  : "bg-gold-light text-gold-dark"
              }`}
            >
              {quote.status}
            </span>
            <p className="mt-2 text-xs text-muted">{quote.revisionLabel}</p>
          </div>
        </div>

        {/* Client & Event details */}
        <div className="mb-6 grid grid-cols-2 gap-6 rounded-2xl bg-white p-6 shadow-soft">
          <div>
            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-muted">
              Billed To
            </p>
            <p className="font-bold text-charcoal">{quote.clientName}</p>
            <p className="text-sm text-charcoal-soft">{quote.recipientContact}</p>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-muted">
              Event Details
            </p>
            <p className="font-bold text-charcoal">{quote.eventName}</p>
            <p className="text-sm text-charcoal-soft">{quote.venue}</p>
            <p className="text-sm text-muted">{quote.eventDate}</p>
          </div>
        </div>

        {/* Line items table */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-soft">
          <div className="px-6 py-4">
            <h2 className="font-extrabold text-charcoal">Equipment &amp; Services</h2>
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-y border-cream-soft text-left text-xs font-semibold text-muted">
                <th className="w-8 px-4 py-3 text-right">#</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Discount</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item, idx) => (
                <tr key={item.id} className="border-b border-cream-soft last:border-0">
                  <td className="px-4 py-3 text-right font-mono text-xs text-muted">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-charcoal">{item.name}</td>
                  <td className="px-4 py-3 text-charcoal-soft">{item.category}</td>
                  <td className="px-4 py-3 text-center text-charcoal-soft">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-charcoal-soft">
                    {formatINR(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-right text-charcoal-soft">
                    {item.discountPercent > 0 ? `${item.discountPercent}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-charcoal">
                    {formatINR(lineTotal(item))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t border-cream-deep px-6 py-4">
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm text-charcoal-soft">
                <span>Subtotal</span>
                <span className="font-semibold">{formatINR(subtotal)}</span>
              </div>
              {quote.taxRatePercent > 0 && (
                <div className="flex justify-between text-sm text-charcoal-soft">
                  <span>GST ({quote.taxRatePercent}%)</span>
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

        {/* Notes */}
        {quote.notes && (
          <div className="mb-4 rounded-2xl bg-white p-6 shadow-soft">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">
              Notes
            </p>
            <p className="text-sm text-charcoal-soft">{quote.notes}</p>
          </div>
        )}

        {/* Terms */}
        {quote.terms && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-soft">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">
              Terms &amp; Conditions
            </p>
            <p className="text-sm text-charcoal-soft">{quote.terms}</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted">
          This quotation is valid for 7 days from the date of issue. For questions, contact{" "}
          <a href="mailto:support@roxyevents.com" className="text-gold-dark underline">
            support@roxyevents.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
