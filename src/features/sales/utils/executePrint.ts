import type { SaleRecord } from "../types";
import { getTicketConfig } from "./ticketStorage";
import { printSalePdf } from "./ticketPdf";

import type { TicketConfig } from "./ticketStorage";

export const openPrintWindow = (
  title: string = "Génération du document...",
  message: string = "Préparation du document pour impression...",
): Window | null => {
  if (typeof window === "undefined") return null;
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(
      `<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#475569;background:#f8fafc;}</style></head><body><p>${message}</p></body></html>`,
    );
  }
  return win;
};

export const executePrint = async (
  sale: SaleRecord,
  targetWin?: Window | null,
  customConfig?: TicketConfig,
): Promise<void> => {
  try {
    const config = customConfig ?? getTicketConfig();
    await printSalePdf(sale, config, targetWin);
  } catch (err: unknown) {
    if (targetWin && !targetWin.closed) {
      targetWin.close();
    }
    throw err;
  }
};
