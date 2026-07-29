import { Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EquipmentHeaderProps {
  onImportCsv: () => void;
  onAddEquipment: () => void;
}

export function EquipmentHeader({ onImportCsv, onAddEquipment }: EquipmentHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">
          Equipment & Inventory Catalog
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage event gear, default rental pricing, stock availability, and maintenance schedules.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={onImportCsv}>
          <Upload className="size-4" />
          Import CSV
        </Button>
        <Button size="lg" onClick={onAddEquipment}>
          <Plus className="size-4" />
          Add New Equipment
        </Button>
      </div>
    </div>
  );
}
