import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EquipmentCatalogItem, EquipmentCategory, StockStatus } from "@/types";

const CATEGORIES: EquipmentCategory[] = [
  "Audio",
  "Visual",
  "Lighting",
  "Stage",
  "Cables & Accessories",
];

function computeStatus(
  totalStock: number,
  reservedStock: number,
  maintenanceNotes: string
): StockStatus {
  const available = totalStock - reservedStock;
  if (maintenanceNotes.trim().length > 0 && available <= totalStock * 0.4) {
    return "in_maintenance";
  }
  if (available <= 0 || available <= totalStock * 0.2) {
    return "low_stock";
  }
  return "available";
}

interface EquipmentFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: EquipmentCatalogItem | null;
  onSave: (item: EquipmentCatalogItem) => void;
}

export function EquipmentFormDrawer({
  open,
  onOpenChange,
  editingItem,
  onSave,
}: EquipmentFormDrawerProps) {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState<EquipmentCategory>("Audio");
  const [totalStock, setTotalStock] = useState(1);
  const [unitPrice, setUnitPrice] = useState(1000);
  const [maintenanceNotes, setMaintenanceNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      setName(editingItem.name);
      setModel(editingItem.model);
      setSku(editingItem.sku);
      setCategory(editingItem.category);
      setTotalStock(editingItem.totalStock);
      setUnitPrice(editingItem.unitPrice);
      setMaintenanceNotes(editingItem.maintenanceNotes);
    } else {
      setName("");
      setModel("");
      setSku(`EQ-${Math.floor(1000 + Math.random() * 9000)}`);
      setCategory("Audio");
      setTotalStock(1);
      setUnitPrice(1000);
      setMaintenanceNotes("");
    }
  }, [open, editingItem]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const reservedStock = editingItem?.reservedStock ?? 0;
    const availableStock = Math.max(0, totalStock - reservedStock);

    onSave({
      id: editingItem?.id ?? `eq-${Date.now()}`,
      name: name.trim(),
      model: model.trim(),
      sku: sku.trim(),
      category,
      totalStock,
      reservedStock,
      availableStock,
      unitPrice,
      maintenanceNotes: maintenanceNotes.trim(),
      status: computeStatus(totalStock, reservedStock, maintenanceNotes),
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
            <Wrench className="size-5" />
          </div>
          <div>
            <SheetTitle>{editingItem ? "Edit Equipment" : "Add New Equipment"}</SheetTitle>
            <SheetDescription>
              {editingItem
                ? "Update stock, pricing, or maintenance details for this item."
                : "Add a new item to the inventory catalog."}
            </SheetDescription>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <SheetBody className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">
                Item Name <span className="text-danger">*</span>
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 65&quot; LED 4K Screen"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">Model Number</label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Samsung QM65R"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal-soft">SKU / Code</label>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal-soft">Category</label>
                <Select value={category} onValueChange={(v) => setCategory(v as EquipmentCategory)}>
                  <SelectTrigger className="h-10 w-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal-soft">
                  Total Stock Quantity
                </label>
                <Input
                  type="number"
                  min={0}
                  value={totalStock}
                  onChange={(e) => setTotalStock(Math.max(0, Number(e.target.value)))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal-soft">
                  Base Rental Rate (₹ / day)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value)))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">
                Maintenance Schedule Notes
              </label>
              <Textarea
                rows={3}
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
                placeholder="e.g. 2 units due for calibration on 20 May"
              />
            </div>
          </SheetBody>

          <SheetFooter>
            <Button type="submit" size="lg">
              Save Item
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
