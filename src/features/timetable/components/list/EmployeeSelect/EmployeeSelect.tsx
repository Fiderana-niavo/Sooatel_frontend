import { useState, useRef, useEffect } from "react";
import { Search, UserCheck, Users } from "lucide-react";
import type { AvailableEmployee } from "../../../types/timetable.type";

interface EmployeeSelectProps {
  value: string | null;
  employees: AvailableEmployee[];
  allEmployees: AvailableEmployee[];
  date: string; // YYYY-MM-DD — used to filter availability tooltip by day of week
  onChange: (idEmployee: string | null) => void;
  placeholder?: string;
}

function dayOfWeek(dateStr: string): number {
  return new Date(dateStr + "T00:00:00Z").getUTCDay();
}

function getAvailabilityLabel(emp: AvailableEmployee, date: string): string | null {
  const dow = dayOfWeek(date);
  const avail = emp.availabilities.find((a) => a.dayOfWeek === dow || a.dayOfWeek === null);
  if (!avail) return null;
  if (avail.shiftLabel) return avail.shiftLabel;
  if (avail.customStartTime && avail.customEndTime)
    return `${avail.customStartTime} – ${avail.customEndTime}`;
  return null;
}

export function EmployeeSelect({
  value,
  employees,
  allEmployees,
  date,
  onChange,
  placeholder = "Sélectionner un employé...",
}: EmployeeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pool = showAll ? allEmployees : employees;
  const filtered = pool.filter((emp) =>
    (emp.employeeName ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const selected = allEmployees.find((e) => e.idEmployee === value);

  const handleSelect = (emp: AvailableEmployee) => {
    onChange(emp.idEmployee);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center gap-2 px-2 py-1 rounded-md border bg-background text-sm hover:bg-muted/30 transition-colors text-left"
      >
        {selected ? (
          <>
            <UserCheck className="size-3 text-primary shrink-0" />
            <span className="flex-1 truncate font-medium">{selected.employeeName}</span>
            <span
              onClick={handleClear}
              className="text-muted-foreground hover:text-destructive cursor-pointer text-xs px-1"
              title="Retirer"
            >
              ✕
            </span>
          </>
        ) : (
          <>
            <Users className="size-3 text-muted-foreground shrink-0" />
            <span className="flex-1 text-muted-foreground truncate">{placeholder}</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-56 bg-card border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-6 pr-3 py-1 text-xs bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-muted/30 border-b">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="w-3 h-3 accent-primary"
            />
            Afficher tous les employés
          </label>

          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-xs text-center text-muted-foreground">
                Aucun employé trouvé.
              </div>
            ) : (
              filtered.map((emp) => {
                const availLabel = getAvailabilityLabel(emp, date);
                return (
                  <div
                    key={emp.idEmployee}
                    onMouseEnter={() => setHovered(emp.idEmployee)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => handleSelect(emp)}
                    className={`relative px-3 py-2 cursor-pointer text-xs transition-colors ${emp.idEmployee === value ? "bg-primary/10 text-primary" : "hover:bg-muted/40"
                      }`}
                  >
                    <div className="font-medium truncate">{emp.employeeName}</div>
                    {emp.jobTitle && (
                      <div className="text-muted-foreground">{emp.jobTitle}</div>
                    )}

                    {hovered === emp.idEmployee && availLabel && (
                      <div className="absolute left-full top-0 ml-2 z-[60] bg-secondary text-secondary-foreground text-xs px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                        <span className="font-medium">Disponible :</span> {availLabel}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
