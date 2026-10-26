import { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  bulkImportCatalog,
  downloadCatalogTemplate,
  parseCatalogFile,
  type BulkImportResult,
  type ParsedCatalogFile,
} from "@/lib/importCatalog";
import { formatINR } from "@/lib/format";

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  onImported: (result: BulkImportResult) => void;
}

const PREVIEW_ROWS = 5;
const MAX_LISTED_ERRORS = 8;

export function BulkUploadDialog({
  open,
  onOpenChange,
  companyId,
  companyName,
  onImported,
}: BulkUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedCatalogFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFileName("");
    setParsed(null);
    setError(null);
  }, [open]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after fixing it
    if (!file) return;
    setFileName(file.name);
    setParsed(null);
    setError(null);
    setParsing(true);
    try {
      setParsed(await parseCatalogFile(file));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setParsing(false);
    }
  }

  async function handleImport() {
    if (!parsed || parsed.rows.length === 0) return;
    setImporting(true);
    setError(null);
    try {
      const result = await bulkImportCatalog(companyId, parsed.rows);
      onImported(result);
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk upload products</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted">
          Upload an Excel (.xlsx) or CSV file for{" "}
          <span className="font-semibold text-charcoal">{companyName}</span>. Columns:{" "}
          <span className="font-semibold">Type, Category, Name, Description, Price, Unit, Active</span>.
          Categories are created automatically. Items that already exist (same type and name) have
          their price and details updated.
        </p>

        <Button type="button" variant="secondary" size="sm" className="w-fit" onClick={downloadCatalogTemplate}>
          <Download className="size-4" />
          Download template
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-card border border-dashed border-cream-deep bg-white p-6 text-center transition-colors hover:border-gold"
        >
          <FileSpreadsheet className="size-7 text-muted" />
          <span className="text-sm font-semibold text-charcoal">
            {fileName || "Choose an .xlsx or .csv file"}
          </span>
          <span className="text-xs text-muted">{parsing ? "Reading file…" : "Up to 1,000 rows"}</span>
        </button>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>
        )}

        {parsed && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-charcoal">
              {parsed.rows.length} valid row{parsed.rows.length !== 1 ? "s" : ""}
              {parsed.errors.length > 0 && (
                <span className="text-danger">
                  {" "}
                  · {parsed.errors.length} with errors (will be skipped)
                </span>
              )}
            </p>

            {parsed.rows.length > 0 && (
              <div className="divide-y divide-cream-soft rounded-xl border border-cream-deep">
                {parsed.rows.slice(0, PREVIEW_ROWS).map((r, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-charcoal">{r.name}</p>
                      <p className="truncate text-muted">
                        {r.type} · {r.category}
                        {r.unit && ` · per ${r.unit}`}
                        {!r.is_active && " · inactive"}
                      </p>
                    </div>
                    <span className="shrink-0 font-bold text-charcoal">{formatINR(r.price)}</span>
                  </div>
                ))}
                {parsed.rows.length > PREVIEW_ROWS && (
                  <p className="px-3 py-2 text-center text-xs text-muted">
                    + {parsed.rows.length - PREVIEW_ROWS} more
                  </p>
                )}
              </div>
            )}

            {parsed.errors.length > 0 && (
              <ul className="rounded-xl bg-danger-light/60 px-3 py-2 text-xs text-danger">
                {parsed.errors.slice(0, MAX_LISTED_ERRORS).map((e) => (
                  <li key={e.row}>
                    Row {e.row}: {e.message}
                  </li>
                ))}
                {parsed.errors.length > MAX_LISTED_ERRORS && (
                  <li>+ {parsed.errors.length - MAX_LISTED_ERRORS} more</li>
                )}
              </ul>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!parsed || parsed.rows.length === 0 || importing}
          >
            <Upload className="size-4" />
            {importing ? "Importing…" : `Import ${parsed?.rows.length ?? ""} item${parsed?.rows.length === 1 ? "" : "s"}`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
