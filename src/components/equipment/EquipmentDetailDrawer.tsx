import { CalendarClock, History, MapPin } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StockStatusBadge } from "@/components/equipment/StockStatusBadge";
import { equipmentUsageHistory } from "@/data/mockData";
import { formatINR } from "@/lib/format";
import type { EquipmentCatalogItem } from "@/types";

interface EquipmentDetailDrawerProps {
  item: EquipmentCatalogItem | null;
  onOpenChange: (open: boolean) => void;
  onQuickEdit: (item: EquipmentCatalogItem) => void;
}

export function EquipmentDetailDrawer({
  item,
  onOpenChange,
  onQuickEdit,
}: EquipmentDetailDrawerProps) {
  return (
    <Sheet open={item !== null} onOpenChange={onOpenChange}>
      <SheetContent>
        {item && (
          <>
            <SheetHeader>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
                <History className="size-5" />
              </div>
              <div>
                <SheetTitle>{item.name}</SheetTitle>
                <SheetDescription>
                  {item.sku} · {item.model}
                </SheetDescription>
              </div>
            </SheetHeader>

            <SheetBody className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <StockStatusBadge status={item.status} />
                <Badge variant="outline">{item.category}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-cream-soft/60 p-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-muted">Total Stock</p>
                  <p className="font-bold text-charcoal">{item.totalStock} units</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted">Available</p>
                  <p className="font-bold text-charcoal">{item.availableStock} units</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted">Reserved</p>
                  <p className="font-bold text-charcoal">{item.reservedStock} units</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted">Daily Rate</p>
                  <p className="font-bold text-charcoal">{formatINR(item.unitPrice)}</p>
                </div>
              </div>

              {item.maintenanceNotes && (
                <div className="rounded-xl border border-danger-light bg-danger-light/40 p-3.5">
                  <p className="text-xs font-bold text-danger">Maintenance Notes</p>
                  <p className="mt-1 text-sm text-charcoal-soft">{item.maintenanceNotes}</p>
                </div>
              )}

              <Separator />

              <div>
                <p className="mb-3 text-xs font-semibold text-charcoal-soft">
                  Usage Across Events
                </p>
                <div className="flex flex-col gap-2.5">
                  {equipmentUsageHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 rounded-xl border border-cream-soft px-3.5 py-2.5"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-cream-soft text-charcoal-soft">
                        <CalendarClock className="size-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-charcoal">
                          {entry.eventName}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted">
                          <MapPin className="size-3" />
                          {entry.venue} · {entry.date}
                        </p>
                      </div>
                      <Badge variant={entry.type === "upcoming" ? "gold" : "default"}>
                        {entry.type === "upcoming" ? "Upcoming" : "Past"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </SheetBody>

            <SheetFooter>
              <Button size="lg" onClick={() => onQuickEdit(item)}>
                Quick Edit
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
