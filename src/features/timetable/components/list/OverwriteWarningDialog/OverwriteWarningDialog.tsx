import { AlertTriangle } from "lucide-react";
import type { CheckExistingResult } from "../../../types/timetable.type";

interface OverwriteDialogProps {
  result: CheckExistingResult;
  onConfirm: () => void;
  onCancel: () => void;
}

export function OverwriteWarningDialog({ result, onConfirm, onCancel }: OverwriteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border overflow-hidden">
        <div className="p-6 border-b flex items-start gap-3">
          <AlertTriangle className="size-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Planning existant détecté</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {result.count} créneau{result.count > 1 ? "x" : ""} sont déjà planifiés sur ces dates.
            </p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Les dates suivantes sont déjà couvertes par un planning :
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {result.dates.map((d) => (
              <span key={d} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-medium">
                {new Date(d + "T00:00:00Z").toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  timeZone: "UTC",
                })}
              </span>
            ))}
          </div>
          <p className="text-sm font-medium">
            Voulez-vous écraser le planning existant pour ces dates ?
          </p>
        </div>
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
          >
            Écraser et continuer
          </button>
        </div>
      </div>
    </div>
  );
}
