import { useMemo, useState } from "react";
import { CheckCircle2, FileText, Wrench, X } from "lucide-react";

import { EquipmentHeader } from "@/components/equipment/EquipmentHeader";
import { EquipmentMetricsRow } from "@/components/equipment/EquipmentMetricsRow";
import {
  EquipmentFilters,
  type AvailabilityFilter,
  type CategoryFilter,
} from "@/components/equipment/EquipmentFilters";
import { EquipmentTable } from "@/components/equipment/EquipmentTable";
import { EquipmentFormDrawer } from "@/components/equipment/EquipmentFormDrawer";
import { EquipmentDetailDrawer } from "@/components/equipment/EquipmentDetailDrawer";
import { useEquipmentCatalog } from "@/context/EquipmentContext";
import { equipmentKpis } from "@/data/mockData";
import type { EquipmentCatalogItem } from "@/types";

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type?: "success" | "info" | "warning";
}

export function Equipment() {
  const { catalog, addItem, updateItem, removeItem } = useEquipmentCatalog();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentCatalogItem | null>(null);
  const [detailItem, setDetailItem] = useState<EquipmentCatalogItem | null>(null);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  function addToast(title: string, message: string, type: ToastAlert["type"] = "success") {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((item) => {
      const matchesSearch =
        q.length === 0 ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesAvailability =
        availabilityFilter === "all" || item.status === availabilityFilter;

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [catalog, search, categoryFilter, availabilityFilter]);

  function handleAddNew() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function handleQuickEdit(item: EquipmentCatalogItem) {
    setDetailItem(null);
    setEditingItem(item);
    setFormOpen(true);
  }

  function handleSaveItem(item: EquipmentCatalogItem) {
    const isNew = !catalog.some((existing) => existing.id === item.id);
    if (isNew) {
      addItem(item);
      addToast("Equipment Added", `${item.name} added to the inventory catalog.`);
    } else {
      updateItem(item.id, item);
      addToast(
        "Equipment Updated",
        `${item.name} saved. New rate of ${item.unitPrice ? "₹" + item.unitPrice.toLocaleString("en-IN") : ""}/day now applies as the default in the Quotation Builder.`
      );
    }
  }

  function handleReserveForMaintenance(item: EquipmentCatalogItem) {
    updateItem(item.id, { status: "in_maintenance" });
    addToast(
      "Reserved for Maintenance",
      `${item.name} marked as under maintenance and removed from available stock.`,
      "warning"
    );
  }

  function handleDelete(item: EquipmentCatalogItem) {
    removeItem(item.id);
    addToast("Equipment Removed", `${item.name} deleted from the inventory catalog.`, "info");
  }

  function handleImportCsv() {
    addToast(
      "CSV Import",
      "Bulk CSV import is on the roadmap — add items individually for now.",
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
                <Wrench className="size-5" />
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
        <EquipmentHeader onImportCsv={handleImportCsv} onAddEquipment={handleAddNew} />

        <EquipmentMetricsRow
          totalAssets={equipmentKpis.totalAssets}
          dispatched={equipmentKpis.dispatched}
          warehouseReady={equipmentKpis.warehouseReady}
          underMaintenance={equipmentKpis.underMaintenance}
        />

        <EquipmentFilters
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          availabilityFilter={availabilityFilter}
          onAvailabilityFilterChange={setAvailabilityFilter}
        />

        <EquipmentTable
          items={filteredItems}
          onRowClick={setDetailItem}
          onQuickEdit={handleQuickEdit}
          onReserveForMaintenance={handleReserveForMaintenance}
          onDelete={handleDelete}
        />
      </div>

      <EquipmentFormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        editingItem={editingItem}
        onSave={handleSaveItem}
      />

      <EquipmentDetailDrawer
        item={detailItem}
        onOpenChange={(open) => !open && setDetailItem(null)}
        onQuickEdit={handleQuickEdit}
      />
    </>
  );
}
