export const getCoveredDays = (id: number): number[] => {
  if (id === -1) return [0, 1, 2, 3, 4, 5, 6]; // Every day
  if (id === -2) return [1, 2, 3, 4, 5];       // Monday to Friday
  if (id === -3) return [1, 2, 3, 4, 5, 6];    // Monday to Saturday
  return [id];
};

export function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function toIsoDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split("T")[0] as string;
}

export function toIsoDateTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().slice(0, 16);
}

export const formatDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr));
};

export const getDaysLeft = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  return Math.round((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export function buildDayRange(startDate: string, endDate: string): string[] {
  const days: string[] = [];
  const cursor = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
