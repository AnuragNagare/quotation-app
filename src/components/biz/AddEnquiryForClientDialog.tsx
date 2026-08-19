import { useEffect, useState } from "react";
import { Minus, Plus, Search, UserRound, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { listCatalogItems, listCategories } from "@/lib/catalog";
import { businessCreateEnquiry, searchClients } from "@/lib/enquiries";
import { formatINR } from "@/lib/format";
import type { CatalogItem, CatalogType, Category, Profile } from "@/types/database";

interface AddEnquiryForClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onCreated: () => void;
}

interface DraftItem {
  catalogItemId: string;
  name: string;
  price: number;
  unit: string | null;
  quantity: number;
}

export function AddEnquiryForClientDialog({
  open,
  onOpenChange,
  companyId,
  onCreated,
}: AddEnquiryForClientDialogProps) {
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState<Profile[]>([]);
  const [selectedClient, setSelectedClient] = useState<Profile | null>(null);

  const [type, setType] = useState<CatalogType>("product");
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setClientQuery("");
    setSelectedClient(null);
    setDraftItems([]);
    setNotes("");
    setError(null);
    searchClients("").then(setClientResults);
    Promise.all([listCategories(companyId), listCatalogItems(companyId)]).then(
      ([cats, items]) => {
        setCategories(cats);
        setCatalogItems(items.filter((i) => i.is_active));
      }
    );
  }, [open, companyId]);

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      searchClients(clientQuery).then(setClientResults);
    }, 250);
    return () => clearTimeout(timeout);
  }, [clientQuery, open]);

  const itemsForType = catalogItems.filter((i) => i.type === type);

  function addDraftItem(item: CatalogItem) {
    setDraftItems((prev) => {
      const existing = prev.find((d) => d.catalogItemId === item.id);
      if (existing) {
        return prev.map((d) =>
          d.catalogItemId === item.id ? { ...d, quantity: d.quantity + 1 } : d
        );
      }
      return [
        ...prev,
        { catalogItemId: item.id, name: item.name, price: item.price, unit: item.unit, quantity: 1 },
      ];
    });
  }

  function updateQty(catalogItemId: string, quantity: number) {
    if (quantity <= 0) {
      setDraftItems((prev) => prev.filter((d) => d.catalogItemId !== catalogItemId));
      return;
    }
    setDraftItems((prev) =>
      prev.map((d) => (d.catalogItemId === catalogItemId ? { ...d, quantity } : d))
    );
  }

  async function handleSubmit() {
    if (!selectedClient || draftItems.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await businessCreateEnquiry(
        selectedClient.id,
        draftItems.map((d) => ({ catalogItemId: d.catalogItemId, companyId, quantity: d.quantity })),
        notes.trim() || undefined
      );
      onCreated();
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const total = draftItems.reduce((sum, d) => sum + d.price * d.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Enquiry for a Client</DialogTitle>
        </DialogHeader>

        {error && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
              Client
            </label>
            {selectedClient ? (
              <div className="flex items-center justify-between rounded-xl bg-cream-soft px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <UserRound className="size-4 text-charcoal-soft" />
                  <span className="text-sm font-semibold text-charcoal">
                    {selectedClient.full_name || selectedClient.email}
                  </span>
                </div>
                <button onClick={() => setSelectedClient(null)} aria-label="Clear client">
                  <X className="size-4 text-muted" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <Input
                    value={clientQuery}
                    onChange={(e) => setClientQuery(e.target.value)}
                    placeholder="Search existing clients by name…"
                    className="pl-10"
                  />
                </div>
                {clientResults.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-cream-deep">
                    {clientResults.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedClient(c)}
                        className="flex w-full items-center justify-between px-3.5 py-2 text-left text-sm hover:bg-cream-soft"
                      >
                        <span className="font-medium text-charcoal">
                          {c.full_name || "Unnamed client"}
                        </span>
                        <span className="text-xs text-muted">{c.email}</span>
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-1.5 text-xs text-muted">
                  New clients create their own account at checkout on the marketplace —
                  pick an existing client here.
                </p>
              </>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
              Items
            </label>
            <Tabs value={type} onValueChange={(v) => setType(v as CatalogType)}>
              <TabsList>
                <TabsTrigger value="product">Product</TabsTrigger>
                <TabsTrigger value="service">Service</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-cream-deep">
              {itemsForType.length === 0 ? (
                <p className="px-3.5 py-3 text-xs text-muted">No {type} items in your catalog.</p>
              ) : (
                itemsForType.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-cream-deep px-3.5 py-2 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-charcoal">{item.name}</p>
                      <p className="text-xs text-muted">
                        {categories.find((c) => c.id === item.category_id)?.name} ·{" "}
                        {formatINR(item.price)}
                        {item.unit && ` / ${item.unit}`}
                      </p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => addDraftItem(item)}>
                      <Plus className="size-3.5" />
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {draftItems.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Enquiry cart
              </label>
              <div className="rounded-xl border border-cream-deep">
                {draftItems.map((d) => (
                  <div
                    key={d.catalogItemId}
                    className="flex items-center gap-3 border-b border-cream-deep px-3.5 py-2 last:border-b-0"
                  >
                    <span className="flex-1 text-sm font-medium text-charcoal">{d.name}</span>
                    <button
                      onClick={() => updateQty(d.catalogItemId, d.quantity - 1)}
                      className="flex size-6 items-center justify-center rounded-md bg-cream-soft"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-5 text-center text-sm">{d.quantity}</span>
                    <button
                      onClick={() => updateQty(d.catalogItemId, d.quantity + 1)}
                      className="flex size-6 items-center justify-center rounded-md bg-cream-soft"
                    >
                      <Plus className="size-3" />
                    </button>
                    <span className="w-20 text-right text-sm font-semibold text-charcoal">
                      {formatINR(d.price * d.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-right text-sm font-bold text-charcoal">
                Total: {formatINR(total)}
              </p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
              Notes (optional)
            </label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedClient || draftItems.length === 0 || submitting}
          >
            {submitting ? "Creating…" : "Create Enquiry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
