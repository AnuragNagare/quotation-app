import { useState, useMemo } from "react";
import { CheckCircle2, FileText, Bell, X } from "lucide-react";

import { InvoicesHeader } from "@/components/invoices/InvoicesHeader";
import { InvoiceMetricsRow } from "@/components/invoices/InvoiceMetricsRow";
import { InvoiceNavTabs, type InvoiceTabType } from "@/components/invoices/InvoiceNavTabs";
import { HotelEomBatchView } from "@/components/invoices/HotelEomBatchView";
import { InvoicesTable } from "@/components/invoices/InvoicesTable";
import { CreateInvoiceDrawer } from "@/components/invoices/CreateInvoiceDrawer";
import { ExportReportDialog } from "@/components/invoices/ExportReportDialog";
import {
  initialHotelBatchGroups,
  initialInvoicesList,
  invoiceMetrics,
} from "@/data/mockData";
import type { HotelBatchGroup, InvoiceItem } from "@/types";

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type?: "success" | "info" | "warning";
}

export function Invoices() {
  const [activeTab, setActiveTab] = useState<InvoiceTabType>("hotel");
  const [hotelGroups, setHotelGroups] = useState<HotelBatchGroup[]>(initialHotelBatchGroups);
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoicesList);

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  function addToast(title: string, message: string, type: ToastAlert["type"] = "success") {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // Derived metrics
  const unbilledHotelEventsCount = useMemo(() => {
    return hotelGroups.reduce((count, group) => {
      return count + group.events.filter((e) => e.status === "unbilled").length;
    }, 0);
  }, [hotelGroups]);

  const pendingAmount = useMemo(() => {
    return invoices
      .filter((i) => i.status === "unbilled" || i.status === "issued" || i.status === "overdue")
      .reduce((sum, i) => sum + i.amount, 0);
  }, [invoices]);

  const overdueCount = useMemo(() => {
    return invoices.filter((i) => i.status === "overdue").length;
  }, [invoices]);

  // Tab filtering for Invoices Table
  const tableInvoices = useMemo(() => {
    if (activeTab === "hotel") {
      return invoices.filter((i) => i.clientType === "hotel");
    }
    if (activeTab === "direct") {
      return invoices.filter((i) => i.clientType === "direct");
    }
    return invoices;
  }, [invoices, activeTab]);

  // Handlers
  function handleGenerateBatchInvoice(groupId: string, hotelName: string, totalAmount: number) {
    // Mark events as issued in hotelGroups state
    setHotelGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            events: g.events.map((e) => ({ ...e, status: "issued" as const })),
          };
        }
        return g;
      })
    );

    // Create a new consolidated batch invoice item
    const batchInvoiceNumber = `TT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newBatchInvoice: InvoiceItem = {
      id: `inv-batch-${Date.now()}`,
      number: batchInvoiceNumber,
      customerName: hotelName,
      clientType: "hotel",
      invoiceDate: "22 May 2026",
      dueDate: "05 Jun 2026",
      amount: totalAmount,
      status: "issued",
      eventName: "May 2026 EOM Batch Statement",
      linkedQuoteId: "Consolidated Batch",
    };

    setInvoices((prev) => [newBatchInvoice, ...prev]);

    addToast(
      "EOM Batch Statement Issued!",
      `Generated batch invoice ${batchInvoiceNumber} for ${hotelName} (Total: ₹${totalAmount.toLocaleString("en-IN")}).`
    );
  }

  function handleMarkPaid(id: string) {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "paid" as const } : inv))
    );
    const target = invoices.find((i) => i.id === id);
    addToast(
      "Invoice Marked as Paid",
      `Payment received for ${target?.number || id} (${target?.customerName}).`
    );
  }

  function handleSendReminder(invoice: InvoiceItem) {
    addToast(
      "Payment Reminder Sent",
      `Automated reminder email & SMS sent to ${invoice.customerName} for invoice ${invoice.number}.`,
      "info"
    );
  }

  function handleDownloadInvoice(invoice: InvoiceItem) {
    const isDirect = invoice.clientType === "direct";
    const ext = isDirect ? "PDF" : "Excel";
    addToast(
      `Downloading ${ext}`,
      `Generated Roxy-branded ${ext} statement for ${invoice.number} (${invoice.customerName}).`,
      "info"
    );
  }

  function handleCreateManualInvoice(newInvoice: InvoiceItem) {
    setInvoices((prev) => [newInvoice, ...prev]);
    addToast(
      "Invoice Created Successfully",
      `Invoice ${newInvoice.number} generated for ${newInvoice.customerName}.`
    );
  }

  function handleConfirmExport(format: "pdf" | "excel" | "csv", range: string) {
    setExportDialogOpen(false);
    addToast(
      "Financial Report Exported",
      `Statement for ${range.toUpperCase()} exported as .${format.toUpperCase()} format.`,
      "info"
    );
  }

  return (
    <>
      {/* Toast Notification Container */}
      <div className="fixed right-6 top-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-in slide-in-from-top-4 fade-in flex items-start gap-3 rounded-2xl border border-black/[0.04] bg-white p-4 shadow-soft-lg duration-300 max-w-sm"
          >
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                t.type === "info"
                  ? "bg-info-light text-info"
                  : t.type === "warning"
                  ? "bg-warning-light text-warning"
                  : "bg-success-light text-success"
              }`}
            >
              {t.type === "info" ? (
                <FileText className="size-5" />
              ) : t.type === "warning" ? (
                <Bell className="size-5" />
              ) : (
                <CheckCircle2 className="size-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-charcoal">{t.title}</p>
              <p className="mt-0.5 text-xs text-charcoal-soft">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-muted hover:text-charcoal transition-colors p-1"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {/* Top Header & Actions */}
        <InvoicesHeader
          onExportReport={() => setExportDialogOpen(true)}
          onCreateInvoice={() => setCreateDrawerOpen(true)}
        />

        {/* Top Metric Cards (Row of 3) */}
        <InvoiceMetricsRow
          totalRevenue={invoiceMetrics.totalRevenue.value}
          revenueDelta={invoiceMetrics.totalRevenue.delta}
          unbilledEventsCount={unbilledHotelEventsCount}
          pendingAmount={pendingAmount}
          overdueCount={overdueCount}
        />

        {/* Navigation Tabs (Segmented Control) */}
        <InvoiceNavTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Grid — Tab Views */}
        {activeTab === "hotel" && (
          <div className="flex flex-col gap-6">
            <HotelEomBatchView
              groups={hotelGroups}
              onGenerateBatchInvoice={handleGenerateBatchInvoice}
            />

            {/* Also show Hotel Invoices Table below EOM batching for quick access */}
            <InvoicesTable
              invoices={tableInvoices}
              onMarkPaid={handleMarkPaid}
              onSendReminder={handleSendReminder}
              onDownloadInvoice={handleDownloadInvoice}
            />
          </div>
        )}

        {activeTab === "direct" && (
          <InvoicesTable
            invoices={tableInvoices}
            onMarkPaid={handleMarkPaid}
            onSendReminder={handleSendReminder}
            onDownloadInvoice={handleDownloadInvoice}
          />
        )}

        {activeTab === "all" && (
          <InvoicesTable
            invoices={tableInvoices}
            onMarkPaid={handleMarkPaid}
            onSendReminder={handleSendReminder}
            onDownloadInvoice={handleDownloadInvoice}
          />
        )}
      </div>

      {/* Manual Invoice Creation Drawer */}
      <CreateInvoiceDrawer
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
        onCreateInvoice={handleCreateManualInvoice}
      />

      {/* Export Report Modal */}
      <ExportReportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onConfirmExport={handleConfirmExport}
      />
    </>
  );
}
