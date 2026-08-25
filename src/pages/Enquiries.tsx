import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddEnquiryForClientDialog } from "@/components/biz/AddEnquiryForClientDialog";
import {
  listEnquiries,
  listLineItemsForEnquiries,
  type EnquiryLineItemDetail,
} from "@/lib/enquiries";
import { getClientsByIds } from "@/lib/clients";
import { listAllQuotes } from "@/lib/quotes";
import { formatINR } from "@/lib/format";
import type { Client, Enquiry, Quote } from "@/types/database";

const QUOTE_STATUS_VARIANT: Record<string, "default" | "gold" | "success" | "danger"> = {
  draft: "default",
  sent: "gold",
  pending: "gold",
  approved: "success",
  cancelled: "danger",
  revision: "gold",
};

interface EnquirySlice {
  enquiry: Enquiry;
  companyId: string;
  companyName: string;
  items: EnquiryLineItemDetail[];
}

export function Enquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [lineItems, setLineItems] = useState<EnquiryLineItemDetail[]>([]);
  const [clients, setClients] = useState<Map<string, Client>>(new Map());
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  async function loadInbox() {
    setLoading(true);
    try {
      const [allEnquiries, allQuotes] = await Promise.all([listEnquiries(), listAllQuotes()]);
      const items = await listLineItemsForEnquiries(allEnquiries.map((e) => e.id));
      const clientMap = await getClientsByIds([...new Set(allEnquiries.map((e) => e.client_id))]);

      setEnquiries(allEnquiries);
      setLineItems(items);
      setClients(clientMap);
      setQuotes(allQuotes);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInbox();
  }, []);

  // One quote exists per (enquiry, company) pair, so the inbox shows one row
  // per company slice of each enquiry.
  const slices = useMemo<EnquirySlice[]>(() => {
    const itemsByEnquiry = new Map<string, EnquiryLineItemDetail[]>();
    for (const item of lineItems) {
      if (!itemsByEnquiry.has(item.enquiry_id)) itemsByEnquiry.set(item.enquiry_id, []);
      itemsByEnquiry.get(item.enquiry_id)!.push(item);
    }

    const result: EnquirySlice[] = [];
    for (const enquiry of enquiries) {
      const items = itemsByEnquiry.get(enquiry.id) ?? [];
      const byCompany = new Map<string, EnquiryLineItemDetail[]>();
      for (const item of items) {
        if (!byCompany.has(item.company_id)) byCompany.set(item.company_id, []);
        byCompany.get(item.company_id)!.push(item);
      }
      for (const [companyId, companyItems] of byCompany) {
        result.push({
          enquiry,
          companyId,
          companyName: companyItems[0].companyName,
          items: companyItems,
        });
      }
    }
    return result;
  }, [enquiries, lineItems]);

  const quoteBySlice = useMemo(
    () => new Map(quotes.map((q) => [`${q.enquiry_id}:${q.company_id}`, q])),
    [quotes]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">Enquiries</h1>
          <p className="mt-1 text-sm text-muted">
            Every enquiry across all companies — one row per company slice.
          </p>
        </div>
        <Button size="lg" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          New Enquiry
        </Button>
      </div>

      {loading ? (
        <p className="text-sm font-semibold text-muted">Loading enquiries…</p>
      ) : slices.length === 0 ? (
        <div className="rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
          <Inbox className="mx-auto mb-3 size-8 text-muted" />
          <p className="text-sm font-bold text-charcoal">No enquiries yet</p>
          <p className="mt-1 text-xs text-muted">
            Enquiries submitted through the marketplace will show up here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-black/[0.03] bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-soft text-xs font-semibold text-charcoal-soft">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Subtotal</th>
                <th className="px-5 py-3 text-right">Quote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {slices.map((slice) => {
                const subtotal = slice.items.reduce(
                  (sum, i) => sum + i.catalogItemPrice * i.quantity,
                  0
                );
                const client = clients.get(slice.enquiry.client_id);
                const quote = quoteBySlice.get(`${slice.enquiry.id}:${slice.companyId}`);

                return (
                  <tr key={`${slice.enquiry.id}:${slice.companyId}`}>
                    <td className="px-5 py-3 font-semibold text-charcoal">
                      {client?.full_name || client?.email || "Unknown client"}
                    </td>
                    <td className="px-5 py-3 text-charcoal-soft">{slice.companyName}</td>
                    <td className="px-5 py-3 text-charcoal-soft">
                      {new Date(slice.enquiry.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-charcoal-soft">{slice.items.length}</td>
                    <td className="px-5 py-3 font-semibold text-charcoal">{formatINR(subtotal)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link to={`/quotes/${slice.enquiry.id}/${slice.companyId}`}>
                        {quote ? (
                          <Badge variant={QUOTE_STATUS_VARIANT[quote.status] ?? "default"}>
                            {quote.status}
                          </Badge>
                        ) : (
                          <Button size="sm">Convert to Quote</Button>
                        )}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddEnquiryForClientDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={() => loadInbox()}
      />
    </div>
  );
}
