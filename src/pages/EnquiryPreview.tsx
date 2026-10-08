import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Printer } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  getClientProfiles,
  getEnquiriesByIds,
  listLineItemsForEnquiries,
  type EnquiryLineItemDetail,
} from "@/lib/enquiries";
import { formatINR } from "@/lib/format";
import type { Enquiry, Profile } from "@/types/database";

const STATUS_VARIANT: Record<string, "default" | "gold" | "success"> = {
  open: "default",
  quoted: "gold",
  closed: "success",
};

export function EnquiryPreview() {
  const { enquiryId } = useParams<{ enquiryId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [items, setItems] = useState<EnquiryLineItemDetail[]>([]);
  const [client, setClient] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      if (profile?.role === "admin") {
        navigate("/admin/enquiries");
      } else if (profile?.role === "business_user") {
        navigate("/biz/enquiries");
      } else {
        navigate("/my-enquiries");
      }
    }
  }

  useEffect(() => {
    if (!enquiryId) return;
    setLoading(true);
    getEnquiriesByIds([enquiryId])
      .then(async (rows) => {
        const enquiryRow = rows[0];
        if (!enquiryRow) {
          setNotFound(true);
          return;
        }
        setEnquiry(enquiryRow);
        const [lineItems, clientMap] = await Promise.all([
          listLineItemsForEnquiries([enquiryId]),
          getClientProfiles([enquiryRow.client_id]),
        ]);
        setItems(lineItems);
        setClient(clientMap.get(enquiryRow.client_id) ?? null);
      })
      .finally(() => setLoading(false));
  }, [enquiryId]);

  const byCompany = useMemo(() => {
    const map = new Map<
      string,
      { name: string; logoUrl?: string | null; items: EnquiryLineItemDetail[] }
    >();
    for (const item of items) {
      if (!map.has(item.company_id)) {
        map.set(item.company_id, {
          name: item.companyName,
          logoUrl: item.companyLogoUrl,
          items: [],
        });
      }
      map.get(item.company_id)!.items.push(item);
    }
    return map;
  }, [items]);

  if (loading) {
    return <p className="p-8 text-sm font-semibold text-muted">Loading enquiry…</p>;
  }

  if (notFound || !enquiry) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-danger-light text-danger">
          <AlertCircle className="size-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-charcoal">Enquiry Not Found</h1>
        <button
          type="button"
          onClick={handleBack}
          className="mt-2 rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Back
        </button>
      </div>
    );
  }

  const grandTotal = items.reduce((sum, i) => sum + i.catalogItemPrice * i.quantity, 0);

  return (
    <div className="min-h-svh bg-cream print:bg-white">
      <div className="sticky top-0 z-10 border-b border-cream-deep bg-white px-6 py-3 shadow-soft print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-charcoal cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </button>
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
            <p className="text-2xl font-extrabold text-charcoal">Enquiry</p>
            <p className="text-xs text-muted">
              {new Date(enquiry.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <Badge variant={STATUS_VARIANT[enquiry.status] ?? "default"}>{enquiry.status}</Badge>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-muted">From</p>
          <div className="flex items-center gap-3">
            {client?.avatar_url && (
              <img
                src={client.avatar_url}
                alt={client.full_name}
                className="h-10 w-10 rounded-xl border border-black/5 bg-white p-1 object-contain shadow-sm"
              />
            )}
            <div>
              <p className="font-bold text-charcoal">{client?.full_name ?? "Client"}</p>
              <p className="text-sm text-charcoal-soft">{client?.email}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-soft">
          <div className="px-6 py-4">
            <h2 className="font-extrabold text-charcoal">Requested Items</h2>
          </div>
          {[...byCompany.entries()].map(([companyId, group]) => (
            <div key={companyId} className="border-t border-cream-soft">
              <div className="flex items-center gap-2.5 px-6 py-2.5">
                {group.logoUrl && (
                  <img
                    src={group.logoUrl}
                    alt={group.name}
                    className="h-6 w-6 rounded-md border border-black/5 bg-white p-0.5 object-contain"
                  />
                )}
                <p className="text-xs font-extrabold uppercase tracking-wider text-muted">
                  {group.name}
                </p>
              </div>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {group.items.map((item) => (
                    <tr key={item.id} className="border-t border-cream-soft">
                      <td className="px-6 py-3 font-semibold text-charcoal">
                        {item.catalogItemName}
                        {item.catalogItemUnit && (
                          <span className="ml-1 text-xs font-normal text-muted">
                            / {item.catalogItemUnit}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-charcoal-soft">× {item.quantity}</td>
                      <td className="px-6 py-3 text-right font-bold text-charcoal">
                        {formatINR(item.catalogItemPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div className="border-t border-cream-deep px-6 py-4">
            <div className="ml-auto flex max-w-xs justify-between text-base font-extrabold text-charcoal">
              <span>Estimated Total</span>
              <span>{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>

        {enquiry.notes && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-soft">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">Notes</p>
            <p className="text-sm text-charcoal-soft">{enquiry.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
