import { useEffect, useRef, useState } from "react";
import { Copy, Plus, Search, Trash2 } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEquipmentCatalog } from "@/context/EquipmentContext";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EquipmentCatalogItem, EquipmentCategory, QuotationLineItem } from "@/types";

const CATEGORIES: EquipmentCategory[] = [
  "Audio",
  "Visual",
  "Lighting",
  "Stage",
  "Cables & Accessories",
];

function lineTotal(item: QuotationLineItem) {
  return item.quantity * item.unitPrice * (1 - item.discountPercent / 100);
}

interface LineItemsTableProps {
  lineItems: QuotationLineItem[];
  onChange: (items: QuotationLineItem[]) => void;
}

function AddLineItemMenu({ onAdd }: { onAdd: (item: QuotationLineItem) => void }) {
  const { catalog } = useEquipmentCatalog();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = catalog.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  function handleSelect(catalogItem: EquipmentCatalogItem) {
    onAdd({
      id: `li-${Date.now()}`,
      name: catalogItem.name,
      category: catalogItem.category,
      quantity: 1,
      unitPrice: catalogItem.unitPrice,
      discountPercent: 0,
    });
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-pill border border-gold px-4 py-2 text-sm font-semibold text-gold-dark transition-colors hover:bg-gold-light"
      >
        <Plus className="size-4" />
        Add Line Item
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-80 rounded-2xl border border-cream-deep bg-white p-2 shadow-soft-lg">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search equipment catalog..."
              className="h-9 pl-8 text-sm"
            />
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-muted">No matches found</p>
            )}
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-cream-soft"
              >
                <span>
                  <span className="font-semibold text-charcoal">{item.name}</span>
                  <span className="ml-1.5 text-xs text-muted">{item.category}</span>
                </span>
                <span className="text-xs font-semibold text-charcoal-soft">
                  {formatINR(item.unitPrice)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function LineItemsTable({ lineItems, onChange }: LineItemsTableProps) {
  function updateItem(id: string, patch: Partial<QuotationLineItem>) {
    onChange(lineItems.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onChange(lineItems.filter((item) => item.id !== id));
  }

  function duplicateItem(id: string) {
    const source = lineItems.find((item) => item.id === id);
    if (!source) return;
    const idx = lineItems.findIndex((item) => item.id === id);
    const copy = { ...source, id: `li-${Date.now()}` };
    const next = [...lineItems];
    next.splice(idx + 1, 0, copy);
    onChange(next);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment & Pricing</CardTitle>
        <AddLineItemMenu onAdd={(item) => onChange([...lineItems, item])} />
      </CardHeader>

      <div className="overflow-x-auto px-2 pb-2 pt-4">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="text-left text-xs font-semibold text-muted">
              <th className="px-4 py-2 font-semibold">Item / Equipment</th>
              <th className="px-4 py-2 font-semibold">Category</th>
              <th className="px-4 py-2 font-semibold">Qty</th>
              <th className="px-4 py-2 font-semibold">Unit Price (₹)</th>
              <th className="px-4 py-2 font-semibold">Discount (%)</th>
              <th className="px-4 py-2 font-semibold">Total (₹)</th>
              <th className="px-4 py-2 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => (
              <tr key={item.id} className="border-t border-cream-soft text-sm">
                <td className="px-4 py-3 font-semibold text-charcoal">{item.name}</td>
                <td className="px-4 py-3">
                  <Select
                    value={item.category}
                    onValueChange={(v) => updateItem(item.id, { category: v as EquipmentCategory })}
                  >
                    <SelectTrigger className="h-9 w-[110px]">
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
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, { quantity: Math.max(1, Number(e.target.value)) })
                    }
                    className="h-9 w-16 text-center"
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min={0}
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(item.id, { unitPrice: Math.max(0, Number(e.target.value)) })
                    }
                    className="h-9 w-28"
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={item.discountPercent}
                    onChange={(e) =>
                      updateItem(item.id, {
                        discountPercent: Math.min(100, Math.max(0, Number(e.target.value))),
                      })
                    }
                    className="h-9 w-20"
                  />
                </td>
                <td className="px-4 py-3 font-bold text-charcoal">
                  {formatINR(lineTotal(item))}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      aria-label="Duplicate"
                      onClick={() => duplicateItem(item.id)}
                      className="flex size-8 items-center justify-center rounded-lg text-charcoal-soft transition-colors hover:bg-cream-soft hover:text-charcoal"
                    >
                      <Copy className="size-3.5" />
                    </button>
                    <button
                      aria-label="Delete"
                      onClick={() => removeItem(item.id)}
                      className="flex size-8 items-center justify-center rounded-lg text-charcoal-soft transition-colors hover:bg-danger-light hover:text-danger"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {lineItems.length === 0 && (
              <tr>
                <td colSpan={7} className={cn("px-4 py-10 text-center text-sm text-muted")}>
                  No equipment added yet. Use "Add Line Item" to build the quote.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export { lineTotal };
