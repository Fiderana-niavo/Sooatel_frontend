import { CalendarRange } from "lucide-react";

interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}

export function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }: DateRangePickerProps) {
  const handleEndChange = (v: string) => {
    // Ensure end >= start
    if (v < startDate) {
      onEndChange(startDate);
    } else {
      onEndChange(v);
    }
  };

  const handleStartChange = (v: string) => {
    onStartChange(v);
    // Auto-adjust end if it becomes before start
    if (endDate < v) {
      onEndChange(v);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <CalendarRange className="size-4 text-primary shrink-0" />
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground font-medium">Du</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => handleStartChange(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground font-medium">au</label>
        <input
          type="date"
          value={endDate}
          min={startDate}
          onChange={(e) => handleEndChange(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
    </div>
  );
}
