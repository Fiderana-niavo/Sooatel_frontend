import { jsPDF } from "jspdf";
import utopiaLogo from "@/assets/Utopia.jpeg";
import type { SaleRecord } from "../types";
import type { TicketConfig } from "./ticketStorage";
import { ESTABLISHMENT } from "../constants/ticket.constants";

let logoCache: string | null = null;

export const getLogoData = async (): Promise<string | null> => {
  if (logoCache) return logoCache;
  if (typeof window === "undefined") return null;

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const size = Math.min(img.naturalWidth, img.naturalHeight) || 400;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }

          // Clip to circle so the logo is round, not square
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          // Draw image inside circular boundary
          ctx.drawImage(img, 0, 0, size, size);

          // Convert to crisp black and white / grayscale
          const image = ctx.getImageData(0, 0, size, size);
          const data = image.data;
          const len = data.length;

          for (let i = 0; i < len; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 15) continue;

            const gray = 0.299 * r + 0.587 * g + 0.114 * b;

            // Clean background to pure white
            if (gray > 225) {
              data[i] = 255;
              data[i + 1] = 255;
              data[i + 2] = 255;
            } else {
              // Deepen emblem lines for sharp B&W thermal contrast
              const val = Math.max(0, Math.min(255, (gray - 35) * 1.3));
              data[i] = val;
              data[i + 1] = val;
              data[i + 2] = val;
            }
          }

          ctx.putImageData(image, 0, 0);
          logoCache = canvas.toDataURL("image/png");
          resolve(logoCache);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = utopiaLogo;
    } catch {
      resolve(null);
    }
  });
};

const formatDate = (dateStr: string): string => {
  try {
    const val = new Date(dateStr);
    return val
      .toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(/[\s\u202F\u00A0]/g, " ");
  } catch {
    return dateStr;
  }
};

const formatNumber = (val: number): string => {
  return Number(val || 0)
    .toLocaleString("fr-FR")
    .replace(/[\s\u202F\u00A0]/g, " ");
};

const formatAmount = (val: number): string => {
  return `${formatNumber(val)} Ar`;
};

const drawDash = (doc: jsPDF, x1: number, y: number, x2: number) => {
  doc.setDrawColor(160);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([0.8, 0.8], 0);
  doc.line(x1, y, x2, y);
  doc.setLineDashPattern([], 0);
};

const computeHeight = (
  sale: SaleRecord,
  width: number,
  hasLogo: boolean,
): number => {
  const narrow = width < 65;
  const dummy = new jsPDF({ orientation: "portrait", unit: "mm", format: [width, 400] });

  if (narrow) {
    const margin = 2.5;
    const content = width - margin * 2;
    let y = 3;

    if (hasLogo) y += 9.5 + 3.5; // logo + gap
    y += 3.5 + 3 + 2.8 + 2.8 + 3.5; // name, subtitle, address, tel
    y += 3.5 + 3.5; // dash + FACTURE
    y += 3 + 3 + 3 + 3; // ref, date, table, room
    if (sale.saler) y += 3;
    y += 3.5 + 3.5; // dash + spacing

    for (const item of sale.saleItems) {
      const label = item.menu?.item?.label || `Menu #${item.idMenu.slice(0, 6)}`;
      const split = dummy.splitTextToSize(label, content);
      y += split.length * 3.2 + 4;
    }

    y += 4 + 5; // dash + total
    y += 3.5; // reste a payer
    y += 4 + 3.5 + 10 + 4 + 3; // legal + dash + signatures + footer + bottom margin
    return Math.ceil(y);
  } else {
    // 80mm
    const margin = 3;
    const usable = width - margin * 2;
    const col2 = Math.max(20, usable - (8 + 15 + 18));
    let y = 31.5; // header + separator

    y += 5; // table header
    for (const item of sale.saleItems) {
      const label = item.menu?.item?.label || `Menu #${item.idMenu.slice(0, 6)}`;
      const split = dummy.splitTextToSize(label, col2 - 2);
      const rowH = Math.max(5, split.length * 3.4 + 1.2);
      y += rowH;
    }

    y += 2 + 6 + 3; // gap + total box
    y += 3.5; // legal
    y += 3.5; // reste a payer
    y += 3.5 + 10 + 4 + 3; // dash + signatures + footer + bottom margin
    return Math.ceil(y);
  }
};

const renderNarrowTicket = (
  doc: jsPDF,
  sale: SaleRecord,
  width: number,
  logo: string | null,
) => {
  const margin = 2.5;
  const content = width - margin * 2;
  let y = 3;

  if (logo) {
    const size = 9.5;
    doc.addImage(logo, "PNG", margin, y, size, size);
    y += size + 3.5;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(ESTABLISHMENT.name, margin, y);
  y += 3.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(ESTABLISHMENT.subtitle, margin, y);
  y += 3;

  doc.setFontSize(6);
  doc.text(`${ESTABLISHMENT.address} - ${ESTABLISHMENT.city}`, margin, y);
  y += 2.8;
  doc.text(`Tél : ${ESTABLISHMENT.phone}`, margin, y);
  y += 3.5;

  drawDash(doc, margin, y, width - margin);
  y += 3.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(ESTABLISHMENT.receiptTitle, width / 2, y, { align: "center" });
  y += 3.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  const ref = sale.invoice?.invoiceNumber || sale.ref;
  doc.text(`N° : ${ref}`, margin, y);
  y += 3;

  doc.text(`Date : ${formatDate(sale.saleDate)}`, margin, y);
  y += 3;

  doc.text(`N° de table : ${sale.tableNumber ?? "—"}`, margin, y);
  y += 3;

  doc.text(`Chambre : ${sale.room?.roomNumber ?? "—"}`, margin, y);
  y += 3;

  if (sale.saler) {
    doc.text(`Serveur : ${sale.saler.name} ${sale.saler.lastname}`, margin, y);
    y += 3;
  }

  drawDash(doc, margin, y, width - margin);
  y += 3.5;

  // Items
  for (const item of sale.saleItems) {
    const label = item.menu?.item?.label || `Menu #${item.idMenu.slice(0, 6)}`;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const split = doc.splitTextToSize(label, content);
    doc.text(split, margin, y);
    y += split.length * 3.2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    const lineQty = `${item.quantity} × ${formatNumber(item.unitPrice)}`;
    doc.text(lineQty, margin, y);
    doc.setFont("helvetica", "bold");
    doc.text(formatNumber(item.totalAmount), width - margin, y, {
      align: "right",
    });
    y += 4;
  }

  drawDash(doc, margin, y, width - margin);
  y += 4;

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("MONTANT TOTAL :", margin, y);
  doc.text(formatAmount(sale.totalAmount), width - margin, y, {
    align: "right",
  });
  y += 5;

  // Reste à payer en bas
  const balance = sale.invoice?.balanceDue != null ? Number(sale.invoice.balanceDue) : 0;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(`Reste à payer : ${formatAmount(balance)}`, margin, y);
  y += 3.5;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(5.5);
  doc.text(ESTABLISHMENT.legalText, width / 2, y, {
    align: "center",
  });
  y += 4;

  drawDash(doc, margin, y, width - margin);
  y += 3.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text("Le responsable", margin + 1, y);
  doc.text("Le client", width - margin - 1, y, { align: "right" });
  y += 10;

  doc.setFontSize(6);
  doc.text(ESTABLISHMENT.thankYou, width / 2, y, { align: "center" });
};

const renderStandardTicket = (
  doc: jsPDF,
  sale: SaleRecord,
  width: number,
  logo: string | null,
) => {
  const margin = 3;
  let y = 3;

  // Top header Left: Round B&W Logo in the corner
  if (logo) {
    const size = 11;
    doc.addImage(logo, "PNG", margin, y, size, size);
  }

  const startY = y + 15; // clear gap between logo and UTOPIA
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(ESTABLISHMENT.name, margin, startY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(ESTABLISHMENT.subtitle, margin, startY + 3);

  doc.setFontSize(5.5);
  doc.text(`${ESTABLISHMENT.address} - ${ESTABLISHMENT.city}`, margin, startY + 5.8);
  doc.text(`Tél : ${ESTABLISHMENT.phone}`, margin, startY + 8.6);

  // Top header Right: Invoice details
  const rightX = width - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(ESTABLISHMENT.receiptTitle, rightX, 6.5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  const ref = sale.invoice?.invoiceNumber || sale.ref;
  doc.text(`N° : ${ref}`, rightX, 10, { align: "right" });
  doc.text(`Date : ${formatDate(sale.saleDate)}`, rightX, 13.5, {
    align: "right",
  });
  doc.text("Doit : ....................................", rightX, 17, {
    align: "right",
  });
  doc.text(`N° de table : ${sale.tableNumber ?? "—"}`, rightX, 20.5, {
    align: "right",
  });
  doc.text(`Chambre : ${sale.room?.roomNumber ?? "—"}`, rightX, 24, {
    align: "right",
  });

  if (sale.saler) {
    doc.text(`Serveur : ${sale.saler.name}`, rightX, 27.5, { align: "right" });
  }

  y = 31.5;
  drawDash(doc, margin, y, width - margin);
  y += 2.5;

  // Columns layout: usable = width - margin * 2 (74mm on 80mm)
  const usable = width - margin * 2;
  const col1 = 8;
  const col3 = 15;
  const col4 = 18;
  const col2 = Math.max(20, usable - (col1 + col3 + col4));

  const x1 = margin;
  const x2 = x1 + col1;
  const x3 = x2 + col2;
  const x4 = x3 + col3;
  const xEnd = x4 + col4;

  // Header row
  doc.setFillColor(245, 245, 245);
  doc.rect(x1, y, usable, 5, "F");
  doc.setDrawColor(180);
  doc.setLineWidth(0.2);
  doc.rect(x1, y, usable, 5, "S");

  doc.line(x2, y, x2, y + 5);
  doc.line(x3, y, x3, y + 5);
  doc.line(x4, y, x4, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("Qtés", x1 + col1 / 2, y + 3.5, { align: "center" });
  doc.text("Désignation", x2 + 1.5, y + 3.5);
  doc.text("P.U", x4 - 2, y + 3.5, { align: "right" });
  doc.text("Montant", xEnd - 2, y + 3.5, { align: "right" });

  y += 5;

  // Items (amounts without "Ar")
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);

  for (const item of sale.saleItems) {
    const label = item.menu?.item?.label || `Menu #${item.idMenu.slice(0, 6)}`;
    const split = doc.splitTextToSize(label, col2 - 2);
    const rowH = Math.max(5, split.length * 3.4 + 1.2);

    doc.rect(x1, y, usable, rowH, "S");
    doc.line(x2, y, x2, y + rowH);
    doc.line(x3, y, x3, y + rowH);
    doc.line(x4, y, x4, y + rowH);

    doc.text(String(item.quantity), x1 + col1 / 2, y + 3.4, {
      align: "center",
    });
    doc.text(split, x2 + 1.5, y + 3.4);
    doc.text(formatNumber(item.unitPrice), x4 - 2, y + 3.4, {
      align: "right",
    });
    doc.text(formatNumber(item.totalAmount), xEnd - 2, y + 3.4, {
      align: "right",
    });

    y += rowH;
  }

  y += 2;

  // Dynamic Montant total box (expands according to total length)
  const totalStr = formatAmount(sale.totalAmount);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  const textWidth = doc.getTextWidth(totalStr);
  const boxW = Math.max(26, textWidth + 6);
  const boxH = 6;
  const boxX = xEnd - boxW;

  doc.setFontSize(7);
  doc.text("Montant total", boxX - 2, y + 4.2, { align: "right" });

  doc.setDrawColor(140);
  doc.setLineWidth(0.3);
  doc.rect(boxX, y, boxW, boxH, "S");
  doc.setFontSize(7.5);
  doc.text(totalStr, boxX + boxW / 2, y + 4.2, {
    align: "center",
  });

  y += boxH + 3;

  // Somme arrêtée
  doc.setFont("helvetica", "italic");
  doc.setFontSize(5.5);
  doc.text(ESTABLISHMENT.legalText, margin, y);
  y += 3.5;

  // Reste à payer en bas (remplace les répétitions de règlements)
  const balanceDue = sale.invoice?.balanceDue != null ? Number(sale.invoice.balanceDue) : 0;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(`Reste à payer : ${formatAmount(balanceDue)}`, margin, y);
  y += 3.5;

  drawDash(doc, margin, y, width - margin);
  y += 3.5;

  // Signatures
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("Le responsable", margin + 2, y);
  doc.text("Le client", width - margin - 2, y, { align: "right" });
  y += 10;

  doc.setFontSize(6);
  doc.text(ESTABLISHMENT.thankYou, width / 2, y, { align: "center" });
};

export const generateThermalTicket = (
  sale: SaleRecord,
  width: number,
  logo: string | null,
): jsPDF => {
  const height = computeHeight(sale, width, !!logo);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [width, height],
  });

  if (width < 65) {
    renderNarrowTicket(doc, sale, width, logo);
  } else {
    renderStandardTicket(doc, sale, width, logo);
  }

  return doc;
};

export const generateInvoicePage = (
  sale: SaleRecord,
  format: "a4" | "a5",
  logo: string | null,
): jsPDF => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format,
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = format === "a5" ? 10 : 14;
  const usable = pageW - margin * 2;

  let y = margin;

  // Header Left: Logo in the corner & Company
  if (logo) {
    const size = format === "a5" ? 14 : 18;
    doc.addImage(logo, "PNG", margin, y, size, size);
    y += size + 3;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(format === "a5" ? 11 : 13);
  doc.text(ESTABLISHMENT.name, margin, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(format === "a5" ? 8.5 : 9.5);
  doc.text(ESTABLISHMENT.subtitle, margin, y);
  y += 3.5;

  doc.setFontSize(format === "a5" ? 7.5 : 8.5);
  doc.text(`${ESTABLISHMENT.address} - ${ESTABLISHMENT.city}`, margin, y);
  y += 3.2;
  doc.text(`Tél : ${ESTABLISHMENT.phone}`, margin, y);

  // Header Right: Invoice Card
  const cardW = format === "a5" ? 64 : 76;
  const cardH = format === "a5" ? 34 : 40;
  const cardX = pageW - margin - cardW;
  const cardY = margin;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, "FD");

  let cardTextY = cardY + 5.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(format === "a5" ? 11 : 13);
  doc.setTextColor(30, 41, 59);
  doc.text(ESTABLISHMENT.receiptTitle, cardX + cardW / 2, cardTextY, { align: "center" });
  cardTextY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(format === "a5" ? 7.5 : 8.5);
  doc.setTextColor(71, 85, 105);
  const ref = sale.invoice?.invoiceNumber || sale.ref;
  doc.text(`N° : ${ref}`, cardX + 4, cardTextY);
  cardTextY += 4;

  doc.text(`Date : ${formatDate(sale.saleDate)}`, cardX + 4, cardTextY);
  cardTextY += 4;

  doc.text("Doit : .....................................................", cardX + 4, cardTextY);
  cardTextY += 4;

  doc.text(`N° de table : ${sale.tableNumber ?? "—"}`, cardX + 4, cardTextY);
  cardTextY += 4;

  doc.text(`Chambre : ${sale.room?.roomNumber ?? "—"}`, cardX + 4, cardTextY);
  cardTextY += 4;

  if (sale.saler) {
    doc.text(`Serveur : ${sale.saler.name} ${sale.saler.lastname}`, cardX + 4, cardTextY);
  }

  doc.setTextColor(0, 0, 0);

  y = Math.max(y + 8, cardY + cardH + 8);

  // Items table
  const colQty = format === "a5" ? 14 : 18;
  const colPrice = format === "a5" ? 26 : 34;
  const colTotal = format === "a5" ? 28 : 36;
  const colLabel = usable - (colQty + colPrice + colTotal);

  const x0 = margin;
  const x1 = x0 + colQty;
  const x2 = x1 + colLabel;
  const x3 = x2 + colPrice;
  const x4 = x3 + colTotal;

  // Table header
  const headerH = 7;
  doc.setFillColor(241, 245, 249);
  doc.rect(x0, y, usable, headerH, "F");
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.rect(x0, y, usable, headerH, "S");

  doc.line(x1, y, x1, y + headerH);
  doc.line(x2, y, x2, y + headerH);
  doc.line(x3, y, x3, y + headerH);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(format === "a5" ? 7.5 : 8.5);
  doc.text("Qté", x0 + colQty / 2, y + 4.8, { align: "center" });
  doc.text("Désignation", x1 + 2, y + 4.8);
  doc.text("Prix Unitaire", x3 - 2, y + 4.8, { align: "right" });
  doc.text("Montant", x4 - 2, y + 4.8, { align: "right" });

  y += headerH;

  // Table body (amounts without "Ar")
  doc.setFont("helvetica", "normal");
  doc.setFontSize(format === "a5" ? 7.5 : 8.5);

  for (const item of sale.saleItems) {
    const label = item.menu?.item?.label || `Menu #${item.idMenu.slice(0, 8)}`;
    const split = doc.splitTextToSize(label, colLabel - 4);
    const rowH = Math.max(6.5, split.length * 4 + 2);

    if (y + rowH > pageH - 45) {
      doc.addPage();
      y = margin;
    }

    doc.rect(x0, y, usable, rowH, "S");
    doc.line(x1, y, x1, y + rowH);
    doc.line(x2, y, x2, y + rowH);
    doc.line(x3, y, x3, y + rowH);

    doc.text(String(item.quantity), x0 + colQty / 2, y + 4.5, {
      align: "center",
    });
    doc.text(split, x1 + 2, y + 4.5);
    doc.text(formatNumber(item.unitPrice), x3 - 2, y + 4.5, {
      align: "right",
    });
    doc.text(formatNumber(item.totalAmount), x4 - 2, y + 4.5, {
      align: "right",
    });

    y += rowH;
  }

  y += 4;

  // Total summary box (dynamic width)
  const fullTotalStr = formatAmount(sale.totalAmount);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(format === "a5" ? 8.5 : 9.5);
  const dynW = doc.getTextWidth(fullTotalStr);
  const totalBoxW = Math.max(format === "a5" ? 60 : 75, dynW + 40);
  const totalBoxH = 8;
  const totalBoxX = pageW - margin - totalBoxW;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(148, 163, 184);
  doc.rect(totalBoxX, y, totalBoxW, totalBoxH, "FD");

  doc.text("TOTAL GÉNÉRAL :", totalBoxX + 3, y + 5.5);
  doc.text(fullTotalStr, pageW - margin - 3, y + 5.5, {
    align: "right",
  });

  y += totalBoxH + 4;

  // Reste à payer
  const bal = sale.invoice?.balanceDue != null ? Number(sale.invoice.balanceDue) : 0;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(format === "a5" ? 7.5 : 8.5);
  doc.text(`Reste à payer : ${formatAmount(bal)}`, margin, y);
  y += 4;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(format === "a5" ? 7 : 8);
  doc.text(ESTABLISHMENT.legalText, margin, y);

  y += 8;

  // Signature boxes
  const sigW = (usable - 8) / 2;
  const sigH = format === "a5" ? 18 : 22;

  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, sigW, sigH);
  doc.rect(margin + sigW + 8, y, sigW, sigH);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(format === "a5" ? 7 : 8);
  doc.text("Le responsable", margin + 3, y + 4.5);
  doc.text("Le client", margin + sigW + 11, y + 4.5);

  // Footer on all pages
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${ESTABLISHMENT.name} ${ESTABLISHMENT.subtitle} - ${ESTABLISHMENT.address}, ${ESTABLISHMENT.city} - Tél : ${ESTABLISHMENT.phone}`,
      margin,
      pageH - 6,
    );
    doc.text(`Page ${i} / ${pages}`, pageW - margin, pageH - 6, {
      align: "right",
    });
  }

  return doc;
};

export const generatePdfBlob = async (
  sale: SaleRecord,
  config: TicketConfig,
): Promise<Blob> => {
  const logo = await getLogoData();
  let doc: jsPDF;

  if (config.type === "A4") {
    doc = generateInvoicePage(sale, "a4", logo);
  } else if (config.type === "A5") {
    doc = generateInvoicePage(sale, "a5", logo);
  } else {
    const width = config.type === "58mm" ? 58 : config.type === "80mm" ? 80 : config.width;
    doc = generateThermalTicket(sale, width, logo);
  }

  return doc.output("blob");
};

export const printSalePdf = async (
  sale: SaleRecord,
  config: TicketConfig,
  targetWindow?: Window | null,
): Promise<void> => {
  const blob = await generatePdfBlob(sale, config);
  const url = URL.createObjectURL(blob);

  if (targetWindow && !targetWindow.closed) {
    targetWindow.location.href = url;
  } else {
    window.open(url, "_blank");
  }
};
