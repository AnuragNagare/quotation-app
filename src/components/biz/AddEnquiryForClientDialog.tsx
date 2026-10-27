import { useEffect, useState } from "react";
import { Minus, Plus, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { listCatalogItems, listCategories } from "@/lib/catalog";
import {
  businessCreateEnquiry,
  businessCreateEnquiryForNewClient,
  searchClients,
} from "@/lib/enquiries";
import { formatINR } from "@/lib/format";
import type { CatalogItem, CatalogType, Category, Profile } from "@/types/database";

interface AddEnquiryForClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onCreated: () => void;
  // Pre-selects this client when the dialog opens (e.g. from a client's detail page).
  initialClient?: Profile | null;
}

interface DraftItem {
  catalogItemId: string;
  name: string;
  price: number;
  unit: string | null;
  quantity: number;
}

type ClientMode = "existing" | "new";

export function AddEnquiryForClientDialog({
  open,
  onOpenChange,
  companyId,
  onCreated,
  initialClient = null,
}: AddEnquiryForClientDialogProps) {
  const [clientMode, setClientMode] = useState<ClientMode>("existing");

  const [clientResults, setClientResults] = useState<Profile[]>([]);
  const [selectedClient, setSelectedClient] = useState<Profile | null>(null);

  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPassword, setNewClientPassword] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  const [type, setType] = useState<CatalogType>("product");
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setClientMode("existing");
    setSelectedClient(initialClient);
    setNewClientName("");
    setNewClientEmail("");
    setNewClientPassword("");
    setNewClientPhone("");
    setDraftItems([]);
    setNotes("");
    setLocation("");
    setDeliveryDate("");
    setContactName(initialClient?.full_name ?? "");
    setContactPhone(initialClient?.phone ?? "");
    setError(null);
    searchClients("").then(setClientResults);
    Promise.all([listCategories(companyId), listCatalogItems(companyId)]).then(
      ([cats, items]) => {
        setCategories(cats);
        setCatalogItems(items.filter((i) => i.is_active));
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, companyId]);

  // Default the point of contact to the selected client; the user can overwrite it.
  function handleSelectClient(id: string) {
    const client =
      clientResults.find((c) => c.id === id) ?? (initialClient?.id === id ? initialClient : null);
    setSelectedClient(client);
    if (client) {
      setContactName(client.full_name);
      setContactPhone(client.phone ?? "");
    }
  }

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

  const canSubmit =
    draftItems.length > 0 &&
    !!location.trim() &&
    !!deliveryDate &&
    !!contactName.trim() &&
    !!contactPhone.trim() &&
    (clientMode === "existing"
      ? !!selectedClient
      : newClientName.trim() && newClientEmail.trim() && newClientPassword.trim().length >= 6);

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const items = draftItems.map((d) => ({
        catalogItemId: d.catalogItemId,
        companyId,
        quantity: d.quantity,
      }));

      const details = {
        location: location.trim(),
        deliveryDate,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
      };

      if (clientMode === "existing" && selectedClient) {
        await businessCreateEnquiry(selectedClient.id, items, notes.trim() || undefined, details);
      } else {
        await businessCreateEnquiryForNewClient(
          {
            fullName: newClientName.trim(),
            email: newClientEmail.trim(),
            password: newClientPassword,
            phone: newClientPhone.trim() || undefined,
          },
          items,
          notes.trim() || undefined,
          details
        );
      }
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
      <DialogContent className="max-h-[92svh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Enquiry</DialogTitle>
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
            <Tabs value={clientMode} onValueChange={(v) => setClientMode(v as ClientMode)}>
              <TabsList>
                <TabsTrigger value="existing">Existing Client</TabsTrigger>
                <TabsTrigger value="new">New Client</TabsTrigger>
              </TabsList>
            </Tabs>

            {clientMode === "existing" ? (
              <Select value={selectedClient?.id ?? ""} onValueChange={handleSelectClient}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clientResults.length === 0 && (
                    <p className="px-3 py-2 text-xs text-muted">No clients yet — use New Client.</p>
                  )}
                  {clientResults.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name || c.email || "Unnamed client"}
                      {c.full_name && c.email ? ` · ${c.email}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <UserPlus className="size-3.5" />
                  This creates a real account for the client — enquiry first, account attached
                  right after.
                </div>
                <Input
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Client's full name"
                  required
                />
                <Input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="Client's email"
                  required
                />
                <Input
                  type="password"
                  value={newClientPassword}
                  onChange={(e) => setNewClientPassword(e.target.value)}
                  placeholder="Set a temporary password (min 6 characters)"
                  minLength={6}
                  required
                />
                <Input
                  type="tel"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="Phone (optional)"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Location
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Venue / delivery address"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Date of delivery
              </label>
              <Input
                type="date"
                value={deliveryDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
            <div className="hidden sm:block" />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Point of contact · Name
              </label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Contact person"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Point of contact · Number
              </label>
              <Input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
              Products / services
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-charcoal">{d.name}</p>
                      <p className="text-xs text-muted">
                        {formatINR(d.price)}
                        {d.unit && ` / ${d.unit}`} std rate
                      </p>
                    </div>
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
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? "Saving…" : "Save Enquiry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
