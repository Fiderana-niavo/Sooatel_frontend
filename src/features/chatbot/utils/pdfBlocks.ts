import type { jsPDF } from "jspdf";
import {
  parseInline,
  plainText,
  type InlineSegment,
  type ListItem,
  type PdfBlock,
} from "./pdfMarkdown";

// ─── PDF Block Rendering ──────────────────────────────────────────────────────
// Draws parsed markdown blocks on a jsPDF document, handling page breaks.

export interface PdfContext {
  doc: jsPDF;
  y: number;
  margin: number;
  width: number;
  pageH: number;
}

interface Piece {
  text: string;
  bold: boolean;
  width: number;
}

interface TextStyle {
  size: number;
  bold?: boolean;
  indent?: number;
  color?: [number, number, number];
  gap?: number;
}

const MM_PER_PT = 0.3528;
const FOOTER_SPACE = 10;
const TEXT_COLOR: [number, number, number] = [51, 65, 85];
const HEAD_COLOR: [number, number, number] = [30, 41, 59];
const ACCENT: [number, number, number] = [79, 70, 229];
const NUMERIC = /^-?[\d\s.,]+\s?(Ar|%)?$/;

const HEADING_SIZES = [16, 13.5, 11.5, 10.5];

const lineHeight = (size: number): number => size * MM_PER_PT * 1.5;
const ROW_SCALE = 0.92;
const ROW_FACTOR = 1.5 * ROW_SCALE;

// Returns true when a new page was started
export function ensureSpace(ctx: PdfContext, height: number): boolean {
  if (ctx.y + height <= ctx.pageH - ctx.margin - FOOTER_SPACE) return false;
  ctx.doc.addPage();
  ctx.y = ctx.margin;
  return true;
}

// ─── Inline Layout ────────────────────────────────────────────────────────────

function measure(doc: jsPDF, text: string, size: number, bold: boolean): number {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
  return doc.getTextWidth(text);
}

function layoutInline(
  doc: jsPDF,
  segments: InlineSegment[],
  maxWidth: number,
  style: TextStyle,
): Piece[][] {
  const lines: Piece[][] = [[]];
  let used = 0;

  for (const segment of segments) {
    const bold = Boolean(style.bold) || segment.bold;
    for (const token of segment.text.split(/(\s+)/)) {
      if (!token) continue;
      const width = measure(doc, token, style.size, bold);
      const isSpace = token.trim() === "";

      if (used + width > maxWidth && !isSpace && used > 0) {
        lines.push([]);
        used = 0;
      }
      if (isSpace && used === 0) continue;

      lines[lines.length - 1].push({ text: token, bold, width });
      used += width;
    }
  }
  return lines;
}

function drawLine(ctx: PdfContext, pieces: Piece[], x: number, style: TextStyle) {
  const height = lineHeight(style.size);
  ensureSpace(ctx, height);

  const color = style.color ?? TEXT_COLOR;
  ctx.doc.setTextColor(color[0], color[1], color[2]);

  let cursor = x;
  for (const piece of pieces) {
    ctx.doc.setFont("helvetica", piece.bold ? "bold" : "normal");
    ctx.doc.setFontSize(style.size);
    ctx.doc.text(piece.text, cursor, ctx.y + height * 0.72);
    cursor += piece.width;
  }
  ctx.y += height;
}

function drawSegments(ctx: PdfContext, segments: InlineSegment[], style: TextStyle) {
  const indent = style.indent ?? 0;
  const lines = layoutInline(ctx.doc, segments, ctx.width - indent, style);

  for (const pieces of lines) {
    drawLine(ctx, pieces, ctx.margin + indent, style);
  }
  ctx.y += style.gap ?? 0;
}

// ─── Block Drawers ────────────────────────────────────────────────────────────

function drawHeading(ctx: PdfContext, level: number, text: string) {
  const size = HEADING_SIZES[Math.min(level, HEADING_SIZES.length) - 1];
  ctx.y += level <= 2 ? 3 : 1.5;
  ensureSpace(ctx, lineHeight(size) * 2);
  drawSegments(ctx, [{ text: plainText(text), bold: true }], {
    size,
    bold: true,
    color: level <= 2 ? ACCENT : HEAD_COLOR,
    gap: 1.2,
  });
}

function drawParagraph(ctx: PdfContext, text: string) {
  drawSegments(ctx, parseInline(text), { size: 10, gap: 2 });
}

function drawList(ctx: PdfContext, items: ListItem[]) {
  for (const item of items) {
    const indent = item.depth * 5 + 5;
    ensureSpace(ctx, lineHeight(10));
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(10);
    ctx.doc.setTextColor(ACCENT[0], ACCENT[1], ACCENT[2]);
    if (item.marker === "-") {
      ctx.doc.setFillColor(ACCENT[0], ACCENT[1], ACCENT[2]);
      ctx.doc.circle(ctx.margin + indent - 2.4, ctx.y + lineHeight(10) * 0.55, 0.65, "F");
    } else {
      ctx.doc.text(item.marker, ctx.margin + indent - 4.6, ctx.y + lineHeight(10) * 0.72);
    }
    drawSegments(ctx, item.segments, { size: 10, indent, gap: 0.8 });
  }
  ctx.y += 1.5;
}

function drawQuote(ctx: PdfContext, text: string) {
  const style: TextStyle = { size: 9.5, indent: 4, color: [71, 85, 105], gap: 2 };
  const lines = layoutInline(ctx.doc, parseInline(text), ctx.width - 4, style);
  const height = lines.length * lineHeight(style.size);

  ensureSpace(ctx, Math.min(height, 40));
  ctx.doc.setDrawColor(ACCENT[0], ACCENT[1], ACCENT[2]);
  ctx.doc.setLineWidth(0.8);
  ctx.doc.line(ctx.margin, ctx.y, ctx.margin, ctx.y + height);
  drawSegments(ctx, parseInline(text), style);
}

function drawCode(ctx: PdfContext, text: string) {
  const size = 8.5;
  const height = lineHeight(size);
  ctx.doc.setFont("courier", "normal");
  ctx.doc.setFontSize(size);

  for (const line of ctx.doc.splitTextToSize(text, ctx.width - 6) as string[]) {
    ensureSpace(ctx, height);
    ctx.doc.setFillColor(241, 245, 249);
    ctx.doc.rect(ctx.margin, ctx.y, ctx.width, height, "F");
    ctx.doc.setFont("courier", "normal");
    ctx.doc.setFontSize(size);
    ctx.doc.setTextColor(HEAD_COLOR[0], HEAD_COLOR[1], HEAD_COLOR[2]);
    ctx.doc.text(line, ctx.margin + 3, ctx.y + height * 0.72);
    ctx.y += height;
  }
  ctx.y += 2.5;
}

function drawRule(ctx: PdfContext) {
  ctx.y += 1.5;
  ctx.doc.setDrawColor(203, 213, 225);
  ctx.doc.setLineWidth(0.3);
  ctx.doc.line(ctx.margin, ctx.y, ctx.margin + ctx.width, ctx.y);
  ctx.y += 3;
}

// ─── Table ────────────────────────────────────────────────────────────────────

function columnWidths(header: string[], rows: string[][], total: number): number[] {
  const weights = header.map((title, col) => {
    const longest = Math.max(
      plainText(title).length,
      ...rows.map((row) => plainText(row[col]).length),
    );
    return Math.min(Math.max(longest, 6), 34);
  });
  const sum = weights.reduce((acc, weight) => acc + weight, 0);
  return weights.map((weight) => (weight / sum) * total);
}

function drawRow(
  ctx: PdfContext,
  cells: string[],
  widths: number[],
  mode: { head: boolean; zebra: boolean },
  header: string[],
) {
  const size = 8.5;
  const pad = 1.8;
  const step = lineHeight(size) * ROW_SCALE;

  ctx.doc.setFont("helvetica", mode.head ? "bold" : "normal");
  ctx.doc.setFontSize(size);
  const wrapped = cells.map(
    (cell, col) =>
      ctx.doc.splitTextToSize(plainText(cell), widths[col] - pad * 2) as string[],
  );
  const height = Math.max(...wrapped.map((lines) => lines.length)) * step + pad * 2;

  if (ensureSpace(ctx, height) && !mode.head) {
    drawRow(ctx, header, widths, { head: true, zebra: false }, header);
  }

  let x = ctx.margin;
  cells.forEach((cell, col) => {
    const fill = mode.head ? HEAD_COLOR : mode.zebra ? [248, 250, 252] : [255, 255, 255];
    ctx.doc.setFillColor(fill[0], fill[1], fill[2]);
    ctx.doc.setDrawColor(226, 232, 240);
    ctx.doc.setLineWidth(0.2);
    ctx.doc.rect(x, ctx.y, widths[col], height, "FD");

    const color = mode.head ? [255, 255, 255] : TEXT_COLOR;
    ctx.doc.setFont("helvetica", mode.head ? "bold" : "normal");
    ctx.doc.setFontSize(size);
    ctx.doc.setTextColor(color[0], color[1], color[2]);

    const right = !mode.head && NUMERIC.test(plainText(cell).trim());
    const textX = right ? x + widths[col] - pad : x + pad;
    ctx.doc.text(wrapped[col], textX, ctx.y + pad + step * 0.7, {
      align: right ? "right" : "left",
      lineHeightFactor: ROW_FACTOR,
    });
    x += widths[col];
  });
  ctx.y += height;
}

function drawTable(ctx: PdfContext, header: string[], rows: string[][]) {
  const widths = columnWidths(header, rows, ctx.width);
  ctx.y += 1;
  drawRow(ctx, header, widths, { head: true, zebra: false }, header);
  rows.forEach((row, index) => {
    drawRow(ctx, row, widths, { head: false, zebra: index % 2 === 1 }, header);
  });
  ctx.y += 3;
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function drawBlock(ctx: PdfContext, block: PdfBlock) {
  switch (block.type) {
    case "heading":
      return drawHeading(ctx, block.level, block.text);
    case "paragraph":
      return drawParagraph(ctx, block.text);
    case "list":
      return drawList(ctx, block.items);
    case "table":
      return drawTable(ctx, block.header, block.rows);
    case "quote":
      return drawQuote(ctx, block.text);
    case "code":
      return drawCode(ctx, block.text);
    case "rule":
      return drawRule(ctx);
  }
}
