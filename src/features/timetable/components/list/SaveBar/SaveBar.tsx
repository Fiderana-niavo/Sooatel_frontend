import { Save, Loader2 } from "lucide-react";

interface SaveBarProps {
  isDirty: boolean;
  isSaving: boolean;
  rowCount: number;
  onSave: () => void;
  onReset: () => void;
}

export function SaveBar({ isDirty, isSaving, rowCount, onSave, onReset }: SaveBarProps) {
  if (!isDirty) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 bg-secondary text-secondary-foreground px-6 py-3 rounded-2xl shadow-2xl border border-secondary-foreground/10">
        <span className="text-sm font-medium">
          {rowCount} créneau{rowCount > 1 ? "x" : ""} à valider
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-secondary-foreground/10 hover:bg-secondary-foreground/20 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Valider le planning
          </button>
        </div>
      </div>
    </div>
  );
}
