import { ScheduleCell } from "../ScheduleCell/ScheduleCell";
import type { GeneratedScheduleRow, AvailableEmployee, RequirementSlot } from "../../../types/timetable.type";
import { DAY_LABELS_SHORT } from "@/constants/app.constants";

interface ScheduleGridProps {
  days: string[]; // YYYY-MM-DD array (any range, not limited to a week)
  slots: RequirementSlot[];
  rows: GeneratedScheduleRow[];
  availableByJobTitle: Map<string, AvailableEmployee[]>;
  allEmployees: AvailableEmployee[];
  onRowChange: (
    date: string,
    idShiftType: string | null,
    idJobTitle: string | null,
    slotIndex: number,
    row: GeneratedScheduleRow | null,
  ) => void;
}

export function ScheduleGrid({
  days,
  slots,
  rows,
  availableByJobTitle,
  allEmployees,
  onRowChange,
}: ScheduleGridProps) {
  const groupedRows = new Map<string, GeneratedScheduleRow[]>();
  for (const r of rows) {
    const key = `${r.scheduleDate}__${r.idShiftType ?? "custom"}__${r.idJobTitle ?? "any"}`;
    if (!groupedRows.has(key)) groupedRows.set(key, []);
    groupedRows.get(key)!.push(r);
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2">
        <span className="text-3xl">📋</span>
        <p>Aucun besoin en effectif configuré.</p>
        <p className="text-xs">Allez dans "Paramètres de Planification" pour configurer les postes et shifts.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border shadow-sm">
      <table className="w-full text-sm border-collapse" style={{ minWidth: `${Math.max(900, days.length * 140)}px` }}>
        <thead>
          <tr className="bg-muted/60 border-b">
            <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider w-40 sticky left-0 bg-muted/60 z-10">
              Poste / Shift
            </th>
            {days.map((date) => {
              const d = new Date(date + "T00:00:00Z");
              const dow = d.getUTCDay();
              const day = d.getUTCDate();
              const month = d.toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" });
              const isWeekend = dow === 0 || dow === 6;
              return (
                <th
                  key={date}
                  className={`text-center px-3 py-3 font-semibold text-xs uppercase tracking-wider ${isWeekend ? "bg-muted/80 text-muted-foreground" : "text-muted-foreground"
                    }`}
                >
                  <div>{DAY_LABELS_SHORT[dow]}</div>
                  <div className="text-foreground font-bold text-sm normal-case">
                    {day} {month}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {slots.map((slot) =>
            Array.from({ length: slot.requiredCount }, (_, slotIdx) => {
              const isFirstRow = slotIdx === 0;
              return (
                <tr
                  key={`${slot.idJobTitle}-${slot.idShiftType}-${slotIdx}`}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-2 align-middle border-r border-border/50 sticky left-0 bg-background z-10">
                    {isFirstRow ? (
                      <div>
                        <div className="font-semibold text-xs text-secondary truncate">
                          {slot.jobTitle ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {slot.shiftLabel ?? "Shift personnalisé"}
                        </div>
                        <div className="text-[10px] text-primary mt-0.5">
                          {slot.requiredCount} poste{slot.requiredCount > 1 ? "s" : ""}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-muted-foreground pl-2">↳ #{slotIdx + 1}</div>
                    )}
                  </td>

                  {days.map((date) => {
                    const groupKey = `${date}__${slot.idShiftType ?? "custom"}__${slot.idJobTitle ?? "any"}`;
                    const cellRows = groupedRows.get(groupKey) ?? [];
                    const cellRow = cellRows[slotIdx] ?? null;
                    const empsByJob = slot.idJobTitle
                      ? (availableByJobTitle.get(slot.idJobTitle) ?? [])
                      : [];

                    return (
                      <td key={date} className="px-2 py-1.5 align-middle min-w-[130px]">
                        <ScheduleCell
                          row={cellRow}
                          date={date}
                          availableEmployees={empsByJob}
                          allEmployees={allEmployees}
                          onChange={(updated) =>
                            onRowChange(date, slot.idShiftType, slot.idJobTitle, slotIdx, updated)
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
