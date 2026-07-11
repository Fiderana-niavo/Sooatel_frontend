import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Users, Clock, CalendarDays, Plus, Trash2 } from "lucide-react";
import type { Team, ShiftType } from "@/features/planning/types/type";
import type { EmployeeAvailability } from "@/features/employees/types/type";
import { getCoveredDays } from "../../utils/availability";

interface EmployeePlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName?: string;
  initialTeamId?: string;
  initialAvailabilities?: Partial<EmployeeAvailability>[];
  availableTeams: Team[];
  availableShiftTypes: ShiftType[];
  onSaveTeam?: (teamId: string | null) => void;
  onSaveAvailabilities?: (availabilities: Partial<EmployeeAvailability>[]) => void;
  onSave?: (data: { teamId: string | null; availabilities: Partial<EmployeeAvailability>[] }) => void;
}

const DAYS_OF_WEEK = [
  { id: -1, label: "Tous les jours" },
  { id: -2, label: "Lundi au Vendredi" },
  { id: -3, label: "Lundi au Samedi" },
  { id: 1, label: "Lundi" },
  { id: 2, label: "Mardi" },
  { id: 3, label: "Mercredi" },
  { id: 4, label: "Jeudi" },
  { id: 5, label: "Vendredi" },
  { id: 6, label: "Samedi" },
  { id: 0, label: "Dimanche" },
];

export function EmployeePlanningModal({
  isOpen,
  onClose,
  employeeName,
  initialTeamId,
  initialAvailabilities = [],
  availableTeams,
  availableShiftTypes,
  onSaveTeam,
  onSaveAvailabilities,
  onSave,
}: EmployeePlanningModalProps) {
  const [activeTab, setActiveTab] = useState<"team" | "availabilities">("team");
  const [teamId, setTeamId] = useState<string | null>(initialTeamId || null);
  const [availabilities, setAvailabilities] = useState<Partial<EmployeeAvailability>[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTeamId(initialTeamId || null);
      setAvailabilities(initialAvailabilities.length > 0 ? [...initialAvailabilities] : []);
      setActiveTab("team");
    }
  }, [isOpen]);

  const handleAddAvailability = () => {
    setAvailabilities([
      ...availabilities,
      { dayOfWeek: 1, idShiftType: availableShiftTypes[0]?.idShiftType || null, customStartTime: null, customEndTime: null },
    ]);
  };

  const handleRemoveAvailability = (index: number) => {
    setAvailabilities(availabilities.filter((_, i) => i !== index));
  };

  const handleChangeAvailability = (index: number, field: keyof EmployeeAvailability, value: any) => {
    const newAvail = [...availabilities];
    newAvail[index] = { ...newAvail[index], [field]: value };
    if (field === "idShiftType" && value) {
      newAvail[index].customStartTime = null;
      newAvail[index].customEndTime = null;
    } else if (field === "customStartTime" || field === "customEndTime") {
      newAvail[index].idShiftType = null;
    }
    setAvailabilities(newAvail);
  };

  const handleSaveCurrentTab = () => {
    // Unfold shortcuts (-1, -2, -3) into individual days for the backend
    const payloadAvails: Partial<EmployeeAvailability>[] = [];
    availabilities.forEach(avail => {
      if (avail.dayOfWeek !== undefined && avail.dayOfWeek !== null) {
        const days = getCoveredDays(avail.dayOfWeek);
        days.forEach(d => {
          payloadAvails.push({ ...avail, dayOfWeek: d });
        });
      }
    });

    if (activeTab === "team" && onSaveTeam) {
      onSaveTeam(teamId);
      onClose();
    } else if (activeTab === "availabilities" && onSaveAvailabilities) {
      onSaveAvailabilities(payloadAvails);
      onClose();
    } else if (onSave) {
      onSave({ teamId, availabilities: payloadAvails });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl rounded-[2rem] overflow-hidden p-0 gap-0 bg-card">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 border-b">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-primary/20 text-primary rounded-xl">
                <CalendarDays className="size-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-secondary">
                  Gérer les Disponibilités
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1">
                  {employeeName ? `Affectation d'équipe et disponibilités pour ${employeeName}` : "Configurer l'équipe et les disponibilités par défaut"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="flex border-b relative z-10 bg-background">
          <button
            type="button"
            onClick={() => setActiveTab("team")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === "team" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-secondary hover:bg-muted/30"
              }`}
          >
            <Users className="size-4" />
            Équipe
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("availabilities")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === "availabilities" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-secondary hover:bg-muted/30"
              }`}
          >
            <Clock className="size-4" />
            Disponibilités
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">

          {/* TEAM SELECTION */}
          {activeTab === "team" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                <Users className="size-5 text-primary" />
                Équipe de travail
              </h3>
              <div className="bg-muted/20 p-5 rounded-2xl border border-border/50">
                <label className="text-sm font-medium text-muted-foreground block mb-2">Assigner à l'équipe</label>
                <select
                  className="w-full h-10 rounded-xl border border-input bg-background px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={teamId || ""}
                  onChange={(e) => setTeamId(e.target.value || null)}
                >
                  <option value="">-- Aucune équipe assignée --</option>
                  {availableTeams.map(team => (
                    <option key={team.idTeam} value={team.idTeam}>{team.teamName}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* AVAILABILITIES */}
          {activeTab === "availabilities" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="size-5 text-primary" />
                  Disponibilités / Horaires
                </h3>
                <Button size="sm" variant="outline" onClick={handleAddAvailability} className="gap-2 rounded-xl">
                  <Plus className="size-4" />
                  Ajouter un jour
                </Button>
              </div>

              {availabilities.length === 0 ? (
                <div className="text-center p-8 bg-muted/20 rounded-2xl border border-dashed border-border text-muted-foreground">
                  Aucun horaire spécifique défini. Cet employé suivra les horaires par défaut de son poste ou de son équipe.
                </div>
              ) : (
                <div className="space-y-3">
                  {availabilities.map((avail, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-muted/10 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-bottom-2">

                      <select
                        className="w-full sm:w-40 h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={avail.dayOfWeek ?? ""}
                        onChange={(e) => handleChangeAvailability(index, "dayOfWeek", parseInt(e.target.value))}
                      >
                        {DAYS_OF_WEEK.map(day => {
                          const otherCoveredDays = new Set<number>();
                          availabilities.forEach((a, i) => {
                            if (i !== index && a.dayOfWeek !== undefined && a.dayOfWeek !== null) {
                              getCoveredDays(a.dayOfWeek).forEach(d => otherCoveredDays.add(d));
                            }
                          });

                          const thisOptionDays = getCoveredDays(day.id);
                          const disabled = thisOptionDays.some(d => otherCoveredDays.has(d));

                          return (
                            <option key={day.id} value={day.id} disabled={disabled}>
                              {day.label}
                            </option>
                          );
                        })}
                      </select>

                      <div className="flex-1 flex items-center gap-2 w-full">
                        <select
                          className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={avail.idShiftType || ""}
                          onChange={(e) => handleChangeAvailability(index, "idShiftType", e.target.value)}
                        >
                          <option value="">Horaire personnalisé...</option>
                          {availableShiftTypes.map(shift => (
                            <option key={shift.idShiftType} value={shift.idShiftType}>{shift.label} ({shift.customStartTime} - {shift.customEndTime})</option>
                          ))}
                        </select>

                        {!avail.idShiftType && (
                          <div className="flex items-center gap-2 bg-background border rounded-lg p-1 shadow-sm h-9">
                            <input
                              type="time"
                              className="text-xs w-20 border-none focus:ring-0 px-1 bg-transparent"
                              value={avail.customStartTime || ""}
                              onChange={(e) => handleChangeAvailability(index, "customStartTime", e.target.value)}
                            />
                            <span className="text-muted-foreground text-xs">-</span>
                            <input
                              type="time"
                              className="text-xs w-20 border-none focus:ring-0 px-1 bg-transparent"
                              value={avail.customEndTime || ""}
                              onChange={(e) => handleChangeAvailability(index, "customEndTime", e.target.value)}
                            />
                          </div>
                        )}
                      </div>

                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveAvailability(index)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-muted/10 border-t flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-6">
            Annuler
          </Button>
          <Button type="button" onClick={handleSaveCurrentTab} className="rounded-xl px-6 shadow-lg shadow-primary/20">
            {activeTab === "team" ? "Enregistrer l'équipe" : "Enregistrer les disponibilités"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
