import { useState, useEffect } from "react";
import { TeamsTab } from "../TeamsTab/TeamsTab";
import { ShiftTypesTab } from "../ShiftTypesTab/ShiftTypesTab";
import { Users, Clock, Settings2 } from "lucide-react";

import type { Team, ShiftType } from "../../types/type";

export function PlanningPage() {
  const [activeTab, setActiveTab] = useState<"teams" | "shifts">("teams");
  
  // Data state
  const [teams, setTeams] = useState<Team[]>([]);
  const [shifts, setShifts] = useState<ShiftType[]>([]);

  // Editing state
  const [editId, setEditId] = useState<string | null>(null);
  const [teamForm, setTeamForm] = useState<Partial<Team>>({});
  
  const [shiftId, setShiftId] = useState<string | null>(null);
  const [shiftForm, setShiftForm] = useState<Partial<ShiftType>>({});

  const API_BASE = "http://localhost:3000/api";

  const loadTeams = async () => {
    try {
      const res = await fetch(`${API_BASE}/teams?limit=100`);
      const data = await res.json() as { ok: boolean; payload: { records: Team[] } };
      if (data.ok) {
        setTeams(data.payload.records);
      }
    } catch (err: unknown) {
      console.error("Failed to load teams:", err);
    }
  };

  const loadShifts = async () => {
    try {
      const res = await fetch(`${API_BASE}/shift-types?limit=100`);
      const data = await res.json() as { ok: boolean; payload: { records: ShiftType[] } };
      if (data.ok) {
        setShifts(data.payload.records);
      }
    } catch (err: unknown) {
      console.error("Failed to load shift types:", err);
    }
  };

  useEffect(() => {
    loadTeams();
    loadShifts();
  }, []);

  // Team Handlers
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
      let res: Response;
      if (editId === "new") {
        res = await fetch(`${API_BASE}/teams`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamName: teamForm.teamName,
            description: teamForm.description || "",
          }),
        });
      } else {
        res = await fetch(`${API_BASE}/teams/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamName: teamForm.teamName,
            description: teamForm.description || "",
          }),
        });
      }

      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) {
        setEditId(null);
        await loadTeams();
      } else {
        alert(data.error || "Une erreur est survenue lors de l'enregistrement de l'équipe.");
      }
    } catch (err: unknown) {
      console.error("Error saving team:", err);
      alert("Impossible de se connecter au serveur.");
    }
  };

  const deleteTeam = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette équipe ?")) return;

    try {
      const res = await fetch(`${API_BASE}/teams/${id}`, {
        method: "DELETE",
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) {
        await loadTeams();
      } else {
        alert(data.error || "Une erreur est survenue lors de la suppression de l'équipe.");
      }
    } catch (err: unknown) {
      console.error("Error deleting team:", err);
      alert("Impossible de se connecter au serveur.");
    }
  };

  // Shift Handlers
  const addShift = () => {
    setShiftForm({ label: "", customStartTime: "08:00", customEndTime: "16:00", description: "" });
    setShiftId("new");
  };

  const editShift = (shift: ShiftType) => {
    setShiftForm({ ...shift });
    setShiftId(shift.idShiftType);
  };

  const saveShift = async () => {
    if (!shiftForm.label?.trim() || !shiftForm.customStartTime || !shiftForm.customEndTime) return;

    try {
      let res: Response;
      if (shiftId === "new") {
        res = await fetch(`${API_BASE}/shift-types`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: shiftForm.label,
            customStartTime: shiftForm.customStartTime,
            customEndTime: shiftForm.customEndTime,
            description: shiftForm.description || "",
          }),
        });
      } else {
        res = await fetch(`${API_BASE}/shift-types/${shiftId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: shiftForm.label,
            customStartTime: shiftForm.customStartTime,
            customEndTime: shiftForm.customEndTime,
            description: shiftForm.description || "",
          }),
        });
      }

      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) {
        setShiftId(null);
        await loadShifts();
      } else {
        alert(data.error || "Une erreur est survenue lors de l'enregistrement de l'horaire.");
      }
    } catch (err: unknown) {
      console.error("Error saving shift:", err);
      alert("Impossible de se connecter au serveur.");
    }
  };

  const deleteShift = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet horaire ?")) return;

    try {
      const res = await fetch(`${API_BASE}/shift-types/${id}`, {
        method: "DELETE",
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) {
        await loadShifts();
      } else {
        alert(data.error || "Une erreur est survenue lors de la suppression de l'horaire.");
      }
    } catch (err: unknown) {
      console.error("Error deleting shift:", err);
      alert("Impossible de se connecter au serveur.");
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
            onDelete={deleteTeam}
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
            onDelete={deleteShift}
          />
        )}
      </div>
    </div>
  );
}
