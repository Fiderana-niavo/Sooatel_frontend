import { jsPDF } from "jspdf";
import { getLogoData } from "@/features/sales/utils/ticketPdf";
import { drawBlock, type PdfContext } from "./pdfBlocks";
import { parseBlocks, sanitizeText } from "./pdfMarkdown";

// ─── Shared Chat PDF Export ───────────────────────────────────────────────────
// Single entry point used by the "Exporter en PDF" button AND by the assistant
// when the backend asks for a PDF (pdfExport in the chat response).

const DEFAULT_TITLE = "Rapport Sooatel";
const MARGIN = 16;
const HEAD_COLOR: [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [100, 116, 139];

function formatNow(): string {
  const stamp = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return sanitizeText(stamp);
}

function buildFileName(title: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const day = new Date().toISOString().slice(0, 10);
  return `${slug || "rapport"}-${day}.pdf`;
}

function drawBrand(ctx: PdfContext, logo: string | null) {
  const { doc } = ctx;
  let textX = MARGIN;

  if (logo) {
    doc.addImage(logo, "JPEG", MARGIN, ctx.y, 13, 13);
    textX += 16;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(HEAD_COLOR[0], HEAD_COLOR[1], HEAD_COLOR[2]);
  doc.text("UTOPIA", textX, ctx.y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text("By Sooatel", textX, ctx.y + 10);

  doc.setFontSize(8);
  doc.text(`Généré le ${formatNow()}`, MARGIN + ctx.width, ctx.y + 5.5, {
    align: "right",
  });
  ctx.y += 18;
}

function drawTitle(ctx: PdfContext, title: string) {
  const { doc } = ctx;
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, ctx.y, MARGIN + ctx.width, ctx.y);
  ctx.y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(HEAD_COLOR[0], HEAD_COLOR[1], HEAD_COLOR[2]);
  const lines = doc.splitTextToSize(title, ctx.width) as string[];
  doc.text(lines, MARGIN, ctx.y);
  ctx.y += lines.length * 8 + 2;
}

function drawFooters(doc: jsPDF) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const pages = doc.getNumberOfPages();

  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("UTOPIA By Sooatel - Document généré par l'assistant Sooatel", MARGIN, pageH - 8);
    doc.text(`Page ${page} / ${pages}`, pageW - MARGIN, pageH - 8, { align: "right" });
  }
}

function createContext(doc: jsPDF): PdfContext {
  const pageW = doc.internal.pageSize.getWidth();
  return {
    doc,
    y: MARGIN,
    margin: MARGIN,
    width: pageW - MARGIN * 2,
    pageH: doc.internal.pageSize.getHeight(),
  };
}

export async function exportChatPdf(content: string, title?: string): Promise<void> {
  const blocks = parseBlocks(sanitizeText(content));
  const first = blocks[0];
  const heading = !title && first?.type === "heading" ? first.text : undefined;
  const cleanTitle = sanitizeText(title?.trim() || heading || DEFAULT_TITLE);
  const body = heading ? blocks.slice(1) : blocks;

  const logo = await getLogoData();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const ctx = createContext(doc);

  drawBrand(ctx, logo);
  drawTitle(ctx, cleanTitle);
  body.forEach((block) => drawBlock(ctx, block));
  drawFooters(doc);

  doc.save(buildFileName(cleanTitle));
}
