import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanies } from "@/context/CompanyContext";
import { supabase } from "@/lib/supabaseClient";
import { getClientProfiles } from "@/lib/enquiries";
import {
  addQuoteLineItem,
  convertEnquiryToQuote,
  createRevision,
  deleteQuoteLineItem,
  getQuoteByEnquiryAndCompany,
  listQuoteLineItems,
  listQuoteRevisions,
  updateQuote,
  updateQuoteLineItem,
} from "@/lib/quotes";
import { formatINR } from "@/lib/format";
import type { Profile, Quote, QuoteLineItem, QuoteRevision, QuoteStatus } from "@/types/database";

interface ToastAlert {
  id: string;
  title: string;
  message: string;
}

const STATUS_OPTIONS: QuoteStatus[] = [
  "draft",
  "sent",
  "pending",
  "approved",
  "revision",
  "cancelled",
];

export function BizQuoteBuilder() {
  const { enquiryId } = useParams<{ enquiryId: string }>();
  const { activeCompany } = useCompanies();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
  const [revisions, setRevisions] = useState<QuoteRevision[]>([]);
  const [client, setClient] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  function addToast(title: string, message: string) {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  async function load() {
    if (!enquiryId || !activeCompany) return;
    setLoading(true);
    try {
      const quoteId = await convertEnquiryToQuote(enquiryId, activeCompany.id);
      const [items, revs, q, enquiryRow] = await Promise.all([
        listQuoteLineItems(quoteId),
        listQuoteRevisions(quoteId),
        getQuoteByEnquiryAndCompany(enquiryId, activeCompany.id),
        supabase.from("roxy_enquiries").select("client_id").eq("id", enquiryId).maybeSingle(),
      ]);
      setQuote(q);
      setLineItems(items);
      setRevisions(revs);

      if (enquiryRow.data) {
        const map = await getClientProfiles([enquiryRow.data.client_id]);
        setClient(map.get(enquiryRow.data.client_id) ?? null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiryId, activeCompany?.id]);

  const subtotal = lineItems.reduce(
    (sum, i) => sum + i.quantity * i.unit_price * (1 - i.discount_percent / 100),
    0
  );
  const taxRate = quote?.tax_rate_percent ?? 18;
  const tax = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + tax;

  async function handleUpdateItem(id: string, patch: Partial<QuoteLineItem>) {
    const updated = await updateQuoteLineItem(id, patch);
    setLineItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  async function handleDeleteItem(id: string) {
    await deleteQuoteLineItem(id);
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleAddItem() {
    if (!quote) return;
    const created = await addQuoteLineItem({
      quoteId: quote.id,
      name: "New line item",
      quantity: 1,
      unitPrice: 0,
    });
    setLineItems((prev) => [...prev, created]);
  }

  async function handleStatusChange(status: QuoteStatus) {
    if (!quote) return;
    const updated = await updateQuote(quote.id, { status });
    setQuote(updated);
    addToast("Quote Updated", `Status changed to "${status}".`);
  }

  async function handleTaxChange(value: number) {
    if (!quote) return;
    const updated = await updateQuote(quote.id, { tax_rate_percent: value });
    setQuote(updated);
  }

  async function handleTermsBlur(value: string) {
    if (!quote) return;
    const updated = await updateQuote(quote.id, { terms: value });
    setQuote(updated);
  }

  async function handleSend() {
    if (!quote) return;
    await handleStatusChange("sent");
    addToast("Quote Sent", `${client?.full_name || "The client"} will see this quote update in their enquiries.`);
  }

  async function handleNewRevision() {
    if (!quote) return;
    const nextVersion = `v${revisions.length + 1}.0`;
    const rev = await createRevision(quote.id, nextVersion, "Revised quote");
    setRevisions((prev) => [...prev.map((r) => ({ ...r, is_current: false })), rev]);
    await handleStatusChange("revision");
  }

  if (loading) {
    return <p className="text-sm font-semibold text-muted">Loading quote…</p>;
  }

  if (!quote) {
    return (
      <div className="rounded-card border border-dashed border-cream-deep bg-white p-12 text-center">
        <p className="text-sm font-bold text-charcoal">Quote not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="fixed right-6 top-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-in slide-in-from-top-4 fade-in flex max-w-sm items-start gap-3 rounded-2xl border border-black/[0.04] bg-white p-4 shadow-soft-lg duration-300"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-light text-success">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-charcoal">{t.title}</p>
              <p className="mt-0.5 text-xs text-charcoal-soft">{t.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="p-1 text-muted transition-colors hover:text-charcoal"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

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
            Quote for {client?.full_name || client?.email || "client"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Enquiry {new Date(quote.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={quote.status} onValueChange={(v) => handleStatusChange(v as QuoteStatus)}>
            <SelectTrigger className="w-36">
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
          <Button onClick={handleSend}>Send Quote</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <div className="overflow-hidden rounded-card border border-black/[0.03] bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-black/[0.03] px-5 py-3">
              <p className="text-sm font-bold text-charcoal">Line Items</p>
              <Button size="sm" variant="secondary" onClick={handleAddItem}>
                <Plus className="size-3.5" />
                Add Item
              </Button>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-cream-soft text-xs font-semibold text-charcoal-soft">
                <tr>
                  <th className="px-5 py-2.5">Item</th>
                  <th className="px-5 py-2.5">Qty</th>
                  <th className="px-5 py-2.5">Unit Price</th>
                  <th className="px-5 py-2.5">Discount %</th>
                  <th className="px-5 py-2.5 text-right">Total</th>
                  <th className="px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03]">
                {lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-2">
                      <Input
                        defaultValue={item.name}
                        onBlur={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="px-5 py-2">
                      <Input
                        type="number"
                        min={1}
                        defaultValue={item.quantity}
                        onBlur={(e) => handleUpdateItem(item.id, { quantity: Number(e.target.value) || 1 })}
                        className="h-8 w-16 text-xs"
                      />
                    </td>
                    <td className="px-5 py-2">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={item.unit_price}
                        onBlur={(e) => handleUpdateItem(item.id, { unit_price: Number(e.target.value) || 0 })}
                        className="h-8 w-24 text-xs"
                      />
                    </td>
                    <td className="px-5 py-2">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={item.discount_percent}
                        onBlur={(e) =>
                          handleUpdateItem(item.id, { discount_percent: Number(e.target.value) || 0 })
                        }
                        className="h-8 w-20 text-xs"
                      />
                    </td>
                    <td className="px-5 py-2 text-right font-semibold text-charcoal">
                      {formatINR(item.quantity * item.unit_price * (1 - item.discount_percent / 100))}
                    </td>
                    <td className="px-5 py-2">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="flex size-7 items-center justify-center rounded-lg text-danger hover:bg-danger-light"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-card border border-black/[0.03] bg-white p-5 shadow-soft">
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
              Terms & Conditions
            </label>
            <Textarea
              defaultValue={quote.terms ?? ""}
              onBlur={(e) => handleTermsBlur(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-3">
          <div className="rounded-card border border-black/[0.03] bg-white p-5 shadow-soft">
            <p className="text-sm font-bold text-charcoal">Summary</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold text-charcoal">{formatINR(subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted">Tax %</span>
              <Input
                type="number"
                min={0}
                max={100}
                defaultValue={taxRate}
                onBlur={(e) => handleTaxChange(Number(e.target.value) || 0)}
                className="h-8 w-20 text-xs"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted">Tax amount</span>
              <span className="font-semibold text-charcoal">{formatINR(tax)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-cream-deep pt-3 text-sm">
              <span className="font-bold text-charcoal">Grand Total</span>
              <span className="text-base font-extrabold text-charcoal">{formatINR(grandTotal)}</span>
            </div>
          </div>

          <div className="rounded-card border border-black/[0.03] bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-charcoal">Revisions</p>
              <Button size="sm" variant="secondary" onClick={handleNewRevision}>
                New Revision
              </Button>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {revisions.map((rev) => (
                <div key={rev.id} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-charcoal">{rev.version}</span>
                  <span className="text-muted">{rev.label}</span>
                  {rev.is_current && <Badge variant="gold">Current</Badge>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
