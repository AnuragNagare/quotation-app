import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddEnquiryForClientDialog } from "@/components/biz/AddEnquiryForClientDialog";
import { useCompanies } from "@/context/CompanyContext";
import {
  getClientProfiles,
  listBizEnquiries,
  listLineItemsForEnquiries,
  type EnquiryLineItemDetail,
} from "@/lib/enquiries";
import { listQuotesForCompany } from "@/lib/quotes";
import { formatINR } from "@/lib/format";
import type { Enquiry, Profile, Quote } from "@/types/database";

const QUOTE_STATUS_VARIANT: Record<string, "default" | "gold" | "success" | "danger"> = {
  draft: "default",
  sent: "gold",
  pending: "gold",
  approved: "success",
  cancelled: "danger",
  revision: "gold",
};

export function BizEnquiries() {
  const { activeCompany, companies } = useCompanies();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [lineItems, setLineItems] = useState<EnquiryLineItemDetail[]>([]);
  const [clients, setClients] = useState<Map<string, Profile>>(new Map());
  const [quotesByEnquiry, setQuotesByEnquiry] = useState<Map<string, Quote>>(new Map());
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  async function loadInbox(companyId: string) {
    setLoading(true);
    try {
      const [allEnquiries, quotes] = await Promise.all([
        listBizEnquiries(),
        listQuotesForCompany(companyId),
      ]);
      const items = await listLineItemsForEnquiries(allEnquiries.map((e) => e.id));
      const scopedItems = items.filter((i) => i.company_id === companyId);
      const enquiryIdsWithItems = new Set(scopedItems.map((i) => i.enquiry_id));
      const scopedEnquiries = allEnquiries.filter((e) => enquiryIdsWithItems.has(e.id));

      const clientMap = await getClientProfiles([...new Set(scopedEnquiries.map((e) => e.client_id))]);

      setEnquiries(scopedEnquiries);
      setLineItems(scopedItems);
      setClients(clientMap);
      setQuotesByEnquiry(new Map(quotes.map((q) => [q.enquiry_id, q])));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeCompany) loadInbox(activeCompany.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCompany?.id]);

  const itemsByEnquiry = useMemo(() => {
    const map = new Map<string, EnquiryLineItemDetail[]>();
    for (const item of lineItems) {
      if (!map.has(item.enquiry_id)) map.set(item.enquiry_id, []);
      map.get(item.enquiry_id)!.push(item);
    }
    return map;
  }, [lineItems]);

  if (!activeCompany) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
        <Inbox className="size-8 text-muted" />
        <p className="text-sm font-bold text-charcoal">No company selected</p>
        <p className="max-w-sm text-xs text-muted">
          {companies.length === 0
            ? "Create a company first to start receiving enquiries."
            : "Choose a company to view its enquiries."}
        </p>
        <Button asChild className="mt-2">
          <Link to="/companies">Go to Companies</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">Enquiries</h1>
          <p className="mt-1 text-sm text-muted">
            For <span className="font-semibold text-charcoal">{activeCompany.name}</span>
          </p>
        </div>
        <Button size="lg" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add Enquiry for Client
        </Button>
      </div>

      {loading ? (
        <p className="text-sm font-semibold text-muted">Loading enquiries…</p>
      ) : enquiries.length === 0 ? (
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
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Subtotal</th>
                <th className="px-5 py-3 text-right">Quote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {enquiries.map((enquiry) => {
                const items = itemsByEnquiry.get(enquiry.id) ?? [];
                const subtotal = items.reduce((sum, i) => sum + i.catalogItemPrice * i.quantity, 0);
                const client = clients.get(enquiry.client_id);
                const quote = quotesByEnquiry.get(enquiry.id);

                return (
                  <tr key={enquiry.id}>
                    <td className="px-5 py-3 font-semibold text-charcoal">
                      {client?.full_name || client?.email || "Unknown client"}
                    </td>
                    <td className="px-5 py-3 text-charcoal-soft">
                      {new Date(enquiry.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-charcoal-soft">{items.length}</td>
                    <td className="px-5 py-3 font-semibold text-charcoal">{formatINR(subtotal)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link to={`/biz/quotes/${enquiry.id}`}>
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
        companyId={activeCompany.id}
        onCreated={() => loadInbox(activeCompany.id)}
      />
    </div>
  );
}
