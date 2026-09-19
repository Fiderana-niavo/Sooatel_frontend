import { RefreshCw, Loader2 } from "lucide-react";
import type { Team, ShiftType } from "@/features/planning/types/type";

interface TeamRotationPanelProps {
  teams: Team[];
  shifts: ShiftType[];
  selectedTeamIds: string[];
  idRotationShift: string;
  isGenerating: boolean;
  onSelectedTeamsChange: (ids: string[]) => void;
  onRotationShiftChange: (idShiftType: string) => void;
  onGenerate: () => void;
}


function formatShiftLabel(shift: ShiftType): string {
  return `${shift.label} (${shift.customStartTime} – ${shift.customEndTime})`;
}

export function TeamRotationPanel({
  teams,
  shifts,
  selectedTeamIds,
  idRotationShift,
  isGenerating,
  onSelectedTeamsChange,
  onRotationShiftChange,
  onGenerate,
}: TeamRotationPanelProps) {

  const toggleTeam = (id: string) => {

    if (selectedTeamIds.includes(id)) {
      onSelectedTeamsChange(selectedTeamIds.filter((t) => t !== id));
    } else {
      onSelectedTeamsChange([...selectedTeamIds, id]);
    }
  };

  const canGenerate = selectedTeamIds.length > 0 && idRotationShift !== "";

  return (
    <div className="space-y-6">
      {/* Rotation shift */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border">
        <div className="flex-1">
          <label className="text-sm font-semibold text-secondary block mb-1">
            Shift de rotation
          </label>
          <p className="text-xs text-muted-foreground">
            La durée de ce shift détermine la période au bout de laquelle les équipes changent de quart.
          </p>
        </div>
        <select
          value={idRotationShift}
          onChange={(e) => onRotationShiftChange(e.target.value)}
          className="border rounded-lg px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[200px]"
        >
          <option value="">-- Choisir un shift de rotation --</option>
          {shifts.map((s) => (
            <option key={s.idShiftType} value={s.idShiftType}>
              {formatShiftLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Teams selection */}
        <div>
          <p className="text-sm font-semibold text-secondary mb-3">Équipes à inclure dans la rotation</p>
          {teams.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune équipe trouvée.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {teams.map((team) => (
                <label
                  key={team.idTeam}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTeamIds.includes(team.idTeam)}
                    onChange={() => toggleTeam(team.idTeam)}
                    className="size-4 rounded border-border text-primary focus:ring-primary/50"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{team.teamName}</div>
                    {team.description && (
                      <div className="text-xs text-muted-foreground truncate">{team.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Generate button */}

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate || isGenerating}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
      >
        {isGenerating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        {isGenerating ? "Génération en cours..." : "Générer le planning par équipe"}
      </button>
    </div>
  );
}
