import { useState, useMemo } from "react";
import { Search, Bell, CheckCircle2, FileText, FileSpreadsheet } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "@/components/invoices/PaymentStatusBadge";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { InvoiceItem, PaymentStatus } from "@/types";

interface InvoicesTableProps {
  invoices: InvoiceItem[];
  onMarkPaid: (id: string) => void;
  onSendReminder: (invoice: InvoiceItem) => void;
  onDownloadInvoice: (invoice: InvoiceItem) => void;
}

type StatusFilter = "all" | PaymentStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "unbilled", label: "Unbilled" },
  { value: "issued", label: "Issued / Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

export function InvoicesTable({
  invoices,
  onMarkPaid,
  onSendReminder,
  onDownloadInvoice,
}: InvoicesTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      const matchesSearch =
        q.length === 0 ||
        inv.number.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        (inv.eventName && inv.eventName.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-6 border-b border-cream-soft">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-extrabold text-charcoal">Invoices Data Table</h2>
          <p className="text-xs text-muted">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice #, customer or event..."
              className="rounded-2xl bg-cream-soft/40 pl-10"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1 sm:pb-0">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "rounded-pill px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap",
                  statusFilter === f.value
                    ? "bg-gold text-white shadow-soft"
                    : "bg-cream-soft text-charcoal-soft hover:bg-cream-deep/60"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-cream-soft text-left text-xs font-semibold text-muted">
              <th className="px-5 py-4 font-semibold">Invoice ID</th>
              <th className="px-5 py-4 font-semibold">Customer / Hotel</th>
              <th className="px-5 py-4 font-semibold">Client Type</th>
              <th className="px-5 py-4 font-semibold">Dates (Invoice / Due)</th>
              <th className="px-5 py-4 font-semibold">Total Amount (₹)</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => {
              const isDirect = inv.clientType === "direct";
              const isPaid = inv.status === "paid";

              return (
                <tr
                  key={inv.id}
                  className="border-b border-cream-soft transition-colors last:border-0 hover:bg-cream-soft/40"
                >
                  <td className="px-5 py-4 font-extrabold text-charcoal">
                    {inv.number}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-charcoal">{inv.customerName}</p>
                    {inv.eventName && (
                      <p className="text-xs text-muted">{inv.eventName}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-block rounded-md bg-cream-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-charcoal-soft">
                      {isDirect ? "Direct Client" : "Hotel Partner"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <p className="font-semibold text-charcoal-soft">Issued: {inv.invoiceDate}</p>
                    <p className="text-muted">Due: {inv.dueDate}</p>
                  </td>
                  <td className="px-5 py-4 font-extrabold text-charcoal">
                    {formatINR(inv.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <PaymentStatusBadge status={inv.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownloadInvoice(inv)}
                        title={isDirect ? "Download Roxy PDF" : "Download Editable Excel"}
                        className="h-8 px-2.5"
                      >
                        {isDirect ? (
                          <FileText className="size-3.5 text-gold-dark" />
                        ) : (
                          <FileSpreadsheet className="size-3.5 text-success" />
                        )}
                        <span className="hidden md:inline ml-1 text-xs">
                          {isDirect ? "PDF" : "Excel"}
                        </span>
                      </Button>

                      {!isPaid && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onSendReminder(inv)}
                          className="h-8 px-2.5 text-xs"
                          title="Send payment reminder"
                        >
                          <Bell className="size-3.5 text-warning" />
                          <span className="hidden md:inline ml-1">Reminder</span>
                        </Button>
                      )}

                      {!isPaid ? (
                        <Button
                          size="sm"
                          onClick={() => onMarkPaid(inv.id)}
                          className="h-8 px-2.5 text-xs bg-success text-white hover:bg-success/90"
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span className="hidden md:inline ml-1">Mark Paid</span>
                        </Button>
                      ) : (
                        <span className="text-xs font-bold text-success flex items-center gap-1 px-2">
                          <CheckCircle2 className="size-3.5" /> Paid
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted">
                  No invoices found matching your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
