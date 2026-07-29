import { Boxes, Truck, Warehouse, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EquipmentMetricsRowProps {
  totalAssets: number;
  dispatched: number;
  warehouseReady: number;
  underMaintenance: number;
}

export function EquipmentMetricsRow({
  totalAssets,
  dispatched,
  warehouseReady,
  underMaintenance,
}: EquipmentMetricsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Total Asset Count</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {totalAssets} <span className="text-base font-semibold text-muted">Items</span>
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
            <Boxes className="size-5" />
          </div>
        </div>
      </Card>

      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Dispatched / Reserved</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {dispatched} <span className="text-base font-semibold text-muted">Items</span>
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-info-light text-info">
            <Truck className="size-5" />
          </div>
        </div>
        <div className="mt-4">
          <span className="rounded-md bg-info-light px-2 py-0.5 text-xs font-bold text-info">
            On active events
          </span>
        </div>
      </Card>

      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Warehouse Stock Ready</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {warehouseReady} <span className="text-base font-semibold text-muted">Available</span>
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-success-light text-success">
            <Warehouse className="size-5" />
          </div>
        </div>
      </Card>

      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">In Maintenance / Repair</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {underMaintenance} <span className="text-base font-semibold text-muted">Items</span>
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-danger-light text-danger">
            <Wrench className="size-5" />
          </div>
        </div>
      </Card>
    </div>
  );
}
