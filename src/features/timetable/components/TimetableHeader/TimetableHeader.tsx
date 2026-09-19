import { CalendarCheck, Users, LayoutGrid, AlertTriangle, Loader2 } from "lucide-react";
import { DateRangePicker } from "../list/DateRangePicker/DateRangePicker";

export type Mode = "team" | "manual";

interface TimetableHeaderProps {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  existingCount: number;
  isLoadingExisting: boolean;
  isDirty: boolean;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export function TimetableHeader({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  existingCount,
  isLoadingExisting,
  isDirty,
  mode,
  onModeChange,
}: TimetableHeaderProps) {
  const tabClass = (m: Mode) =>
    `flex items-center gap-2 px-5 py-2.5 font-semibold text-sm transition-colors border-b-2 ${
      mode === m
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-secondary hover:bg-muted/30"
    }`;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-secondary flex items-center gap-2">
          <CalendarCheck className="size-6 text-primary" />
          Génération d'Emploi du Temps
        </h2>
        <p className="text-sm text-muted-foreground">
          Générez ou modifiez le planning d'une période. Le planning existant sera chargé automatiquement.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-wrap">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={onStartChange}
          onEndChange={onEndChange}
        />

        {existingCount > 0 && !isDirty && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            <AlertTriangle className="size-3" />
            Planning existant ({existingCount} créneaux) — modifiable directement
          </div>
        )}
        
        {isLoadingExisting && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Chargement du planning...
          </div>
        )}

        <div className="flex border-b border-border/50">
          <button className={tabClass("team")} onClick={() => onModeChange("team")}>
            <Users className="size-4" /> Par Équipe
          </button>
          <button className={tabClass("manual")} onClick={() => onModeChange("manual")}>
            <LayoutGrid className="size-4" /> Manuel
          </button>
        </div>
      </div>
    </>
  );
}
