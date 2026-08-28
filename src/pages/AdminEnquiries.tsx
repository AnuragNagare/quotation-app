import { useEffect, useMemo, useState } from "react";
import { Inbox, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { adminDeleteEnquiry, listAllEnquiriesAdmin } from "@/lib/admin";
import { getClientProfiles, listLineItemsForEnquiries, type EnquiryLineItemDetail } from "@/lib/enquiries";
import { formatINR } from "@/lib/format";
import type { Enquiry, Profile } from "@/types/database";

const STATUS_VARIANT: Record<string, "default" | "gold" | "success"> = {
  open: "default",
  quoted: "gold",
  closed: "success",
};

export function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [lineItems, setLineItems] = useState<EnquiryLineItemDetail[]>([]);
  const [clients, setClients] = useState<Map<string, Profile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Enquiry | null>(null);

  async function load() {
    setLoading(true);
    try {
      const rows = await listAllEnquiriesAdmin();
      const [items, clientMap] = await Promise.all([
        listLineItemsForEnquiries(rows.map((r) => r.id)),
        getClientProfiles([...new Set(rows.map((r) => r.client_id))]),
      ]);
      setEnquiries(rows);
      setLineItems(items);
      setClients(clientMap);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const itemsByEnquiry = useMemo(() => {
    const map = new Map<string, EnquiryLineItemDetail[]>();
    for (const item of lineItems) {
      if (!map.has(item.enquiry_id)) map.set(item.enquiry_id, []);
      map.get(item.enquiry_id)!.push(item);
    }
    return map;
  }, [lineItems]);

  async function handleDelete() {
    if (!deleteTarget) return;
    await adminDeleteEnquiry(deleteTarget.id);
    setEnquiries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">Enquiries</h1>
        <p className="mt-1 text-sm text-muted">
          Platform-wide, view-only — content can only be edited by the business user handling it.
        </p>
      </div>

      {loading ? (
        <p className="text-sm font-semibold text-muted">Loading…</p>
      ) : enquiries.length === 0 ? (
        <div className="rounded-card border border-dashed border-cream-deep bg-white p-10 text-center">
          <Inbox className="mx-auto mb-3 size-8 text-muted" />
          <p className="text-sm font-bold text-charcoal">No enquiries yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {enquiries.map((enquiry) => {
            const items = itemsByEnquiry.get(enquiry.id) ?? [];
            const client = clients.get(enquiry.client_id);
            const total = items.reduce((sum, i) => sum + i.catalogItemPrice * i.quantity, 0);
            const expanded = expandedId === enquiry.id;

            return (
              <div
                key={enquiry.id}
                className="overflow-hidden rounded-card border border-black/[0.03] bg-white shadow-soft"
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : enquiry.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div>
                    <p className="text-sm font-bold text-charcoal">
                      {client?.full_name || client?.email || "Unknown client"}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(enquiry.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {items.length} item(s) · {formatINR(total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={STATUS_VARIANT[enquiry.status] ?? "default"}>
                      {enquiry.status}
                    </Badge>
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(enquiry);
                      }}
                      className="flex size-8 items-center justify-center rounded-lg text-danger hover:bg-danger-light"
                      aria-label="Delete enquiry"
                    >
                      <Trash2 className="size-4" />
                    </span>
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-black/[0.03] bg-cream-soft px-5 py-3">
                    {items.length === 0 ? (
                      <p className="text-xs text-muted">No line items.</p>
                    ) : (
                      items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-1 text-xs">
                          <span className="text-charcoal-soft">
                            {item.companyName} — {item.catalogItemName} × {item.quantity}
                          </span>
                          <span className="font-semibold text-charcoal">
                            {formatINR(item.catalogItemPrice * item.quantity)}
                          </span>
                        </div>
                      ))
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
        title="Delete this enquiry?"
        description="This also deletes its line items and any quotes created from it. This cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
