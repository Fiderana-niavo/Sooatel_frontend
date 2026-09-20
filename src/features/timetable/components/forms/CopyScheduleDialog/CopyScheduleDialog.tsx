import { useState } from "react";
import { X, Copy } from "lucide-react";
import { buildDayRange, toIsoDate } from "@/utils/date";

interface CopyScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentStartDate: string;
  currentEndDate: string;
  onCopy: (mappings: { sourceDate: string; targetDate: string }[]) => void;
}

export function CopyScheduleDialog({
  isOpen,
  onClose,
  currentStartDate,
  currentEndDate,
  onCopy,
}: CopyScheduleDialogProps) {
  // State: For each day in the current period, what is its target date? 
  // If target date is empty string, it's not selected for copying.
  const [mappings, setMappings] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const currentDays = buildDayRange(currentStartDate, currentEndDate);

  const toggleDay = (day: string) => {
    setMappings(prev => {
      const next = { ...prev };
      if (next[day] !== undefined) {
        delete next[day];
      } else {
        // Default target date is the same date next week
        const d = new Date(day);
        d.setDate(d.getDate() + 7);
        next[day] = toIsoDate(d);
      }
      return next;
    });
  };

  const updateTargetDate = (day: string, target: string) => {
    setMappings(prev => ({ ...prev, [day]: target }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newMappings: Record<string, string> = {};
      currentDays.forEach(day => {
        if (mappings[day] !== undefined) {
          newMappings[day] = mappings[day];
        } else {
          const d = new Date(day);
          d.setDate(d.getDate() + 7);
          newMappings[day] = toIsoDate(d);
        }
      });
      setMappings(newMappings);
    } else {
      setMappings({});
    }
  };

  const allSelected = currentDays.length > 0 && currentDays.every(d => mappings[d] !== undefined);

  const handleCopy = () => {
    const arr = Object.entries(mappings).map(([sourceDate, targetDate]) => ({
      sourceDate,
      targetDate
    }));
    onCopy(arr);
    onClose();
  };

  const hasSelection = Object.keys(mappings).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl border shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
        >
          <X className="size-4" />
        </button>

        <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
          <Copy className="size-5 text-primary" />
          Copier vers...
        </h3>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Quelles journées souhaitez-vous copier ?</p>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium bg-muted/50 px-2 py-1 rounded-md hover:bg-muted transition-colors">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="text-primary rounded focus:ring-primary/50"
              />
              Tout sélectionner
            </label>
          </div>
          
          <div className="flex flex-col gap-3">
            {currentDays.map((d) => {
              const isSelected = mappings[d] !== undefined;
              const target = mappings[d] || "";

              return (
                <div key={d} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isSelected ? "bg-primary/5 border-primary/30" : "bg-background border-border"}`}>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleDay(d)}
                      className="text-primary rounded focus:ring-primary/50"
                    />
                    {new Date(d).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                  </label>

                  {isSelected && (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs text-muted-foreground">vers</span>
                      <input
                        type="date"
                        value={target}
                        onChange={(e) => updateTargetDate(d, e.target.value)}
                        className="w-full border rounded-md px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleCopy}
            disabled={!hasSelection}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Copy className="size-4" />
            Copier les plannings
          </button>
        </div>
      </div>
    </div>
  );
}
