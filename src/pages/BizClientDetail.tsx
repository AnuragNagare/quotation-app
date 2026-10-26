import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Inbox, Mail, Phone, Plus, UserRound } from "lucide-react";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function BizClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const { activeCompany } = useCompanies();

  const [client, setClient] = useState<Profile | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [lineItems, setLineItems] = useState<EnquiryLineItemDetail[]>([]);
  const [quotesByEnquiry, setQuotesByEnquiry] = useState<Map<string, Quote>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  async function load(id: string, companyId: string) {
    setLoading(true);
    setError(null);
    try {
      const [profiles, allEnquiries, quotes] = await Promise.all([
        getClientProfiles([id]),
        listBizEnquiries(),
        listQuotesForCompany(companyId),
      ]);
      const mine = allEnquiries.filter((e) => e.client_id === id);
      const items = (await listLineItemsForEnquiries(mine.map((e) => e.id))).filter(
        (i) => i.company_id === companyId
      );
      const withItems = new Set(items.map((i) => i.enquiry_id));

      setClient(profiles.get(id) ?? null);
      setEnquiries(mine.filter((e) => withItems.has(e.id)));
      setLineItems(items);
      setQuotesByEnquiry(new Map(quotes.map((q) => [q.enquiry_id, q])));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (clientId && activeCompany) load(clientId, activeCompany.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, activeCompany?.id]);

  const itemsByEnquiry = useMemo(() => {
    const map = new Map<string, EnquiryLineItemDetail[]>();
    for (const item of lineItems) {
      if (!map.has(item.enquiry_id)) map.set(item.enquiry_id, []);
      map.get(item.enquiry_id)!.push(item);
    }
    return map;
  }, [lineItems]);

  const quoteCount = enquiries.filter((e) => quotesByEnquiry.has(e.id)).length;

  const backLink = (
    <Link
      to="/biz/clients"
      className="flex w-fit items-center gap-1.5 text-xs font-semibold text-muted hover:text-charcoal"
    >
      <ArrowLeft className="size-3.5" />
      All Clients
    </Link>
  );

  if (!activeCompany) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <p className="text-sm text-muted">Choose a company to view this client.</p>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm font-semibold text-muted">Loading client…</p>;
  }

  if (!client) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <div className="rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
          <p className="text-sm font-bold text-charcoal">{error ?? "Client not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {backLink}

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          {client.avatar_url ? (
            <img
              src={client.avatar_url}
              alt={client.full_name}
              className="size-14 rounded-xl border border-black/5 bg-white object-contain p-1"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-xl bg-cream-soft text-muted">
              <UserRound className="size-7" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold text-charcoal sm:text-3xl">
              {client.full_name || "Unnamed client"}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              {client.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {client.email}
                </span>
              )}
              {client.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  {client.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button size="lg" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Generate Enquiry
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="rounded-card border border-black/[0.03] bg-white px-5 py-3 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Enquiries</p>
          <p className="text-2xl font-extrabold text-charcoal">{enquiries.length}</p>
        </div>
        <div className="rounded-card border border-black/[0.03] bg-white px-5 py-3 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Quotes</p>
          <p className="text-2xl font-extrabold text-charcoal">{quoteCount}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold text-charcoal">Enquiries for {activeCompany.name}</h2>
        {enquiries.length === 0 ? (
          <div className="rounded-card border border-dashed border-cream-deep bg-white p-10 text-center">
            <Inbox className="mx-auto mb-3 size-8 text-muted" />
            <p className="text-sm font-bold text-charcoal">No enquiries yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {enquiries.map((enquiry) => {
              const items = itemsByEnquiry.get(enquiry.id) ?? [];
              const subtotal = items.reduce((sum, i) => sum + i.catalogItemPrice * i.quantity, 0);
              const quote = quotesByEnquiry.get(enquiry.id);

              return (
                <div
                  key={enquiry.id}
                  className="flex flex-col gap-3 rounded-card border border-black/[0.03] bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/biz/enquiries/${enquiry.id}`}
                      className="text-sm font-bold text-charcoal hover:underline"
                    >
                      Enquiry · {formatDate(enquiry.created_at)}
                    </Link>
                    <p className="text-xs text-muted">
                      {items.length} item(s) · {formatINR(subtotal)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={ENQUIRY_STATUS_VARIANT[enquiry.status] ?? "default"}>
                      {enquiry.status}
                    </Badge>
                    {quote && (
                      <Badge variant={QUOTE_STATUS_VARIANT[quote.status] ?? "default"}>
                        quote: {quote.status}
                      </Badge>
                    )}
                    <Button size="sm" variant={quote ? "secondary" : "default"} asChild>
                      <Link to={`/biz/quotes/${enquiry.id}`}>
                        {quote ? "Open Quote" : "Convert to Quote"}
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddEnquiryForClientDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        companyId={activeCompany.id}
        initialClient={client}
        onCreated={() => clientId && load(clientId, activeCompany.id)}
      />
    </div>
  );
}
