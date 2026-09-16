import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanies } from "@/context/CompanyContext";
import { listCatalogItems } from "@/lib/catalog";
import {
  addEnquiryLineItem,
  deleteEnquiryLineItem,
  getClientProfiles,
  getEnquiriesByIds,
  listLineItemsForEnquiries,
  updateEnquiry,
  updateEnquiryLineItem,
  type EnquiryLineItemDetail,
} from "@/lib/enquiries";
import { getQuoteByEnquiryAndCompany } from "@/lib/quotes";
import { formatINR } from "@/lib/format";
import type { CatalogItem, Enquiry, EnquiryStatus, Profile, Quote } from "@/types/database";

const STATUS_OPTIONS: EnquiryStatus[] = ["open", "quoted", "closed"];
const STATUS_VARIANT: Record<string, "default" | "gold" | "success"> = {
  open: "default",
  quoted: "gold",
  closed: "success",
};

export function EnquiryDetail() {
  const { enquiryId } = useParams<{ enquiryId: string }>();
  const { activeCompany } = useCompanies();

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [items, setItems] = useState<EnquiryLineItemDetail[]>([]);
  const [client, setClient] = useState<Profile | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogDialogOpen, setCatalogDialogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  async function load() {
    if (!enquiryId || !activeCompany) return;
    setLoading(true);
    try {
      const [enquiryRows, allItems, q] = await Promise.all([
        getEnquiriesByIds([enquiryId]),
        listLineItemsForEnquiries([enquiryId]),
        getQuoteByEnquiryAndCompany(enquiryId, activeCompany.id),
      ]);
      const enquiryRow = enquiryRows[0] ?? null;
      setEnquiry(enquiryRow);
      setItems(allItems.filter((i) => i.company_id === activeCompany.id));
      setQuote(q);

      if (enquiryRow) {
        const map = await getClientProfiles([enquiryRow.client_id]);
        setClient(map.get(enquiryRow.client_id) ?? null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiryId, activeCompany?.id]);

  async function handleStatusChange(status: EnquiryStatus) {
    if (!enquiry) return;
    const updated = await updateEnquiry(enquiry.id, { status });
    setEnquiry(updated);
  }

  async function handleNotesBlur(notes: string) {
    if (!enquiry) return;
    const updated = await updateEnquiry(enquiry.id, { notes });
    setEnquiry(updated);
  }

  async function handleQuantityBlur(id: string, quantity: number) {
    if (quantity < 1) return;
    await updateEnquiryLineItem(id, quantity);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  }

  async function handleDeleteItem(id: string) {
    await deleteEnquiryLineItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleOpenCatalogDialog() {
    if (activeCompany) {
      setCatalogItems(await listCatalogItems(activeCompany.id));
    }
    setCatalogSearch("");
    setCatalogDialogOpen(true);
  }

  async function handleAddCatalogItem(item: CatalogItem) {
    if (!enquiry || !activeCompany) return;
    const created = await addEnquiryLineItem({
      enquiryId: enquiry.id,
      catalogItemId: item.id,
      companyId: activeCompany.id,
      quantity: 1,
    });
    setItems((prev) => [
      ...prev,
      {
        ...created,
        catalogItemName: item.name,
        catalogItemUnit: item.unit,
        catalogItemPrice: item.price,
        companyName: activeCompany.name,
      },
    ]);
    setCatalogDialogOpen(false);
  }

  const filteredCatalogItems = catalogItems.filter(
    (item) => item.is_active && item.name.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  const subtotal = items.reduce((sum, i) => sum + i.catalogItemPrice * i.quantity, 0);

  if (loading) {
    return <p className="text-sm font-semibold text-muted">Loading enquiry…</p>;
  }

  if (!enquiry) {
    return (
      <div className="rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
        <p className="text-sm font-bold text-charcoal">Enquiry not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/biz/enquiries"
        className="flex w-fit items-center gap-1.5 text-xs font-semibold text-muted hover:text-charcoal"
      >
        <ArrowLeft className="size-3.5" />
        All Enquiries
      </Link>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">
            Enquiry from {client?.full_name || client?.email || "client"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {new Date(enquiry.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANT[enquiry.status] ?? "default"}>{enquiry.status}</Badge>
          <Select value={enquiry.status} onValueChange={(v) => handleStatusChange(v as EnquiryStatus)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {quote ? (
            <Button asChild>
              <Link to={`/biz/quotes/${enquiry.id}`}>
                View Quote{" "}
                <Badge variant="gold" className="ml-1">
                  {quote.status}
                </Badge>
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to={`/biz/quotes/${enquiry.id}`}>Convert to Quote</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-black/[0.03] bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-black/[0.03] px-5 py-3">
          <p className="text-sm font-bold text-charcoal">Line Items</p>
          <Button size="sm" variant="secondary" onClick={handleOpenCatalogDialog}>
            <Plus className="size-3.5" />
            Add Item
          </Button>
        </div>
        {items.length === 0 ? (
          <p className="p-5 text-sm text-muted">No line items for your company on this enquiry.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-soft text-xs font-semibold text-charcoal-soft">
              <tr>
                <th className="px-5 py-2.5">Item</th>
                <th className="px-5 py-2.5">Qty</th>
                <th className="px-5 py-2.5">Unit Price</th>
                <th className="px-5 py-2.5 text-right">Total</th>
                <th className="px-5 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-2 font-semibold text-charcoal">
                    {item.catalogItemName}
                    {item.catalogItemUnit && (
                      <span className="ml-1 text-xs font-normal text-muted">
                        / {item.catalogItemUnit}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-2">
                    <Input
                      type="number"
                      min={1}
                      defaultValue={item.quantity}
                      onBlur={(e) => handleQuantityBlur(item.id, Number(e.target.value) || 1)}
                      className="h-8 w-16 text-xs"
                    />
                  </td>
                  <td className="px-5 py-2 text-charcoal-soft">{formatINR(item.catalogItemPrice)}</td>
                  <td className="px-5 py-2 text-right font-semibold text-charcoal">
                    {formatINR(item.catalogItemPrice * item.quantity)}
                  </td>
                  <td className="px-5 py-2">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex size-7 items-center justify-center rounded-lg text-danger hover:bg-danger-light"
                      aria-label={`Remove ${item.catalogItemName}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex items-center justify-between bg-cream-soft px-5 py-3">
          <span className="text-xs font-semibold text-charcoal-soft">Estimated total</span>
          <span className="text-sm font-extrabold text-charcoal">{formatINR(subtotal)}</span>
        </div>
      </div>

      <div className="rounded-card border border-black/[0.03] bg-white p-5 shadow-soft">
        <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">Notes</label>
        <Textarea
          defaultValue={enquiry.notes ?? ""}
          onBlur={(e) => handleNotesBlur(e.target.value)}
          rows={3}
        />
      </div>

      <Dialog open={catalogDialogOpen} onOpenChange={setCatalogDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add from Catalog</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search catalog…"
            value={catalogSearch}
            onChange={(e) => setCatalogSearch(e.target.value)}
          />
          <div className="max-h-80 overflow-y-auto rounded-xl border border-cream-deep">
            {filteredCatalogItems.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted">No catalog items found.</p>
            ) : (
              <div className="divide-y divide-cream-soft">
                {filteredCatalogItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAddCatalogItem(item)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-cream-soft"
                  >
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{item.name}</p>
                      {item.unit && <p className="text-xs text-muted">per {item.unit}</p>}
                    </div>
                    <span className="text-sm font-bold text-charcoal">{formatINR(item.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
