import {
  AudioLines,
  Cable,
  Layers,
  Lightbulb,
  MonitorPlay,
  PencilLine,
  Trash2,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockStatusBadge } from "@/components/equipment/StockStatusBadge";
import { formatINR } from "@/lib/format";
import type { EquipmentCatalogItem, EquipmentCategory } from "@/types";

const CATEGORY_ICON: Record<EquipmentCategory, LucideIcon> = {
  Audio: AudioLines,
  Visual: MonitorPlay,
  Lighting: Lightbulb,
  Stage: Layers,
  "Cables & Accessories": Cable,
};

interface EquipmentTableProps {
  items: EquipmentCatalogItem[];
  onRowClick: (item: EquipmentCatalogItem) => void;
  onQuickEdit: (item: EquipmentCatalogItem) => void;
  onReserveForMaintenance: (item: EquipmentCatalogItem) => void;
  onDelete: (item: EquipmentCatalogItem) => void;
}

export function EquipmentTable({
  items,
  onRowClick,
  onQuickEdit,
  onReserveForMaintenance,
  onDelete,
}: EquipmentTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-lg font-extrabold text-charcoal">Inventory</h2>
        <p className="text-xs font-semibold text-muted">{items.length} items</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-cream-soft text-left text-xs font-semibold text-muted">
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">SKU / Code</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Stock vs Available</th>
              <th className="px-5 py-3 font-semibold">Daily Rate (₹)</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const Icon = CATEGORY_ICON[item.category];
              return (
                <tr
                  key={item.id}
                  onClick={() => onRowClick(item)}
                  className="cursor-pointer border-b border-cream-soft transition-colors last:border-0 hover:bg-cream-soft/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-light text-gold-dark">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="font-bold text-charcoal">{item.name}</p>
                        <p className="text-xs text-muted">{item.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-charcoal-soft">
                    {item.sku}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-block rounded-md bg-cream-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-charcoal-soft">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-charcoal">{item.availableStock}</span>
                    <span className="text-muted"> / {item.totalStock} available</span>
                  </td>
                  <td className="px-5 py-4 font-bold text-charcoal">
                    {formatINR(item.unitPrice)}{" "}
                    <span className="font-normal text-muted">/ day</span>
                  </td>
                  <td className="px-5 py-4">
                    <StockStatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onQuickEdit(item)}
                        title="Quick edit"
                        className="h-8 px-2.5"
                      >
                        <PencilLine className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReserveForMaintenance(item)}
                        title="Reserve for maintenance"
                        className="h-8 px-2.5"
                      >
                        <Wrench className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item)}
                        title="Delete"
                        className="h-8 px-2.5 text-danger hover:bg-danger-light hover:text-danger"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-sm text-muted">
                  No equipment matches your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
