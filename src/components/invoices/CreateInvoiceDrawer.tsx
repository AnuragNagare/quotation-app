import { useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/format";
import type { ClientType, InvoiceItem } from "@/types";

interface CreateInvoiceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateInvoice: (newInvoice: InvoiceItem) => void;
}

interface TempLineItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
}

export function CreateInvoiceDrawer({
  open,
  onOpenChange,
  onCreateInvoice,
}: CreateInvoiceDrawerProps) {
  const [clientType, setClientType] = useState<ClientType>("direct");
  const [customerName, setCustomerName] = useState("");
  const [eventName, setEventName] = useState("");
  const [linkedQuoteId, setLinkedQuoteId] = useState("QT-2026-" + Math.floor(100 + Math.random() * 900));
  const [invoiceDate, setInvoiceDate] = useState("2026-05-22");
  const [dueDate, setDueDate] = useState("2026-06-05");
  const [notes, setNotes] = useState("");

  const [lineItems, setLineItems] = useState<TempLineItem[]>([
    { id: "1", description: "Audio & PA System Rental", qty: 1, rate: 45000 },
    { id: "2", description: "65\" LED Screens (Set of 2)", qty: 1, rate: 30000 },
  ]);

  const subtotal = lineItems.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

  function addLineItem() {
    setLineItems((prev) => [
      ...prev,
      { id: Date.now().toString(), description: "Equipment / Service Item", qty: 1, rate: 10000 },
    ]);
  }

  function removeLineItem(id: string) {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }

  function updateLineItem(id: string, field: keyof TempLineItem, val: string | number) {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim()) return;

    const newInvoice: InvoiceItem = {
      id: `inv-${Date.now()}`,
      number: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName: customerName.trim(),
      clientType,
      invoiceDate: new Date(invoiceDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      dueDate: new Date(dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      amount: grandTotal,
      status: "issued",
      eventName: eventName.trim() || "Event Services",
      linkedQuoteId,
    };

    onCreateInvoice(newInvoice);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
            <FileText className="size-5" />
          </div>
          <div>
            <SheetTitle>Create Manual Invoice</SheetTitle>
            <SheetDescription>Generate a standalone invoice for direct clients or hotel billing.</SheetDescription>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <SheetBody className="flex flex-col gap-5">
            {/* Customer Type Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">Customer Type</label>
              <div className="flex rounded-xl border border-cream-deep bg-white p-1">
                {(["direct", "hotel"] as ClientType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setClientType(type)}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                      clientType === type
                        ? "bg-gold text-white shadow-soft"
                        : "text-charcoal-soft hover:text-charcoal"
                    }`}
                  >
                    {type === "direct" ? "Direct Client" : "Hotel Partner"}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">
                {clientType === "direct" ? "Customer Name" : "Hotel Name"} <span className="text-danger">*</span>
              </label>
              <Input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={clientType === "direct" ? "e.g. John Doe / TechNova Corp" : "e.g. Taj Lands End"}
              />
            </div>

            {/* Event Name & Linked Quote */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal-soft">Event Name</label>
                <Input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Wedding Reception"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal-soft">Linked Quote ID</label>
                <Input
                  value={linkedQuoteId}
                  onChange={(e) => setLinkedQuoteId(e.target.value)}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal-soft">Invoice Date</label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal-soft">Due Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-charcoal-soft">Billing Line Items</label>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="flex items-center gap-1 text-xs font-bold text-gold-dark hover:underline"
                >
                  <Plus className="size-3.5" /> Add Row
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-xl border border-cream-deep bg-white p-2 text-xs">
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                      placeholder="Item description"
                      className="h-8 flex-1 text-xs"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => updateLineItem(item.id, "qty", Number(e.target.value))}
                      className="h-8 w-14 text-center text-xs"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={item.rate}
                      onChange={(e) => updateLineItem(item.id, "rate", Number(e.target.value))}
                      className="h-8 w-24 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      className="text-muted hover:text-danger p-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Total summary */}
            <div className="flex flex-col gap-1.5 rounded-xl bg-cream-soft/60 p-3.5 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>GST (18%)</span>
                <span>{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-charcoal text-sm pt-1 border-t border-cream-deep">
                <span>Grand Total</span>
                <span className="text-gold-dark">{formatINR(grandTotal)}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">Notes / Payment Terms</label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms, bank account details..."
              />
            </div>
          </SheetBody>

          <SheetFooter>
            <Button type="submit" size="lg" className="w-full">
              Generate & Issue Invoice
            </Button>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
