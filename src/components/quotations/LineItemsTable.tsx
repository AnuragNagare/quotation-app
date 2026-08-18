import { useEffect, useRef, useState } from "react";
import { CheckSquare2, Copy, Lock, Plus, Search, Square, Trash2 } from "lucide-react";

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
import type { EquipmentCategory, QuotationLineItem } from "@/types";

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
  isRateLocked?: boolean;
}

// ── Batch Add Menu ────────────────────────────────────────────────────────────

function AddLineItemMenu({
  onAddBatch,
  disabled,
}: {
  onAddBatch: (items: QuotationLineItem[]) => void;
  disabled?: boolean;
}) {
  const { catalog } = useEquipmentCatalog();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSelected(new Set());
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = catalog.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(filtered.map((i) => i.id)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  function handleConfirm() {
    const toAdd: QuotationLineItem[] = catalog
      .filter((i) => selected.has(i.id))
      .map((catalogItem) => ({
        id: `li-${Date.now()}-${catalogItem.id}`,
        name: catalogItem.name,
        category: catalogItem.category,
        quantity: 1,
        unitPrice: catalogItem.unitPrice,
        discountPercent: 0,
      }));
    onAddBatch(toAdd);
    setOpen(false);
    setSelected(new Set());
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        title={disabled ? "Rate card locked for this customer" : undefined}
        className={cn(
          "flex items-center gap-1.5 rounded-pill border px-4 py-2 text-sm font-semibold transition-colors",
          disabled
            ? "cursor-not-allowed border-cream-deep text-muted opacity-50"
            : "border-gold text-gold-dark hover:bg-gold-light"
        )}
      >
        <Plus className="size-4" />
        Add Line Item
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-[340px] rounded-2xl border border-cream-deep bg-white shadow-soft-lg">
          {/* Search */}
          <div className="p-2 pb-0">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search equipment catalog..."
                className="h-9 pl-8 text-sm"
              />
            </div>

            {/* Select all / clear row */}
            <div className="mt-1.5 flex items-center justify-between px-1 pb-1.5">
              <button
                onClick={selectAll}
                className="text-xs font-semibold text-gold-dark hover:underline"
              >
                Select all
              </button>
              {selected.size > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs font-semibold text-muted hover:text-charcoal hover:underline"
                >
                  Clear ({selected.size})
                </button>
              )}
            </div>
          </div>

          {/* Catalog list */}
          <div className="max-h-60 overflow-y-auto scrollbar-thin px-2">
            {filtered.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-muted">No matches found</p>
            )}
            {filtered.map((item) => {
              const isChecked = selected.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    isChecked ? "bg-gold-soft" : "hover:bg-cream-soft"
                  )}
                >
                  {isChecked ? (
                    <CheckSquare2 className="size-4 shrink-0 text-gold-dark" />
                  ) : (
                    <Square className="size-4 shrink-0 text-muted" />
                  )}
                  <span className="flex-1">
                    <span className="font-semibold text-charcoal">{item.name}</span>
                    <span className="ml-1.5 text-xs text-muted">{item.category}</span>
                  </span>
                  <span className="text-xs font-semibold text-charcoal-soft">
                    {formatINR(item.unitPrice)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Confirm button */}
          <div className="border-t border-cream-soft p-2">
            <button
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className={cn(
                "w-full rounded-xl py-2 text-sm font-bold transition-colors",
                selected.size === 0
                  ? "cursor-not-allowed bg-cream-soft text-muted"
                  : "bg-gold text-white hover:bg-gold-dark"
              )}
            >
              {selected.size === 0
                ? "Select items to add"
                : `Add ${selected.size} Item${selected.size > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Table ────────────────────────────────────────────────────────────────

export function LineItemsTable({ lineItems, onChange, isRateLocked = false }: LineItemsTableProps) {
  function updateItem(id: string, patch: Partial<QuotationLineItem>) {
    if (isRateLocked) return;
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

  function handleAddBatch(newItems: QuotationLineItem[]) {
    onChange([...lineItems, ...newItems]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment &amp; Pricing</CardTitle>
        <AddLineItemMenu onAddBatch={handleAddBatch} disabled={isRateLocked} />
      </CardHeader>

      {/* Rate lock banner */}
      {isRateLocked && (
        <div className="mx-4 mb-2 flex items-center gap-2.5 rounded-xl border border-warning/30 bg-warning-light px-4 py-3">
          <Lock className="size-4 shrink-0 text-warning" />
          <p className="text-xs font-semibold text-charcoal-soft">
            <span className="font-bold text-charcoal">Rate card is locked</span> — this customer
            has a pending balance. Contact finance to unlock before editing prices.
          </p>
        </div>
      )}

      <div className="overflow-x-auto px-2 pb-2 pt-4">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr className="text-left text-xs font-semibold text-muted">
              {/* Feature 1: Row number column */}
              <th className="w-10 px-4 py-2 text-right font-semibold">#</th>
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
            {lineItems.map((item, index) => (
              <tr key={item.id} className="border-t border-cream-soft text-sm">
                {/* Row number */}
                <td className="px-4 py-3 text-right font-mono text-xs text-muted select-none">
                  {index + 1}
                </td>
                <td className="px-4 py-3 font-semibold text-charcoal">{item.name}</td>
                <td className="px-4 py-3">
                  <Select
                    value={item.category}
                    onValueChange={(v) =>
                      updateItem(item.id, { category: v as EquipmentCategory })
                    }
                    disabled={isRateLocked}
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
                {/* Unit price — read-only when locked */}
                <td className="px-4 py-3">
                  {isRateLocked ? (
                    <span className="flex h-9 w-28 items-center rounded-lg bg-cream-soft px-3 text-sm font-semibold text-charcoal-soft">
                      {formatINR(item.unitPrice)}
                    </span>
                  ) : (
                    <Input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, { unitPrice: Math.max(0, Number(e.target.value)) })
                      }
                      className="h-9 w-28"
                    />
                  )}
                </td>
                {/* Discount — read-only when locked */}
                <td className="px-4 py-3">
                  {isRateLocked ? (
                    <span className="flex h-9 w-20 items-center rounded-lg bg-cream-soft px-3 text-sm font-semibold text-charcoal-soft">
                      {item.discountPercent}%
                    </span>
                  ) : (
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
                  )}
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
                <td colSpan={8} className={cn("px-4 py-10 text-center text-sm text-muted")}>
                  No equipment added yet. Use &quot;Add Line Item&quot; to build the quote.
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
