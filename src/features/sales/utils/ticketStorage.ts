export type TicketFormat = "58mm" | "80mm" | "A5" | "A4" | "custom";

export interface TicketConfig {
  type: TicketFormat;
  width: number;
}

export const STORAGE_KEY = "ticketFormat";

export const DEFAULT_CONFIG: TicketConfig = {
  type: "80mm",
  width: 80,
};

export const MIN_WIDTH = 40;
export const MAX_WIDTH = 300;

export const PRESET_WIDTHS: Record<TicketFormat, number> = {
  "58mm": 58,
  "80mm": 80,
  A5: 148,
  A4: 210,
  custom: 80,
};

export const getTicketConfig = (): TicketConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;

    const parsed = JSON.parse(raw) as Partial<TicketConfig>;
    if (!parsed || typeof parsed !== "object") return DEFAULT_CONFIG;

    const format = parsed.type;
    if (!format || !["58mm", "80mm", "A5", "A4", "custom"].includes(format)) {
      return DEFAULT_CONFIG;
    }

    let width = Number(parsed.width);
    if (isNaN(width) || width < MIN_WIDTH || width > MAX_WIDTH) {
      width = PRESET_WIDTHS[format] ?? 80;
    }

    return { type: format, width };
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const saveTicketConfig = (config: TicketConfig): boolean => {
  try {
    let width = config.width;
    if (config.type !== "custom") {
      width = PRESET_WIDTHS[config.type] ?? 80;
    } else {
      if (isNaN(width) || width < MIN_WIDTH) width = MIN_WIDTH;
      if (width > MAX_WIDTH) width = MAX_WIDTH;
    }

    const value: TicketConfig = {
      type: config.type,
      width,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
