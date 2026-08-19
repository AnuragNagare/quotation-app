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
import { formatINR } from "@/lib/format";
import type { Enquiry } from "@/types/database";

const STATUS_VARIANT: Record<string, "default" | "gold" | "success"> = {
  open: "default",
  quoted: "gold",
  closed: "success",
};

export function MyEnquiries() {
  const { session } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [lineItems, setLineItems] = useState<EnquiryLineItemDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    listMyEnquiries(session.user.id)
      .then(async (rows) => {
        setEnquiries(rows);
        setLineItems(await listLineItemsForEnquiries(rows.map((r) => r.id)));
      })
      .finally(() => setLoading(false));
  }, [session]);

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
          const total = items.reduce((sum, i) => sum + i.catalogItemPrice * i.quantity, 0);

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
                  <p className="text-xs text-muted">{items.length} item(s) across {byCompany.size} compan{byCompany.size === 1 ? "y" : "ies"}</p>
                </div>
                <Badge variant={STATUS_VARIANT[enquiry.status] ?? "default"}>
                  {enquiry.status}
                </Badge>
              </div>

              <div className="divide-y divide-black/[0.03]">
                {[...byCompany.entries()].map(([companyId, group]) => (
                  <div key={companyId} className="px-5 py-3">
                    <p className="text-xs font-bold text-charcoal-soft">{group.name}</p>
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
                ))}
              </div>

              <div className="flex items-center justify-between bg-cream-soft px-5 py-3">
                <span className="text-xs font-semibold text-charcoal-soft">
                  Estimated total
                </span>
                <span className="text-sm font-extrabold text-charcoal">{formatINR(total)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
