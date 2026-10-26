import type { Company, Profile, Quote, QuoteLineItem } from "@/types/database";

const LOGO_HEIGHT_PX = 64;
const CURRENCY_FORMAT = '"₹"#,##0.00';

// Re-encodes any browser-decodable image (png/jpg/webp/svg data URL or URL)
// as PNG — ExcelJS only embeds png/jpeg/gif — and reports its size so the
// logo can keep its aspect ratio. Returns null if the image can't be loaded
// (e.g. a cross-origin URL that taints the canvas); the sheet just omits it.
async function loadLogoAsPng(src: string): Promise<{ base64: string; width: number; height: number } | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Logo failed to load"));
      img.src = src;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || 1;
    canvas.height = img.naturalHeight || 1;
    canvas.getContext("2d")!.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    return {
      base64: dataUrl.split(",")[1],
      width: canvas.width,
      height: canvas.height,
    };
  } catch {
    return null;
  }
}

export async function exportQuoteToExcel(input: {
  quote: Quote;
  lineItems: QuoteLineItem[];
  company: Company | null;
  client: Profile | null;
}) {
  const { quote, lineItems, company, client } = input;
  // Loaded on demand: exceljs is large and only needed when exporting.
  const ExcelJS = (await import("exceljs")).default;

  const quoteNumber = `QT-${quote.id.slice(0, 8).toUpperCase()}`;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Quotation", {
    pageSetup: { orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  sheet.columns = [
    { width: 6 },
    { width: 42 },
    { width: 10 },
    { width: 16 },
    { width: 12 },
    { width: 18 },
  ];

  // Rows 1–4 are the header band: logo on the left, company + quote no. beside it.
  for (let r = 1; r <= 4; r++) sheet.getRow(r).height = 20;

  const logo = company?.logo_url ? await loadLogoAsPng(company.logo_url) : null;
  if (logo) {
    const imageId = workbook.addImage({ base64: logo.base64, extension: "png" });
    const width = Math.round((logo.width / logo.height) * LOGO_HEIGHT_PX);
    sheet.addImage(imageId, {
      tl: { col: 0.1, row: 0.1 },
      ext: { width, height: LOGO_HEIGHT_PX },
    });
  }

  // The logo spans columns A–B (~340px), so company text starts in C when there
  // is a logo and in B otherwise.
  const textCol = logo ? "C" : "B";
  sheet.getCell(`${textCol}1`).value = company?.name ?? "Company";
  sheet.getCell(`${textCol}1`).font = { bold: true, size: 16 };
  if (company?.description) {
    sheet.getCell(`${textCol}2`).value = company.description;
    sheet.getCell(`${textCol}2`).font = { size: 10, color: { argb: "FF918C7D" } };
  }

  sheet.getCell("F1").value = quoteNumber;
  sheet.getCell("F1").font = { bold: true, size: 14 };
  sheet.getCell("F1").alignment = { horizontal: "right" };
  sheet.getCell("F2").value = new Date(quote.created_at);
  sheet.getCell("F2").numFmt = "dd mmm yyyy";
  sheet.getCell("F2").alignment = { horizontal: "right" };

  sheet.getCell("A6").value = "BILLED TO";
  sheet.getCell("A6").font = { bold: true, size: 9, color: { argb: "FF918C7D" } };
  sheet.getCell("A7").value = client?.full_name ?? "Client";
  sheet.getCell("A7").font = { bold: true };
  if (client?.email) sheet.getCell("A8").value = client.email;

  const headerRow = 10;
  const header = sheet.getRow(headerRow);
  header.values = ["#", "Item", "Qty", "Unit Price", "Discount %", "Total"];
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC9962F" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });
  header.getCell(2).alignment = { horizontal: "left", vertical: "middle" };

  lineItems.forEach((item, idx) => {
    const rowNumber = headerRow + 1 + idx;
    const row = sheet.getRow(rowNumber);
    row.values = [
      idx + 1,
      item.name,
      item.quantity,
      Number(item.unit_price),
      Number(item.discount_percent),
      { formula: `C${rowNumber}*D${rowNumber}*(1-E${rowNumber}/100)` },
    ];
    row.getCell(4).numFmt = CURRENCY_FORMAT;
    row.getCell(6).numFmt = CURRENCY_FORMAT;
    row.getCell(5).numFmt = '0.##"%"';
    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(3).alignment = { horizontal: "center" };
    row.eachCell((cell) => {
      cell.border = { bottom: { style: "thin", color: { argb: "FFEDE4D0" } } };
    });
  });

  const firstItemRow = headerRow + 1;
  const lastItemRow = headerRow + lineItems.length;
  const subtotalRow = lastItemRow + 2;
  const taxRow = subtotalRow + 1;
  const grandRow = taxRow + 1;

  sheet.getCell(`E${subtotalRow}`).value = "Subtotal";
  sheet.getCell(`F${subtotalRow}`).value =
    lineItems.length > 0
      ? { formula: `SUM(F${firstItemRow}:F${lastItemRow})` }
      : 0;
  sheet.getCell(`E${taxRow}`).value = `Tax (${Number(quote.tax_rate_percent)}%)`;
  sheet.getCell(`F${taxRow}`).value = {
    formula: `F${subtotalRow}*${Number(quote.tax_rate_percent)}/100`,
  };
  sheet.getCell(`E${grandRow}`).value = "Grand Total";
  sheet.getCell(`F${grandRow}`).value = { formula: `F${subtotalRow}+F${taxRow}` };
  for (const r of [subtotalRow, taxRow, grandRow]) {
    sheet.getCell(`F${r}`).numFmt = CURRENCY_FORMAT;
    sheet.getCell(`E${r}`).alignment = { horizontal: "right" };
  }
  sheet.getCell(`E${grandRow}`).font = { bold: true };
  sheet.getCell(`F${grandRow}`).font = { bold: true };
  sheet.getCell(`F${grandRow}`).border = { top: { style: "thin" } };

  let nextRow = grandRow + 2;
  for (const [label, text] of [
    ["Notes", quote.notes],
    ["Terms & Conditions", quote.terms],
  ] as const) {
    if (!text) continue;
    sheet.getCell(`A${nextRow}`).value = label;
    sheet.getCell(`A${nextRow}`).font = { bold: true };
    sheet.mergeCells(`A${nextRow + 1}:F${nextRow + 1}`);
    const cell = sheet.getCell(`A${nextRow + 1}`);
    cell.value = text;
    cell.alignment = { wrapText: true, vertical: "top" };
    sheet.getRow(nextRow + 1).height = Math.max(20, Math.ceil(text.length / 80) * 15);
    nextRow += 3;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${quoteNumber}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
