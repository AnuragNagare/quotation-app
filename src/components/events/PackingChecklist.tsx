import { CheckSquare2, Square, AlertTriangle, Package } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AvailabilityStatus, PackingItem, PackingStatus } from "@/types";

// ── Metadata maps ──────────────────────────────────────────────────────────────

const AVAIL_META: Record<
  AvailabilityStatus,
  { label: string; className: string; dot: string }
> = {
  in_warehouse: {
    label: "In Warehouse",
    className: "bg-success-light text-success",
    dot: "bg-success",
  },
  reserved: {
    label: "Reserved",
    className: "bg-gold-light text-gold-dark",
    dot: "bg-gold",
  },
  out_for_maintenance: {
    label: "Out for Maintenance",
    className: "bg-danger-light text-danger",
    dot: "bg-danger",
  },
};

const PACKING_META: Record<
  PackingStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-cream-soft text-charcoal-soft" },
  packed: { label: "Packed", className: "bg-info-light text-info" },
  loaded: { label: "Loaded", className: "bg-success-light text-success" },
};

const PACKING_OPTIONS: { value: PackingStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "packed", label: "Packed" },
  { value: "loaded", label: "Loaded" },
];

// ── Props ──────────────────────────────────────────────────────────────────────

interface PackingChecklistProps {
  items: PackingItem[];
  onToggleCheck: (id: string) => void;
  onPackingStatusChange: (id: string, status: PackingStatus) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PackingChecklist({
  items,
  onToggleCheck,
  onPackingStatusChange,
}: PackingChecklistProps) {
  const packedCount = items.filter(
    (i) => i.packingStatus === "packed" || i.packingStatus === "loaded"
  ).length;
  const progressPercent =
    items.length > 0 ? Math.round((packedCount / items.length) * 100) : 0;

  const conflictItems = items.filter(
    (i) => i.availabilityStatus === "out_for_maintenance"
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package className="size-4 text-gold-dark" />
          <CardTitle>Equipment Packing Checklist</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* ── Conflict warning banner ─────────────────────────────────────── */}
        {conflictItems.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger-light/60 px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
            <div>
              <p className="text-xs font-extrabold text-danger">
                Conflict Detected
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-danger/80">
                {conflictItems
                  .map((i) => `"${i.name}"`)
                  .join(", ")}{" "}
                {conflictItems.length === 1 ? "is" : "are"} currently out for
                maintenance and may not be available for this event date.
              </p>
            </div>
          </div>
        )}

        {/* ── Packing progress bar ────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 rounded-2xl bg-cream-soft/60 px-4 py-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-charcoal-soft">
              Packing Progress — {packedCount}/{items.length} items ready
            </span>
            <span
              className={cn(
                "font-extrabold",
                progressPercent === 100 ? "text-success" : "text-gold-dark"
              )}
            >
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-cream-deep">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progressPercent === 100 ? "bg-success" : "bg-gold"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ── Checklist table ─────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr className="text-left text-xs font-semibold text-muted">
                <th className="w-10 px-3 py-3 font-semibold" />
                <th className="px-3 py-3 font-semibold">Equipment</th>
                <th className="px-3 py-3 font-semibold">Category</th>
                <th className="px-3 py-3 text-center font-semibold">Qty</th>
                <th className="px-3 py-3 font-semibold">Availability</th>
                <th className="px-3 py-3 font-semibold">Packing Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const availMeta = AVAIL_META[item.availabilityStatus];
                const packMeta = PACKING_META[item.packingStatus];
                const isConflict =
                  item.availabilityStatus === "out_for_maintenance";

                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-t border-cream-soft text-sm transition-colors",
                      item.checked
                        ? "bg-gold-soft/30"
                        : "hover:bg-cream-soft/40",
                      isConflict && "bg-danger-light/20"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-3">
                      <button
                        onClick={() => onToggleCheck(item.id)}
                        aria-label={`Toggle ${item.name}`}
                        className="flex items-center justify-center transition-transform hover:scale-110"
                      >
                        {item.checked ? (
                          <CheckSquare2 className="size-5 text-gold" />
                        ) : (
                          <Square className="size-5 text-cream-deep" />
                        )}
                      </button>
                    </td>

                    {/* Equipment name */}
                    <td className="px-3 py-3">
                      <p
                        className={cn(
                          "font-semibold",
                          item.checked
                            ? "text-charcoal"
                            : "text-charcoal-soft"
                        )}
                      >
                        {item.name}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-3 text-xs text-muted">
                      {item.category}
                    </td>

                    {/* Quantity */}
                    <td className="px-3 py-3 text-center">
                      <span className="rounded-lg bg-cream-soft px-2.5 py-1 text-xs font-bold text-charcoal">
                        ×{item.requiredQty}
                      </span>
                    </td>

                    {/* Availability status */}
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
                          availMeta.className
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            availMeta.dot
                          )}
                        />
                        {availMeta.label}
                      </span>
                    </td>

                    {/* Packing status select */}
                    <td className="px-3 py-3">
                      <Select
                        value={item.packingStatus}
                        onValueChange={(v) =>
                          onPackingStatusChange(item.id, v as PackingStatus)
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "h-8 w-[120px] rounded-xl border-0 text-xs font-semibold",
                            packMeta.className
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PACKING_OPTIONS.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
