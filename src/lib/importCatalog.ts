import { api } from "@/lib/apiClient";
import type { CatalogType } from "@/types/database";

export interface BulkCatalogRow {
  type: CatalogType;
  category: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  is_active: boolean;
}

export interface ParsedCatalogFile {
  rows: BulkCatalogRow[];
  // 1-based spreadsheet row numbers (header is row 1) with a reason each.
  errors: { row: number; message: string }[];
}

export interface BulkImportResult {
  created: number;
  updated: number;
  categoriesCreated: number;
}

export const MAX_IMPORT_ROWS = 1000;

const COLUMNS = ["Type", "Category", "Name", "Description", "Price", "Unit", "Active"] as const;

// Header aliases so files exported from other tools still map cleanly.
const ALIASES: Record<string, (typeof COLUMNS)[number]> = {
  type: "Type",
  category: "Category",
  name: "Name",
  "product name": "Name",
  "item name": "Name",
  item: "Name",
  description: "Description",
  price: "Price",
  "unit price": "Price",
  rate: "Price",
  unit: "Unit",
  uom: "Unit",
  active: "Active",
  status: "Active",
};

// Minimal RFC-4180 parser: quoted fields, escaped quotes, CRLF/LF, embedded newlines.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function cellToString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") {
    const v = value as { text?: unknown; richText?: { text: string }[]; result?: unknown };
    if (Array.isArray(v.richText)) return v.richText.map((t) => t.text).join("");
    if (v.result != null) return String(v.result); // formula cell
    if (v.text != null) return String(v.text); // hyperlink cell
    if (value instanceof Date) return value.toISOString();
  }
  return String(value).trim();
}

async function readGrid(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) {
    return parseCsv(await file.text());
  }
  if (name.endsWith(".xlsx")) {
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const sheet = workbook.worksheets[0];
    if (!sheet) return [];
    const grid: string[][] = [];
    sheet.eachRow({ includeEmpty: true }, (row) => {
      const cells: string[] = [];
      for (let c = 1; c <= sheet.columnCount; c++) cells.push(cellToString(row.getCell(c).value));
      grid.push(cells);
    });
    return grid;
  }
  throw new Error("Unsupported file type. Please upload an .xlsx or .csv file.");
}

function parseActive(raw: string): boolean | null {
  const v = raw.trim().toLowerCase();
  if (v === "") return true;
  if (["yes", "y", "true", "1", "active"].includes(v)) return true;
  if (["no", "n", "false", "0", "inactive"].includes(v)) return false;
  return null;
}

export async function parseCatalogFile(file: File): Promise<ParsedCatalogFile> {
  const grid = await readGrid(file);
  if (grid.length === 0) throw new Error("The file is empty.");

  const columnIndex = new Map<(typeof COLUMNS)[number], number>();
  grid[0].forEach((h, idx) => {
    const col = ALIASES[h.trim().toLowerCase()];
    if (col && !columnIndex.has(col)) columnIndex.set(col, idx);
  });
  const missing = (["Category", "Name", "Price"] as const).filter((c) => !columnIndex.has(c));
  if (missing.length > 0) {
    throw new Error(
      `Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. Download the template to see the expected format.`
    );
  }
  const get = (cells: string[], col: (typeof COLUMNS)[number]) => {
    const idx = columnIndex.get(col);
    return idx === undefined ? "" : (cells[idx] ?? "").trim();
  };

  const rows: BulkCatalogRow[] = [];
  const errors: ParsedCatalogFile["errors"] = [];
  for (let i = 1; i < grid.length; i++) {
    const cells = grid[i];
    if (cells.every((c) => c.trim() === "")) continue;
    const rowNumber = i + 1;

    const typeRaw = get(cells, "Type").toLowerCase();
    const type = typeRaw === "" ? "product" : typeRaw;
    const category = get(cells, "Category");
    const name = get(cells, "Name");
    const priceRaw = get(cells, "Price").replace(/[₹,\s]/g, "");
    const price = Number(priceRaw);
    const active = parseActive(get(cells, "Active"));

    const problem =
      type !== "product" && type !== "service"
        ? `Type must be "product" or "service" (got "${typeRaw}")`
        : !name
          ? "Name is required"
          : !category
            ? "Category is required"
            : priceRaw === "" || !Number.isFinite(price) || price < 0
              ? "Price must be a number ≥ 0"
              : active === null
                ? 'Active must be "yes" or "no"'
                : null;
    if (problem) {
      errors.push({ row: rowNumber, message: problem });
      continue;
    }

    rows.push({
      type: type as CatalogType,
      category,
      name,
      description: get(cells, "Description"),
      price,
      unit: get(cells, "Unit"),
      is_active: active!,
    });
  }

  if (rows.length + errors.length > MAX_IMPORT_ROWS) {
    throw new Error(`Too many rows — upload at most ${MAX_IMPORT_ROWS} products per file.`);
  }
  return { rows, errors };
}

export async function bulkImportCatalog(
  companyId: string,
  rows: BulkCatalogRow[]
): Promise<BulkImportResult> {
  return api.post<BulkImportResult>("/catalog?type=bulk", { companyId, rows });
}

export async function downloadCatalogTemplate() {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Product Master");
  sheet.columns = [
    { header: "Type", key: "type", width: 12 },
    { header: "Category", key: "category", width: 20 },
    { header: "Name", key: "name", width: 30 },
    { header: "Description", key: "description", width: 40 },
    { header: "Price", key: "price", width: 12 },
    { header: "Unit", key: "unit", width: 12 },
    { header: "Active", key: "active", width: 10 },
  ];
  sheet.addRows([
    ["product", "Speakers", "JBL PartyBox 310", "Portable party speaker", 4500, "day", "yes"],
    ["service", "Photography", "Wedding Photography", "Full-day coverage", 25000, "event", "yes"],
  ]);
  sheet.getRow(1).font = { bold: true };
  sheet.getColumn("price").numFmt = "#,##0.00";

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "product-master-template.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
