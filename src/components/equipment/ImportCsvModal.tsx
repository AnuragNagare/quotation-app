import { useState } from "react";
import { AlertCircle, FileSpreadsheet, Upload } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/format";
import { useEquipmentCatalog } from "@/context/EquipmentContext";
import type { EquipmentCatalogItem, EquipmentCategory } from "@/types";

interface ImportCsvModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (count: number) => void;
}

const SAMPLE_CSV = `Name,Category,UnitPrice,SKU,Model,TotalStock
Line Array Subwoofer 18",Audio,22000,EQ-AUD-099,JBL SRX818SP,6
P2.5 LED Screen Panel,Visual,18000,EQ-VIS-088,Absen PL2.5,20
Beam Moving Head 230W,Lighting,12000,EQ-LGT-077,Clay Paky Sharpy,8`;

export function ImportCsvModal({ open, onOpenChange, onSuccess }: ImportCsvModalProps) {
  const { addItem } = useEquipmentCatalog();
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [error, setError] = useState<string | null>(null);

  function parseCsv(text: string): EquipmentCatalogItem[] {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new Error("CSV must contain a header row and at least 1 data row.");
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name");
    const categoryIdx = headers.indexOf("category");
    const priceIdx = headers.indexOf("unitprice");
    const skuIdx = headers.indexOf("sku");
    const modelIdx = headers.indexOf("model");
    const stockIdx = headers.indexOf("totalstock");

    if (nameIdx === -1 || categoryIdx === -1 || priceIdx === -1) {
      throw new Error("CSV header must include 'Name', 'Category', and 'UnitPrice'.");
    }

    const items: EquipmentCatalogItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.length < 3) continue;

      const name = cols[nameIdx] || "Unnamed Equipment";
      const categoryRaw = cols[categoryIdx] || "Audio";
      const category: EquipmentCategory = [
        "Audio",
        "Visual",
        "Lighting",
        "Stage",
        "Cables & Accessories",
      ].includes(categoryRaw)
        ? (categoryRaw as EquipmentCategory)
        : "Audio";

      const unitPrice = Number(cols[priceIdx]) || 0;
      const sku = skuIdx !== -1 && cols[skuIdx] ? cols[skuIdx] : `EQ-IMP-${Date.now()}-${i}`;
      const model = modelIdx !== -1 && cols[modelIdx] ? cols[modelIdx] : "Standard";
      const totalStock = stockIdx !== -1 ? Number(cols[stockIdx]) || 5 : 5;

      items.push({
        id: `eq-imp-${Date.now()}-${i}`,
        name,
        category,
        unitPrice,
        sku,
        model,
        totalStock,
        availableStock: totalStock,
        reservedStock: 0,
        status: "available",
        maintenanceNotes: "Bulk imported from CSV",
      });
    }

    return items;
  }

  function handleImport() {
    try {
      setError(null);
      const parsedItems = parseCsv(csvText);

      if (parsedItems.length === 0) {
        setError("No valid equipment rows found.");
        return;
      }

      parsedItems.forEach((item) => addItem(item));
      onSuccess(parsedItems.length);
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message || "Failed to parse CSV.");
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvText(text);
      }
    };
    reader.readAsText(file);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gold-light text-gold-dark">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <DialogTitle>Bulk Import Equipment CSV</DialogTitle>
              <DialogDescription>
                Upload or paste CSV equipment data (Header: Name, Category, UnitPrice, SKU, Model, TotalStock).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-danger-light p-3 text-xs font-bold text-danger">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-charcoal">CSV Data Input</label>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-cream-deep bg-white px-3 py-1 text-xs font-semibold text-charcoal-soft shadow-soft hover:bg-cream-soft">
              <Upload className="size-3.5" />
              Upload .csv File
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <Textarea
            rows={8}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="font-mono text-xs"
            placeholder="Paste CSV text here..."
          />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport}>Import Equipment Items</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
