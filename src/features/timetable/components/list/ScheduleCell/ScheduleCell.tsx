import { AlertTriangle } from "lucide-react";
import { EmployeeSelect } from "../EmployeeSelect/EmployeeSelect";
import type { GeneratedScheduleRow, AvailableEmployee } from "../../../types/timetable.type";

interface ScheduleCellProps {
  row: GeneratedScheduleRow | null;
  date: string; // YYYY-MM-DD
  availableEmployees: AvailableEmployee[]; // filtered by job title
  allEmployees: AvailableEmployee[]; // unfiltered
  onChange: (row: GeneratedScheduleRow | null) => void;
}

export function ScheduleCell({
  row,
  date,
  availableEmployees,
  allEmployees,
  onChange,
}: ScheduleCellProps) {
  const isOnLeave = row?.isOnLeave ?? false;

  const handleChange = (idEmployee: string | null) => {
    if (!idEmployee) {
      onChange(null);
      return;
    }
    const emp = allEmployees.find((e) => e.idEmployee === idEmployee);
    if (!emp) return;
    onChange({
      idEmployee: emp.idEmployee,
      employeeName: emp.employeeName,
      idJobTitle: emp.idJobTitle,
      jobTitle: emp.jobTitle,
      scheduleDate: date,
      idShiftType: row?.idShiftType ?? null,
      shiftLabel: row?.shiftLabel ?? null,
      isOnLeave: false,
    });
  };

  return (
    <div
      className={`relative p-1 rounded-md transition-colors ${
        isOnLeave
          ? "bg-destructive/10 border border-destructive/30"
          : "bg-background border border-transparent hover:border-border"
      }`}
    >
      {isOnLeave && (
        <div className="flex items-center gap-1 text-destructive text-[10px] font-medium mb-1">
          <AlertTriangle className="size-3 shrink-0" />
          En congé
        </div>
      )}
      <EmployeeSelect
        value={row?.idEmployee ?? null}
        employees={availableEmployees}
        allEmployees={allEmployees}
        date={date}
        onChange={handleChange}
      />
    </div>
  );
}
