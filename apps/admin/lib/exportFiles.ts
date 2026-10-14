import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type Cell = string | number | null | undefined;

/** A titled table; the unit every export format is rendered from. */
export interface Section {
  title: string;
  columns: string[];
  rows: Cell[][];
}

export type ExportFormat = "csv" | "xlsx" | "pdf";
export const EXPORT_FORMATS: ExportFormat[] = ["csv", "xlsx", "pdf"];

export const CONTENT_TYPES: Record<ExportFormat, string> = {
  csv: "text/csv; charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
};

const cellText = (c: Cell): string => (c === null || c === undefined ? "" : String(c));

/** Neutralise spreadsheet formula injection for user-supplied text. */
function safeText(c: Cell): Cell {
  if (typeof c === "string" && /^[=+\-@\t\r]/.test(c)) return `'${c}`;
  return c;
}

function csvEscape(v: string): string {
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function toCsv(sections: Section[]): Buffer {
  const lines: string[] = [];
  sections.forEach((s, i) => {
    if (i > 0) lines.push("");
    lines.push(csvEscape(s.title));
    lines.push(s.columns.map(csvEscape).join(","));
    for (const row of s.rows) lines.push(row.map((c) => csvEscape(cellText(safeText(c)))).join(","));
  });
  // BOM so Excel opens UTF-8 (e.g. the ₵ sign) correctly.
  return Buffer.from("﻿" + lines.join("\r\n"), "utf8");
}

export async function toXlsx(sections: Section[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.created = new Date();
  const used = new Set<string>();
  for (const s of sections) {
    // Sheet names: max 31 chars, no []:*?/\ , unique.
    let name = s.title.replace(/[\[\]:*?/\\]/g, " ").slice(0, 31) || "Sheet";
    let n = 2;
    while (used.has(name.toLowerCase())) name = `${name.slice(0, 28)} ${n++}`;
    used.add(name.toLowerCase());

    const ws = wb.addWorksheet(name);
    ws.addRow(s.columns).font = { bold: true };
    for (const row of s.rows) ws.addRow(row.map((c) => safeText(c) ?? ""));
    ws.columns.forEach((col, idx) => {
      const widest = Math.max(
        s.columns[idx]?.length ?? 10,
        ...s.rows.map((r) => cellText(r[idx]).length)
      );
      col.width = Math.min(Math.max(widest + 2, 10), 50);
    });
  }
  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out as ArrayBuffer);
}

export async function toPdf(documentTitle: string, sections: Section[]): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const M = 40;
  const LINE = 14;
  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - M;

  // Standard PDF fonts are WinAnsi only: replace anything outside Latin-1 (e.g. ₵).
  const clean = (t: string) => t.replace(/₵/g, "GHS ").replace(/[^\x20-\x7E -ÿ]/g, "?");
  const fit = (t: string, width: number, f = font, size = 9) => {
    let s = clean(t);
    while (s.length > 1 && f.widthOfTextAtSize(s, size) > width) s = s.slice(0, -2);
    return s;
  };
  const ensure = (needed: number) => {
    if (y - needed < M) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - M;
    }
  };

  page.drawText(clean(documentTitle), { x: M, y, size: 18, font: bold, color: rgb(0.1, 0.1, 0.1) });
  y -= 22;
  page.drawText(`Generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`, {
    x: M,
    y,
    size: 9,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 26;

  for (const s of sections) {
    ensure(60);
    page.drawText(clean(s.title), { x: M, y, size: 12, font: bold });
    y -= 18;
    const colW = (PAGE_W - M * 2) / Math.max(s.columns.length, 1);

    const drawRow = (cells: Cell[], isHeader: boolean) => {
      ensure(LINE + 4);
      cells.forEach((c, i) => {
        page.drawText(fit(cellText(c), colW - 6, isHeader ? bold : font), {
          x: M + i * colW,
          y,
          size: 9,
          font: isHeader ? bold : font,
          color: isHeader ? rgb(0.1, 0.1, 0.1) : rgb(0.2, 0.2, 0.2),
        });
      });
      y -= LINE;
    };

    drawRow(s.columns, true);
    if (s.rows.length === 0) drawRow(["No data for this period"], false);
    for (const row of s.rows) drawRow(row, false);
    y -= 12;
  }

  return Buffer.from(await pdf.save());
}

export async function renderExport(
  format: ExportFormat,
  documentTitle: string,
  sections: Section[]
): Promise<Buffer> {
  if (format === "csv") return toCsv(sections);
  if (format === "xlsx") return toXlsx(sections);
  return toPdf(documentTitle, sections);
}
