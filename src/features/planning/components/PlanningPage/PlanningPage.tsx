import React, { useState } from "react";
import { TeamsTab } from "../TeamsTab/TeamsTab";
import { ShiftTypesTab } from "../ShiftTypesTab/ShiftTypesTab";
import { Users, Clock, Settings2 } from "lucide-react";

import type { Team, ShiftType } from "../../types/type";

const MOCK_TEAMS: Team[] = [
  { idTeam: "1", teamName: "Équipe Cuisine", description: "Personnel de préparation et cuisine" },
  { idTeam: "2", teamName: "Équipe Salle", description: "Serveurs et accueil" },
  { idTeam: "3", teamName: "Équipe Nettoyage", description: "Entretien des locaux" },
];

const MOCK_SHIFTS: ShiftType[] = [
  { idShiftType: "1", label: "Matin", customStartTime: "08:00", customEndTime: "16:00", description: "Service du matin" },
  { idShiftType: "2", label: "Soir", customStartTime: "16:00", customEndTime: "00:00", description: "Service du soir" },
];

export function PlanningPage() {
  const [activeTab, setActiveTab] = useState<"teams" | "shifts">("teams");
  
  // Lifted state
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [shifts, setShifts] = useState<ShiftType[]>(MOCK_SHIFTS);

  // Form states
  const [isEditingTeam, setIsEditingTeam] = useState<string | null>(null);
  const [editTeamForm, setEditTeamForm] = useState<Partial<Team>>({});
  
  const [isEditingShift, setIsEditingShift] = useState<string | null>(null);
  const [editShiftForm, setEditShiftForm] = useState<Partial<ShiftType>>({});

  // Handlers for Teams
  const handleCreateTeam = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setEditTeamForm({ teamName: "", description: "" });
    setIsEditingTeam(newId);
  };

  const handleEditTeam = (team: Team) => {
    setEditTeamForm({ ...team });
    setIsEditingTeam(team.idTeam);
  };

  const handleSaveTeam = () => {
    if (!editTeamForm.teamName?.trim()) return;
    
    const teamToSave = { idTeam: isEditingTeam as string, ...editTeamForm } as Team;
    if (teams.find(t => t.idTeam === teamToSave.idTeam)) {
      setTeams(teams.map(t => t.idTeam === teamToSave.idTeam ? teamToSave : t));
    } else {
      setTeams([...teams, teamToSave]);
    }
    setIsEditingTeam(null);
  };

  const handleDeleteTeam = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette équipe ?")) {
      setTeams(teams.filter(t => t.idTeam !== id));
    }
  };

  // Handlers for Shifts
  const handleCreateShift = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setEditShiftForm({ label: "", customStartTime: "08:00", customEndTime: "16:00", description: "" });
    setIsEditingShift(newId);
  };

  const handleEditShift = (shift: ShiftType) => {
    setEditShiftForm({ ...shift });
    setIsEditingShift(shift.idShiftType);
  };

  const handleSaveShift = () => {
    if (!editShiftForm.label?.trim() || !editShiftForm.customStartTime || !editShiftForm.customEndTime) return;

    const shiftToSave = { idShiftType: isEditingShift as string, ...editShiftForm } as ShiftType;
    if (shifts.find(s => s.idShiftType === shiftToSave.idShiftType)) {
      setShifts(shifts.map(s => s.idShiftType === shiftToSave.idShiftType ? shiftToSave : s));
    } else {
      setShifts([...shifts, shiftToSave]);
    }
    setIsEditingShift(null);
  };

  const handleDeleteShift = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet horaire ?")) {
      setShifts(shifts.filter(s => s.idShiftType !== id));
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
            isEditing={isEditingTeam}
            editForm={editTeamForm}
            setEditForm={setEditTeamForm}
            setIsEditing={setIsEditingTeam}
            onCreate={handleCreateTeam}
            onEdit={handleEditTeam}
            onSave={handleSaveTeam}
            onDelete={handleDeleteTeam}
          />
        ) : (
          <ShiftTypesTab 
            shifts={shifts} 
            isEditing={isEditingShift}
            editForm={editShiftForm}
            setEditForm={setEditShiftForm}
            setIsEditing={setIsEditingShift}
            onCreate={handleCreateShift}
            onEdit={handleEditShift}
            onSave={handleSaveShift}
            onDelete={handleDeleteShift}
          />
        )}
      </div>
    </div>
  );
}
