import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, FileText, Trash2, X } from "lucide-react";

import { CustomersHeader } from "@/components/customers/CustomersHeader";
import { CustomerMetricsRow } from "@/components/customers/CustomerMetricsRow";
import {
  CustomerSegmentTabs,
  type CustomerSegment,
} from "@/components/customers/CustomerSegmentTabs";
import { CustomerFilters, type QuickFilter } from "@/components/customers/CustomerFilters";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { CustomerFormDrawer } from "@/components/customers/CustomerFormDrawer";
import { CustomerProfileDrawer } from "@/components/customers/CustomerProfileDrawer";
import { ExportContactsDialog } from "@/components/customers/ExportContactsDialog";
import { useCustomers } from "@/context/CustomerContext";
import { customerKpis } from "@/data/mockData";
import type { CustomerAccount } from "@/types";

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type?: "success" | "info" | "warning";
}

interface CustomersViewProps {
  defaultSegment: CustomerSegment;
}

export function CustomersView({ defaultSegment }: CustomersViewProps) {
  const navigate = useNavigate();
  const { customers, addCustomer, updateCustomer, removeCustomer, updateBilling } =
    useCustomers();

  const [segment, setSegment] = useState<CustomerSegment>(defaultSegment);
  const [search, setSearch] = useState("");
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerAccount | null>(null);
  const [profileCustomer, setProfileCustomer] = useState<CustomerAccount | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  function addToast(title: string, message: string, type: ToastAlert["type"] = "success") {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleQuickFilter(filter: QuickFilter) {
    setQuickFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  }

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesSegment =
        segment === "all" ||
        (segment === "hotel" && customer.clientType === "hotel") ||
        (segment === "direct" && customer.clientType === "direct");

      const matchesSearch =
        q.length === 0 ||
        customer.name.toLowerCase().includes(q) ||
        customer.location.toLowerCase().includes(q) ||
        customer.contactPerson.email.toLowerCase().includes(q) ||
        customer.contactPerson.phone.toLowerCase().includes(q);

      const matchesQuickFilters = quickFilters.every((f) => {
        if (f === "active_enquiries") return customer.activeEnquiries > 0;
        if (f === "outstanding_balance") return customer.hasOutstandingBalance;
        if (f === "top_tier") return customer.isTopTier;
        return true;
      });

      return matchesSegment && matchesSearch && matchesQuickFilters;
    });
  }, [customers, segment, search, quickFilters]);

  function handleAddNew() {
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function handleEdit(customer: CustomerAccount) {
    setProfileCustomer(null);
    setEditingCustomer(customer);
    setFormOpen(true);
  }

  function handleSaveCustomer(customer: CustomerAccount) {
    const isNew = !customers.some((existing) => existing.id === customer.id);
    if (isNew) {
      addCustomer(customer);
      addToast("Customer Added", `${customer.name} added to the directory.`);
    } else {
      updateCustomer(customer.id, customer);
      addToast("Customer Updated", `${customer.name}'s profile has been saved.`);
    }
  }

  function handleDelete(customer: CustomerAccount) {
    removeCustomer(customer.id);
    addToast("Customer Removed", `${customer.name} deleted from the directory.`, "info");
  }

  function handleNewQuote(customer: CustomerAccount) {
    setProfileCustomer(null);
    navigate("/quotations", { state: { fromCustomer: customer } });
  }

  function handleUpdateBilling(
    id: string,
    format: Parameters<typeof updateBilling>[1],
    cycle: Parameters<typeof updateBilling>[2]
  ) {
    updateBilling(id, format, cycle);
    addToast(
      "Billing Settings Updated",
      `Default output set to ${format === "pdf" ? "PDF" : "Excel"} · ${
        cycle === "immediate" ? "Same-Day" : "End-of-Month"
      } billing.`,
      "info"
    );
  }

  function handleConfirmExport(format: "csv" | "excel") {
    setExportOpen(false);
    addToast(
      "Contacts Exported",
      `Customer directory exported as .${format === "csv" ? "csv" : "xlsx"}.`,
      "info"
    );
  }

  return (
    <>
      <div className="fixed right-6 top-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-in slide-in-from-top-4 fade-in flex max-w-sm items-start gap-3 rounded-2xl border border-black/[0.04] bg-white p-4 shadow-soft-lg duration-300"
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
                <Trash2 className="size-5" />
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
              className="p-1 text-muted transition-colors hover:text-charcoal"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <CustomersHeader
          onExportContacts={() => setExportOpen(true)}
          onAddCustomer={handleAddNew}
        />

        <CustomerMetricsRow
          totalActive={customerKpis.totalActive}
          hotelPartners={customerKpis.hotelPartners}
          directClients={customerKpis.directClients}
          totalLifetimeRevenue={customerKpis.totalLifetimeRevenue}
        />

        <CustomerSegmentTabs activeSegment={segment} onSegmentChange={setSegment} />

        <CustomerFilters
          search={search}
          onSearchChange={setSearch}
          activeQuickFilters={quickFilters}
          onToggleQuickFilter={toggleQuickFilter}
        />

        <CustomersTable
          customers={filteredCustomers}
          onRowClick={setProfileCustomer}
          onNewQuote={handleNewQuote}
          onEdit={handleEdit}
          onViewHistory={setProfileCustomer}
          onDelete={handleDelete}
        />
      </div>

      <CustomerFormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        editingCustomer={editingCustomer}
        onSave={handleSaveCustomer}
      />

      <CustomerProfileDrawer
        customer={profileCustomer}
        onOpenChange={(open) => !open && setProfileCustomer(null)}
        onNewQuote={handleNewQuote}
        onUpdateBilling={handleUpdateBilling}
      />

      <ExportContactsDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        onConfirmExport={handleConfirmExport}
      />
    </>
  );
}
