import { useEffect, useState } from "react";
import { Mail, MapPin, MessageCircle, Phone, PencilLine, FileSpreadsheet, FileText } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClientTypeBadge } from "@/components/customers/ClientTypeBadge";
import { getInitials, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  BillingCycle,
  BillingFormat,
  CustomerAccount,
  QuotationStatus,
} from "@/types";
import type { VariantProps } from "class-variance-authority";

const QUOTE_STATUS_META: Record<
  QuotationStatus,
  { label: string; variant: NonNullable<VariantProps<typeof badgeVariants>["variant"]> }
> = {
  draft: { label: "Draft", variant: "default" },
  sent: { label: "Sent", variant: "info" },
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
  revision: { label: "Revision", variant: "orange" },
};

interface CustomerProfileDrawerProps {
  customer: CustomerAccount | null;
  onOpenChange: (open: boolean) => void;
  onNewQuote: (customer: CustomerAccount) => void;
  onUpdateBilling: (id: string, format: BillingFormat, cycle: BillingCycle) => void;
}

export function CustomerProfileDrawer({
  customer,
  onOpenChange,
  onNewQuote,
  onUpdateBilling,
}: CustomerProfileDrawerProps) {
  const [editingBilling, setEditingBilling] = useState(false);
  const [format, setFormat] = useState<BillingFormat>("pdf");
  const [cycle, setCycle] = useState<BillingCycle>("immediate");

  useEffect(() => {
    if (customer) {
      setFormat(customer.billingFormat);
      setCycle(customer.billingCycle);
      setEditingBilling(false);
    }
  }, [customer]);

  function handleSaveBilling() {
    if (!customer) return;
    onUpdateBilling(customer.id, format, cycle);
    setEditingBilling(false);
  }

  return (
    <Sheet open={customer !== null} onOpenChange={onOpenChange}>
      <SheetContent>
        {customer && (
          <>
            <SheetHeader>
              <Avatar className="size-11">
                <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <SheetTitle>{customer.name}</SheetTitle>
                <div className="mt-1 flex items-center gap-2">
                  <ClientTypeBadge clientType={customer.clientType} />
                </div>
              </div>
            </SheetHeader>

            <div className="flex items-center gap-2 border-b border-cream-soft bg-white px-6 py-3">
              <a
                href={`tel:${customer.contactPerson.phone}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-cream-deep py-2 text-xs font-semibold text-charcoal-soft transition-colors hover:bg-cream-soft"
              >
                <Phone className="size-3.5" />
                Call
              </a>
              <a
                href={`https://wa.me/${customer.contactPerson.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-cream-deep py-2 text-xs font-semibold text-charcoal-soft transition-colors hover:bg-cream-soft"
              >
                <MessageCircle className="size-3.5" />
                WhatsApp
              </a>
              <a
                href={`mailto:${customer.contactPerson.email}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-cream-deep py-2 text-xs font-semibold text-charcoal-soft transition-colors hover:bg-cream-soft"
              >
                <Mail className="size-3.5" />
                Email
              </a>
            </div>

            <Tabs defaultValue="overview" className="flex flex-1 flex-col overflow-hidden">
              <div className="border-b border-cream-soft bg-white px-6 py-3">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>
              </div>

              <SheetBody className="flex-1 overflow-y-auto">
                <TabsContent value="overview" className="flex flex-col gap-5">
                  <div>
                    <p className="mb-2 text-xs font-semibold text-muted">Key Contact</p>
                    <div className="rounded-2xl bg-cream-soft/60 p-4">
                      <p className="font-bold text-charcoal">{customer.contactPerson.name}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal-soft">
                        <Phone className="size-3.5 text-muted" />
                        {customer.contactPerson.phone}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal-soft">
                        <Mail className="size-3.5 text-muted" />
                        {customer.contactPerson.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted">
                      <MapPin className="size-3.5" /> Billing Address
                    </p>
                    <p className="text-sm text-charcoal-soft">{customer.billingAddress}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted">Tax Details</p>
                    <p className="text-sm font-semibold text-charcoal">{customer.taxDetails}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-2xl bg-cream-soft/60 p-4">
                    <div>
                      <p className="text-xs font-semibold text-muted">Booked Events</p>
                      <p className="font-bold text-charcoal">{customer.bookedEvents}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted">Lifetime Value</p>
                      <p className="font-bold text-charcoal">{formatINR(customer.lifetimeValue)}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="flex flex-col gap-3">
                  {customer.quoteHistory.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted">
                      No quotations recorded yet.
                    </p>
                  )}
                  {customer.quoteHistory.map((entry) => {
                    const meta = QUOTE_STATUS_META[entry.status];
                    return (
                      <div
                        key={entry.id}
                        className="rounded-2xl border border-cream-soft p-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-charcoal">{entry.quoteNumber}</p>
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted">
                          {entry.eventName} · {entry.eventDate}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-charcoal-soft">
                          {formatINR(entry.amount)}
                        </p>
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="billing" className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-charcoal">Quotation Output Format</p>
                    {!editingBilling && (
                      <button
                        onClick={() => setEditingBilling(true)}
                        className="flex items-center gap-1 text-xs font-bold text-gold-dark hover:underline"
                      >
                        <PencilLine className="size-3.5" />
                        Edit
                      </button>
                    )}
                  </div>

                  {!editingBilling ? (
                    <>
                      <div className="flex items-center gap-3 rounded-2xl border border-cream-deep bg-cream-soft/50 p-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-light text-gold-dark">
                          {customer.billingFormat === "pdf" ? (
                            <FileText className="size-5" />
                          ) : (
                            <FileSpreadsheet className="size-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-charcoal">
                            {customer.billingFormat === "pdf"
                              ? "Roxy Branded PDF"
                              : "Editable Excel Sheet"}
                          </p>
                          <p className="text-xs text-muted">Default output for new quotations</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-cream-deep bg-cream-soft/50 p-4">
                        <p className="text-sm font-bold text-charcoal">
                          {customer.billingCycle === "immediate"
                            ? "Same-Day Billing"
                            : "End-of-Month Consolidation"}
                        </p>
                        <p className="text-xs text-muted">
                          {customer.billingCycle === "immediate"
                            ? "Invoice generated on the day of the event."
                            : "Invoiced as part of the monthly batch statement."}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-charcoal-soft">
                          Quotation Output Format
                        </label>
                        <div className="flex rounded-xl border border-cream-deep bg-white p-1">
                          {(["pdf", "excel"] as BillingFormat[]).map((f) => (
                            <button
                              key={f}
                              onClick={() => setFormat(f)}
                              className={cn(
                                "flex-1 rounded-lg py-2 text-xs font-bold transition-all",
                                format === f
                                  ? "bg-gold text-white shadow-soft"
                                  : "text-charcoal-soft hover:text-charcoal"
                              )}
                            >
                              {f === "pdf" ? "PDF" : "Excel"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-charcoal-soft">
                          Billing Cycle
                        </label>
                        <div className="flex rounded-xl border border-cream-deep bg-white p-1">
                          {(["immediate", "eom"] as BillingCycle[]).map((c) => (
                            <button
                              key={c}
                              onClick={() => setCycle(c)}
                              className={cn(
                                "flex-1 rounded-lg py-2 text-xs font-bold transition-all",
                                cycle === c
                                  ? "bg-gold text-white shadow-soft"
                                  : "text-charcoal-soft hover:text-charcoal"
                              )}
                            >
                              {c === "immediate" ? "Immediate" : "End of Month"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveBilling}>
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingBilling(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
              </SheetBody>
            </Tabs>

            <SheetFooter>
              <Button size="lg" onClick={() => onNewQuote(customer)}>
                New Quote
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
