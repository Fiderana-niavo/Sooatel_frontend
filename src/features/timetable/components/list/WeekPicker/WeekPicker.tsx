import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface WeekPickerProps {
  weekStart: string; // YYYY-MM-DD (Monday)
  onChange: (monday: string) => void;
}

function getMondayOf(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatWeekLabel(monday: string): string {
  const end = addDays(monday, 6);
  const fmt = (s: string) =>
    new Date(s + "T00:00:00Z").toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  return `${fmt(monday)} — ${fmt(end)}`;
}

export function WeekPicker({ weekStart, onChange }: WeekPickerProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(getMondayOf(e.target.value));
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(addDays(weekStart, -7))}
        className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-secondary transition-colors"
        title="Semaine précédente"
      >
        <ChevronLeft className="size-4" />
      </button>

      <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border bg-background hover:bg-muted/30 transition-colors text-sm font-medium">
        <Calendar className="size-4 text-primary" />
        <span>{formatWeekLabel(weekStart)}</span>
        <input
          type="date"
          value={weekStart}
          onChange={handleInputChange}
          className="sr-only"
        />
      </label>

      <button
        type="button"
        onClick={() => onChange(addDays(weekStart, 7))}
        className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-secondary transition-colors"
        title="Semaine suivante"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
