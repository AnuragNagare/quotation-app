import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  listLineItemsForEnquiries,
  listMyEnquiries,
  type EnquiryLineItemDetail,
} from "@/lib/enquiries";
import { getQuoteByEnquiryAndCompany, listQuoteLineItems } from "@/lib/quotes";
import { formatINR } from "@/lib/format";
import type { Enquiry, Quote, QuoteLineItem } from "@/types/database";

const ENQUIRY_STATUS_VARIANT: Record<string, "default" | "gold" | "success"> = {
  open: "default",
  quoted: "gold",
  closed: "success",
};

const QUOTE_STATUS_VARIANT: Record<string, "default" | "gold" | "success" | "danger"> = {
  draft: "default",
  sent: "gold",
  pending: "gold",
  approved: "success",
  cancelled: "danger",
  revision: "gold",
};

function quoteTotal(items: QuoteLineItem[], taxRatePercent: number) {
  const subtotal = items.reduce(
    (sum, i) => sum + i.quantity * i.unit_price * (1 - i.discount_percent / 100),
    0
  );
  const tax = (subtotal * taxRatePercent) / 100;
  return { subtotal, tax, grandTotal: subtotal + tax };
}

export function MyEnquiries() {
  const { profile } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [lineItems, setLineItems] = useState<EnquiryLineItemDetail[]>([]);
  const [quotesByKey, setQuotesByKey] = useState<Map<string, Quote>>(new Map());
  const [quoteItemsByQuoteId, setQuoteItemsByQuoteId] = useState<Map<string, QuoteLineItem[]>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    listMyEnquiries(profile.id)
      .then(async (rows) => {
        setEnquiries(rows);
        const items = await listLineItemsForEnquiries(rows.map((r) => r.id));
        setLineItems(items);

        const pairs = new Map<string, { enquiryId: string; companyId: string }>();
        for (const item of items) {
          pairs.set(`${item.enquiry_id}|${item.company_id}`, {
            enquiryId: item.enquiry_id,
            companyId: item.company_id,
          });
        }

        const pairList = [...pairs.values()];
        const quotes = await Promise.all(
          pairList.map((p) => getQuoteByEnquiryAndCompany(p.enquiryId, p.companyId))
        );
        const quoteMap = new Map<string, Quote>();
        pairList.forEach((pair, i) => {
          const quote = quotes[i];
          if (quote) quoteMap.set(`${pair.enquiryId}|${pair.companyId}`, quote);
        });
        setQuotesByKey(quoteMap);

        const quoteList = [...quoteMap.values()];
        const quoteLineItemLists = await Promise.all(
          quoteList.map((q) => listQuoteLineItems(q.id))
        );
        const quoteItemsMap = new Map<string, QuoteLineItem[]>();
        quoteList.forEach((q, i) => quoteItemsMap.set(q.id, quoteLineItemLists[i]));
        setQuoteItemsByQuoteId(quoteItemsMap);
      })
      .finally(() => setLoading(false));
  }, [profile]);

  const itemsByEnquiry = useMemo(() => {
    const map = new Map<string, EnquiryLineItemDetail[]>();
    for (const item of lineItems) {
      if (!map.has(item.enquiry_id)) map.set(item.enquiry_id, []);
      map.get(item.enquiry_id)!.push(item);
    }
    return map;
  }, [lineItems]);

  if (loading) {
    return <p className="text-sm font-semibold text-muted">Loading your enquiries…</p>;
  }

  if (enquiries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
        <Inbox className="size-8 text-muted" />
        <p className="text-sm font-bold text-charcoal">No enquiries yet</p>
        <Button asChild className="mt-2">
          <Link to="/marketplace">Browse the Marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">My Enquiries</h1>

      <div className="flex flex-col gap-4">
        {enquiries.map((enquiry) => {
          const items = itemsByEnquiry.get(enquiry.id) ?? [];
          const byCompany = new Map<string, { name: string; items: EnquiryLineItemDetail[] }>();
          for (const item of items) {
            if (!byCompany.has(item.company_id)) {
              byCompany.set(item.company_id, { name: item.companyName, items: [] });
            }
            byCompany.get(item.company_id)!.items.push(item);
          }

          let enquiryTotal = 0;

          const companyBlocks = [...byCompany.entries()].map(([companyId, group]) => {
            const quote = quotesByKey.get(`${enquiry.id}|${companyId}`);
            const quoteItems = quote ? quoteItemsByQuoteId.get(quote.id) ?? [] : [];

            if (quote) {
              const { tax, grandTotal } = quoteTotal(quoteItems, quote.tax_rate_percent);
              enquiryTotal += grandTotal;
              return (
                <div key={companyId} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-charcoal-soft">{group.name}</p>
                    <Badge variant={QUOTE_STATUS_VARIANT[quote.status] ?? "default"}>
                      Quote {quote.status}
                    </Badge>
                  </div>
                  {quoteItems.map((item) => (
                    <div key={item.id} className="mt-1.5 flex items-center justify-between text-sm">
                      <span className="text-charcoal-soft">
                        {item.name} × {item.quantity}
                        {item.discount_percent > 0 && ` (−${item.discount_percent}%)`}
                      </span>
                      <span className="font-semibold text-charcoal">
                        {formatINR(item.quantity * item.unit_price * (1 - item.discount_percent / 100))}
                      </span>
                    </div>
                  ))}
                  <div className="mt-1.5 flex items-center justify-between border-t border-cream-deep pt-1.5 text-xs text-muted">
                    <span>Tax ({quote.tax_rate_percent}%)</span>
                    <span>{formatINR(tax)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm font-bold text-charcoal">
                    <span>Total</span>
                    <span>{formatINR(grandTotal)}</span>
                  </div>
                </div>
              );
            }

            const estimate = group.items.reduce(
              (sum, i) => sum + i.catalogItemPrice * i.quantity,
              0
            );
            enquiryTotal += estimate;
            return (
              <div key={companyId} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-charcoal-soft">{group.name}</p>
                  <span className="text-[11px] font-semibold text-muted">Awaiting quote</span>
                </div>
                {group.items.map((item) => (
                  <div key={item.id} className="mt-1.5 flex items-center justify-between text-sm">
                    <span className="text-charcoal-soft">
                      {item.catalogItemName} × {item.quantity}
                    </span>
                    <span className="font-semibold text-charcoal">
                      {formatINR(item.catalogItemPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            );
          });

          return (
            <div
              key={enquiry.id}
              className="overflow-hidden rounded-card border border-black/[0.03] bg-white shadow-soft"
            >
              <div className="flex items-center justify-between border-b border-black/[0.03] px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-charcoal">
                    Enquiry · {new Date(enquiry.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted">
                    {items.length} item(s) across {byCompany.size} compan
                    {byCompany.size === 1 ? "y" : "ies"}
                  </p>
                </div>
                <Badge variant={ENQUIRY_STATUS_VARIANT[enquiry.status] ?? "default"}>
                  {enquiry.status}
                </Badge>
              </div>

              <div className="divide-y divide-black/[0.03]">{companyBlocks}</div>

              <div className="flex items-center justify-between bg-cream-soft px-5 py-3">
                <span className="text-xs font-semibold text-charcoal-soft">Estimated total</span>
                <span className="text-sm font-extrabold text-charcoal">
                  {formatINR(enquiryTotal)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
