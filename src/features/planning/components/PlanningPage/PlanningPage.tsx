import { useState, useEffect, useCallback } from "react";
import { TeamsTab } from "../TeamsTab/TeamsTab";
import { ShiftTypesTab } from "../ShiftTypesTab/ShiftTypesTab";
import { Users, Clock, Settings2 } from "lucide-react";

import type { Team, ShiftType } from "../../types/type";
import { TeamService } from "../../services/team.service";
import { ShiftTypeService } from "../../services/shift-type.service";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";

export function PlanningPage() {
  const [activeTab, setActiveTab] = useState<"teams" | "shifts">("teams");
  const [teams, setTeams] = useState<Team[]>([]);
  const [shifts, setShifts] = useState<ShiftType[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [teamForm, setTeamForm] = useState<Partial<Team>>({});
  
  const [shiftId, setShiftId] = useState<string | null>(null);
  const [shiftForm, setShiftForm] = useState<Partial<ShiftType>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"team" | "shift" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTeams = useCallback(async () => {
    try {
      const records = await TeamService.getAll();
      setTeams(records);
    } catch (err: unknown) {
      console.error("Failed to load teams:", err);
    }
  }, []);

  const loadShifts = useCallback(async () => {
    try {
      const records = await ShiftTypeService.getAll();
      setShifts(records);
    } catch (err: unknown) {
      console.error("Failed to load shift types:", err);
    }
  }, []);

  useEffect(() => {
    loadTeams();
    loadShifts();
  }, [loadTeams, loadShifts]);
  const addTeam = () => {
    setTeamForm({ teamName: "", description: "" });
    setEditId("new");
  };

  const editTeam = (team: Team) => {
    setTeamForm({ ...team });
    setEditId(team.idTeam);
  };

  const saveTeam = async () => {
    if (!teamForm.teamName?.trim()) return;

    try {
      const payload = {
        teamName: teamForm.teamName.trim(),
        description: teamForm.description?.trim() || "",
      };

      if (editId === "new") {
        await TeamService.create(payload);
      } else if (editId) {
        await TeamService.update(editId, payload);
      }

      setEditId(null);
      await loadTeams();
    } catch (err: unknown) {
      console.error("Error saving team:", err);
      alert(err instanceof Error ? err.message : "Une erreur est survenue lors de l'enregistrement de l'équipe.");
    }
  };

  const promptDeleteTeam = (id: string) => {
    setItemToDelete(id);
    setDeleteType("team");
    setConfirmOpen(true);
  };
  const addShift = () => {
    setShiftForm({ label: "", customStartTime: "08:00", customEndTime: "16:00", description: "" });
    setShiftId("new");
  };

  const editShift = (shift: ShiftType) => {
    setShiftForm({ ...shift });
    setShiftId(shift.idShiftType);
  };

  const saveShift = async () => {
    if (!shiftForm.label?.trim() || !shiftForm.customStartTime?.trim() || !shiftForm.customEndTime?.trim()) return;

    try {
      const payload = {
        label: shiftForm.label.trim(),
        customStartTime: shiftForm.customStartTime.trim(),
        customEndTime: shiftForm.customEndTime.trim(),
        description: shiftForm.description?.trim() || "",
      };

      if (shiftId === "new") {
        await ShiftTypeService.create(payload);
      } else if (shiftId) {
        await ShiftTypeService.update(shiftId, payload);
      }

      setShiftId(null);
      await loadShifts();
    } catch (err: unknown) {
      console.error("Error saving shift:", err);
      alert(err instanceof Error ? err.message : "Une erreur est survenue lors de l'enregistrement de l'horaire.");
    }
  };

  const promptDeleteShift = (id: string) => {
    setItemToDelete(id);
    setDeleteType("shift");
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete || !deleteType) return;
    setIsDeleting(true);
    try {
      if (deleteType === "team") {
        await TeamService.delete(itemToDelete);
        await loadTeams();
      } else {
        await ShiftTypeService.delete(itemToDelete);
        await loadShifts();
      }
    } catch (err: unknown) {
      console.error("Error deleting:", err);
      alert(err instanceof Error ? err.message : "Une erreur est survenue lors de la suppression.");
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-secondary flex items-center gap-3">
          <Settings2 className="size-8 text-primary" />
          Paramètres de Planification
        </h1>
        <p className="text-muted-foreground text-sm">
          Gérez vos équipes et vos types d'horaires de travail pour la planification des employés.
        </p>
      </div>

      <div className="flex space-x-1 border-b border-border/50 mb-6">
        <button
          onClick={() => setActiveTab("teams")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === "teams"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-secondary hover:bg-muted/30"
          }`}
        >
          <Users className="size-4" />
          Équipes
        </button>
        <button
          onClick={() => setActiveTab("shifts")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === "shifts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-secondary hover:bg-muted/30"
          }`}
        >
          <Clock className="size-4" />
          Types de Shifts
        </button>
      </div>

      <div className="flex-1">
        {activeTab === "teams" ? (
          <TeamsTab 
            teams={teams} 
            isEditing={editId}
            editForm={teamForm}
            setEditForm={setTeamForm}
            setIsEditing={setEditId}
            onCreate={addTeam}
            onEdit={editTeam}
            onSave={saveTeam}
            onDelete={promptDeleteTeam}
          />
        ) : (
          <ShiftTypesTab 
            shifts={shifts} 
            isEditing={shiftId}
            editForm={shiftForm}
            setEditForm={setShiftForm}
            setIsEditing={setShiftId}
            onCreate={addShift}
            onEdit={editShift}
            onSave={saveShift}
            onDelete={promptDeleteShift}
          />
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmation de suppression"
        description={`Êtes-vous sûr de vouloir supprimer cet élément ?`}
        onConfirm={executeDelete}
        loading={isDeleting}
      />
    </div>
  );
}
