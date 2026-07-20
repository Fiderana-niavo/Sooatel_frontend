import React, { useState, useEffect } from "react";
import type { Employee } from "../../types/type";
import type { Role, Permission } from "@/features/roles/types";
import { Switch } from "@/components/ui/Switch/switch";
import { Input } from "@/components/ui/Inputs/input";
import { Button } from "@/components/ui/Button/button";
import { AccountCredentials } from "./AccountCredentials";
import { PermissionsGrid } from "./PermissionsGrid";
import { ChangeJobModal } from "./ChangeJobModal";
import { EmployeePlanningModal } from "../EmployeePlanningModal/EmployeePlanningModal";
import { Can } from "@/components/Can/Can";

import type { Team, ShiftType } from "@/features/planning/types/type";
import { CalendarDays } from "lucide-react";
import { generateUsername } from "../../utils/employee.utils";

interface EmployeeFormProps {
  initialData?: any;
  availableJobTitles: { idJobTitle: string; title: string }[];
  availableEmploymentTypes: { idEmploymentType: string; label: string }[];
  availableRoles: Role[];
  availablePermissions: Permission[];
  rolePermissionsMapping: Record<string, string[]>;
  availableTeams: Team[];
  availableShiftTypes: ShiftType[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function EmployeeForm({ 
  initialData, 
  availableJobTitles,
  availableEmploymentTypes,
  availableRoles,
  availablePermissions,
  rolePermissionsMapping,
  availableTeams,
  availableShiftTypes,
  onSave,
  onCancel
}: EmployeeFormProps) {
  const isEditMode = !!initialData;
  const [activeTab, setActiveTab] = useState<"info" | "permissions">("info");
  const [isChangeJobModalOpen, setIsChangeJobModalOpen] = useState(false);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  
  const [planningData, setPlanningData] = useState<{ teamId: string | null; availabilities: any[] }>({ 
    teamId: initialData?.team?.idTeam || null, 
    availabilities: initialData?.availabilities || [] 
  });

  const [formData, setFormData] = useState<Employee>(
    initialData || {
      employeeCode: "",
      name: "",
      lastname: "",
      birthdate: "",
      address: "",
      idJobTitle: "",
      assignmentDate: "",
      endDate: "",
      hasFixedSchedule: false,
      idEmploymentType: "",
      emailContact: "",
      phoneNumber: "",
      notes: "",
      hasUserAccount: false,
    }
  );

  const [username, setUsername] = useState(initialData?.userAccount?.username || "");
  const [isUsernameManuallyEdited, setIsUsernameManuallyEdited] = useState(false);

  useEffect(() => {
    if (!initialData?.userAccount?.username && !isUsernameManuallyEdited) {
      setUsername(generateUsername(formData.name, formData.lastname));
    }
  }, [formData.name, formData.lastname, initialData?.userAccount?.username, isUsernameManuallyEdited]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(initialData?.userAccount?.roles || []);
  const [overrides, setOverrides] = useState<Record<string, "grant" | "deny" | "default">>(() => {
    const map: Record<string, "grant" | "deny" | "default"> = {};
    initialData?.userAccount?.permissionsOverrides?.forEach(o => {
      map[o.idPermission] = o.overrideType;
    });
    return map;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedFormData = {
      ...formData,
      name: formData.name.trim(),
      lastname: formData.lastname.trim(),
      address: formData.address?.trim(),
      emailContact: formData.emailContact?.trim(),
      phoneNumber: formData.phoneNumber?.trim(),
      notes: formData.notes?.trim(),
    };
    onSave({ 
      formData: trimmedFormData, 
      username: username.trim(), 
      selectedRoles, 
      overrides, 
      planningData 
    });
  };

  const handleSaveJobChange = (jobData: any) => {
    setFormData(prev => ({ ...prev, ...jobData }));
    // Si besoin, on pourrait aussi déclencher une sauvegarde API directe ici 
    // ou attendre le onSave principal. Pour l'instant on met à jour le form local.
  };

  const handleInternshipChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      internship: {
        schoolName: prev.internship?.schoolName || null,
        academicSupervisorName: prev.internship?.academicSupervisorName || null,
        professionnalSupervisorName: prev.internship?.professionnalSupervisorName || null,
        ...prev.internship,
        [field]: value || null
      }
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-card border rounded-2xl shadow-lg shadow-black/5 overflow-hidden">
      {isEditMode && formData.hasUserAccount && (
        <div className="flex border-b bg-muted/10">
          <button
            type="button"
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-all duration-300 ${activeTab === "info" ? "border-primary text-primary bg-background" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"}`}
            onClick={() => setActiveTab("info")}
          >
            Informations de l'employé
          </button>
          <Can permission="security.access">
            <button
              type="button"
              className={`flex-1 py-4 text-sm font-medium border-b-2 transition-all duration-300 ${activeTab === "permissions" ? "border-primary text-primary bg-background" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"}`}
              onClick={() => setActiveTab("permissions")}
            >
              Accès & Sécurité
            </button>
          </Can>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        <div className={activeTab === "info" ? "block animate-in fade-in duration-500" : "hidden"}>
          <div className="space-y-6">
            <div className="-mt-2 md:-mt-4">
              <h2 className="text-2xl font-bold mb-1 tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{isEditMode ? "Modifier l'employé" : "Nouvel employé"}</h2>
              <p className="text-muted-foreground">Saisissez les informations personnelles et professionnelles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-2">
                <label className="text-sm font-medium">Nom <span className="text-destructive">*</span></label>
                <Input required className="bg-background" value={formData.lastname} onChange={(e) => setFormData({ ...formData, lastname: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom <span className="text-destructive">*</span></label>
                <Input required className="bg-background" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de naissance</label>
                <Input type="date" className="bg-background" value={formData.birthdate || ""} onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Adresse</label>
                <Input className="bg-background" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="md:col-span-2 mt-2 p-5 bg-muted/20 border rounded-xl space-y-4">
                <div className="flex items-center justify-between mb-2 border-b pb-3">
                  <h3 className="font-semibold text-secondary">Informations de Poste</h3>
                  {isEditMode && (
                    <button 
                      type="button" 
                      onClick={() => setIsChangeJobModalOpen(true)}
                      className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 font-semibold rounded-md transition-colors"
                    >
                      Changer de poste
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Poste / Fonction <span className="text-destructive">*</span></label>
                    <select 
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.idJobTitle || ""}
                      onChange={(e) => setFormData({ ...formData, idJobTitle: e.target.value })}
                    >
                      <option value="">Sélectionner un poste...</option>
                      {availableJobTitles.map(job => (
                        <option key={job.idJobTitle} value={job.idJobTitle}>{job.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type de contrat <span className="text-destructive">*</span></label>
                    <select 
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.idEmploymentType || ""}
                      onChange={(e) => setFormData({ ...formData, idEmploymentType: e.target.value })}
                    >
                      <option value="">Sélectionner un type...</option>
                      {availableEmploymentTypes.map(type => (
                        <option key={type.idEmploymentType} value={type.idEmploymentType}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date de début <span className="text-destructive">*</span></label>
                    <Input required type="date" className="bg-background" value={formData.assignmentDate || ""} onChange={(e) => setFormData({ ...formData, assignmentDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date de fin</label>
                    <Input type="date" className="bg-background" value={formData.endDate || ""} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3 mt-1">
                    <Switch
                      checked={formData.hasFixedSchedule}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasFixedSchedule: checked })}
                    />
                    <label className="text-sm font-medium cursor-pointer" onClick={() => setFormData({...formData, hasFixedSchedule: !formData.hasFixedSchedule})}>Horaires fixes</label>
                  </div>
                  
                  {availableEmploymentTypes.find(t => t.idEmploymentType === formData.idEmploymentType)?.label.toLowerCase().includes("stage") && (
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-4 border-t">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">École d'origine</label>
                        <Input 
                          className="bg-background" 
                          value={formData.internship?.schoolName || ""} 
                          onChange={(e) => handleInternshipChange("schoolName", e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tuteur Académique</label>
                        <Input 
                          className="bg-background" 
                          value={formData.internship?.academicSupervisorName || ""} 
                          onChange={(e) => handleInternshipChange("academicSupervisorName", e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tuteur Professionnel</label>
                        <Input 
                          className="bg-background" 
                          value={formData.internship?.professionnalSupervisorName || ""} 
                          onChange={(e) => handleInternshipChange("professionnalSupervisorName", e.target.value)} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email de contact</label>
                <Input className="bg-background" type="email" value={formData.emailContact || ""} onChange={(e) => setFormData({ ...formData, emailContact: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Téléphone</label>
                <Input className="bg-background" type="tel" value={formData.phoneNumber || ""} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Notes additionnelles</label>
                <Input className="bg-background" value={formData.notes || ""} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
            </div>

              <div className="pt-6 border-t mt-8">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CalendarDays className="size-5 text-primary" />
                      Équipe et Horaires (Optionnel)
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {planningData.teamId || planningData.availabilities.length > 0 
                        ? <span className="text-primary font-medium">Des paramètres de planification ont été configurés.</span>
                        : "Assignez une équipe ou des horaires personnalisés."}
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={() => setIsPlanningModalOpen(true)}>
                    {planningData.teamId || planningData.availabilities.length > 0 ? "Modifier" : "Configurer"}
                  </Button>
                </div>
              </div>

            <Can permission="security.access">
              <div className="pt-6 border-t mt-8">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
                  <div>
                    <h3 className="text-lg font-semibold">Activer le compte utilisateur</h3>
                    <p className="text-sm text-muted-foreground mt-1">Permet à l'employé de se connecter au système avec des identifiants.</p>
                  </div>
                  <Switch
                    checked={formData.hasUserAccount}
                    onCheckedChange={(c) => setFormData({ ...formData, hasUserAccount: c })}
                    className="border-2 border-muted-foreground/20 shadow-sm"
                  />
                </div>
              </div>

              {formData.hasUserAccount && (
                <div className="pt-2">
                  <AccountCredentials
                    username={username}
                    onUsernameChange={(val) => {
                      setUsername(val);
                      setIsUsernameManuallyEdited(true);
                    }}
                    selectedRoles={selectedRoles}
                    onRolesChange={setSelectedRoles}
                    availableRoles={availableRoles}
                  />
                </div>
              )}
            </Can>
          </div>
        </div>

        <div className={activeTab === "permissions" ? "block" : "hidden"}>
          <PermissionsGrid
            username={username || `${formData.name} ${formData.lastname}`.trim() || "Utilisateur"}
            userRoles={selectedRoles}
            allPermissions={availablePermissions}
            overrides={overrides}
            onOverrideChange={(id, val) => setOverrides(prev => ({ ...prev, [id]: val }))}
            rolePermissions={rolePermissionsMapping}
          />
        </div>

        <div className="flex justify-end gap-4 pt-8 border-t mt-8">
          <Button variant="outline" type="button" onClick={onCancel} className="px-6 rounded-xl hover:bg-muted">Annuler</Button>
          <Button type="submit" className="px-8 rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">Enregistrer</Button>
        </div>
      </form>

      <ChangeJobModal 
        isOpen={isChangeJobModalOpen}
        onClose={() => setIsChangeJobModalOpen(false)}
        availableJobTitles={availableJobTitles}
        availableEmploymentTypes={availableEmploymentTypes}
        currentJobData={formData}
        onSaveJob={handleSaveJobChange}
      />

      <EmployeePlanningModal
        isOpen={isPlanningModalOpen}
        onClose={() => setIsPlanningModalOpen(false)}
        employeeName={isEditMode ? `${formData.name} ${formData.lastname}` : "Nouvel Employé"}
        availableTeams={availableTeams}
        availableShiftTypes={availableShiftTypes}
        initialTeamId={planningData.teamId || undefined}
        initialAvailabilities={planningData.availabilities}
        onSave={setPlanningData}
      />
    </div>
  );
}
