import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Snackbar, type SnackbarType } from "@/components/ui/Snackbar/snackbar";
import type { EmployeeRequirement, CreateRequirementDto, BulkCreateRequirementDto } from "../../types/type";
import type { ShiftType } from "@/features/planning/types/type";
import { EmployeeRequirementService } from "../../services/employee-requirement.service";
import { ShiftTypeService } from "@/features/planning/services/shift-type.service";
import { DAY_LABELS } from "@/constants/app.constants";

interface JobRequirementsPanelProps {
  idJobTitle: string;
  jobTitleName: string;
}

const EMPTY_SINGLE: CreateRequirementDto = {
  dayOfWeek: 1,
  requiredCount: 1,
  idShiftType: "",
  idJobTitle: "",
};

const EMPTY_BULK: { dayOfWeeks: number[], idShiftTypes: string[], requiredCount: number | "" } = {
  dayOfWeeks: [],
  idShiftTypes: [],
  requiredCount: 1,
};

type LocalSingleForm = Omit<CreateRequirementDto, "requiredCount"> & { requiredCount: number | "" };
type LocalBulkForm = Omit<BulkCreateRequirementDto, "idJobTitle" | "requiredCount"> & { requiredCount: number | "" };


export function JobRequirementsPanel({ idJobTitle, jobTitleName }: JobRequirementsPanelProps) {
  const [requirements, setRequirements] = useState<EmployeeRequirement[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [snackbar, setSnackbar] = useState<{ show: boolean; message: string; type: SnackbarType }>({ show: false, message: "", type: "info" });

  const [singleForm, setSingleForm] = useState<LocalSingleForm>({ ...EMPTY_SINGLE, idJobTitle });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [bulkForms, setBulkForms] = useState<LocalBulkForm[]>([{ ...EMPTY_BULK }]);

  const loadData = useCallback(async () => {
    try {
      const [reqs, shifts] = await Promise.all([
        EmployeeRequirementService.getByJobTitle(idJobTitle),
        ShiftTypeService.getAll(),
      ]);
      setRequirements(reqs);
      setShiftTypes(shifts);
    } catch (err: unknown) {
      console.error("Failed to load requirements:", err);
    }
  }, [idJobTitle]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditingId(null);
    setSingleForm({ ...EMPTY_SINGLE, idJobTitle, idShiftType: shiftTypes[0]?.idShiftType ?? "" });
    setBulkForms([{ ...EMPTY_BULK }]);
    setShowForm(true);
  };

  const openEdit = (req: EmployeeRequirement) => {
    setEditingId(req.idRequirement);
    setSingleForm({
      dayOfWeek: req.dayOfWeek,
      requiredCount: req.requiredCount,
      idShiftType: req.idShiftType,
      idJobTitle,
    });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const toggleDay = (idx: number, day: number) => {
    setBulkForms((prev) => prev.map((form, i) => {
      if (i !== idx) return form;
      return {
        ...form,
        dayOfWeeks: form.dayOfWeeks.includes(day)
          ? form.dayOfWeeks.filter((d) => d !== day)
          : [...form.dayOfWeeks, day],
      };
    }));
  };

  const toggleShift = (idx: number, id: string) => {
    setBulkForms((prev) => prev.map((form, i) => {
      if (i !== idx) return form;
      return {
        ...form,
        idShiftTypes: form.idShiftTypes.includes(id)
          ? form.idShiftTypes.filter((s) => s !== id)
          : [...form.idShiftTypes, id],
      };
    }));
  };

  const updateCount = (idx: number, val: string) => {
    const count = val === "" ? "" : Number(val);
    setBulkForms((prev) => prev.map((form, i) => i === idx ? { ...form, requiredCount: count } : form));
  };
  
  const addForm = () => setBulkForms((prev) => [...prev, { ...EMPTY_BULK }]);
  const removeForm = (idx: number) => setBulkForms((prev) => prev.filter((_, i) => i !== idx));

  const selectAllDays = (idx: number) => setBulkForms((prev) => prev.map((form, i) => i === idx ? { ...form, dayOfWeeks: [0, 1, 2, 3, 4, 5, 6] } : form));
  const selectWeekdays = (idx: number) => setBulkForms((prev) => prev.map((form, i) => i === idx ? { ...form, dayOfWeeks: [1, 2, 3, 4, 5] } : form));
  const clearDays = (idx: number) => setBulkForms((prev) => prev.map((form, i) => i === idx ? { ...form, dayOfWeeks: [] } : form));
  const selectAllShifts = (idx: number) => setBulkForms((prev) => prev.map((form, i) => i === idx ? { ...form, idShiftTypes: shiftTypes.map((s) => s.idShiftType) } : form));

  const saveForm = async () => {
    try {
      if (editingId) {
        await EmployeeRequirementService.update(editingId, {
          ...singleForm,
          requiredCount: Number(singleForm.requiredCount) || 1,
        });
      } else {
        const validForms = bulkForms.filter(f => f.dayOfWeeks.length > 0 && f.idShiftTypes.length > 0);
        if (validForms.length === 0) return;

        // Front-end validation for duplicates
        const requestedPairs = new Set<string>();
        for (const form of validForms) {
          for (const d of form.dayOfWeeks) {
            for (const s of form.idShiftTypes) {
              const key = `${d}-${s}`;
              if (requestedPairs.has(key)) {
                setSnackbar({ show: true, message: `Conflit détecté : vous avez sélectionné plusieurs fois le ${DAY_LABELS[d]} pour le même shift dans ce formulaire.`, type: "error" });
                return;
              }
              requestedPairs.add(key);

              const alreadyExists = requirements.some(r => r.dayOfWeek === d && r.idShiftType === s);
              if (alreadyExists) {
                const shiftName = shiftTypes.find(st => st.idShiftType === s)?.label ?? "ce shift";
                setSnackbar({ show: true, message: `Un besoin existe déjà pour ce poste le ${DAY_LABELS[d]} pour ${shiftName}. Veuillez le modifier dans la liste en bas.`, type: "error" });
                return;
              }
            }
          }
        }

        const payload = validForms.map(form => ({
          ...form,
          idJobTitle,
          requiredCount: Number(form.requiredCount) || 1,
        }));

        const result = await EmployeeRequirementService.bulkCreate(payload);
        if (result.skipped > 0) {
          setSnackbar({ show: true, message: `${result.created} besoin(s) créé(s). ${result.skipped} combinaison(s) ignorée(s) car elles existent déjà.`, type: "warning" });
        } else {
          setSnackbar({ show: true, message: `${result.created} besoin(s) créé(s) avec succès.`, type: "success" });
        }
      }
      setShowForm(false);
      await loadData();
    } catch (err: unknown) {
      setSnackbar({ show: true, message: err instanceof Error ? err.message : "Erreur lors de l'enregistrement.", type: "error" });
    }
  };

  const saveEdit = async () => {
    try {
      if (!editingId) return;
      
      // Validation against existing (excluding itself)
      const alreadyExists = requirements.some(r => 
        r.idRequirement !== editingId && 
        r.dayOfWeek === singleForm.dayOfWeek && 
        r.idShiftType === singleForm.idShiftType
      );
      if (alreadyExists) {
        setSnackbar({ show: true, message: `Un besoin existe déjà pour ce jour et ce shift.`, type: "error" });
        return;
      }

      await EmployeeRequirementService.update(editingId, {
        ...singleForm,
        requiredCount: Number(singleForm.requiredCount) || 1,
      });
      setSnackbar({ show: true, message: "Besoin modifié avec succès.", type: "success" });
      setEditingId(null);
      await loadData();
    } catch (err: unknown) {
      setSnackbar({ show: true, message: err instanceof Error ? err.message : "Erreur lors de la modification.", type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await EmployeeRequirementService.delete(id);
      await loadData();
      setSnackbar({ show: true, message: "Besoin supprimé avec succès.", type: "success" });
    } catch (err: unknown) {
      setSnackbar({ show: true, message: err instanceof Error ? err.message : "Erreur lors de la suppression.", type: "error" });
    }
  };

  const isBulkValid = bulkForms.some(f => f.dayOfWeeks.length > 0 && f.idShiftTypes.length > 0 && typeof f.requiredCount === "number" && f.requiredCount >= 1);
  const isSingleValid = !!singleForm.idShiftType && typeof singleForm.requiredCount === "number" && singleForm.requiredCount >= 1;

  return (
    <div className="mt-4 border-t border-border/50 pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Besoins en effectif — {jobTitleName}
        </p>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={openCreate} className="gap-1.5 text-xs rounded-lg">
            <Plus className="size-3" />
            Ajouter
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-muted/20 border border-border/50 rounded-xl p-4 space-y-4">
          {/* BULK forms (Create Mode) */}
          {!editingId && (
            <div className="space-y-6">
              {bulkForms.map((bulkForm, idx) => (
                <div key={idx} className="space-y-4 relative bg-background/50 p-4 rounded-xl border border-border/30">
                  {bulkForms.length > 1 && (
                    <button 
                      onClick={() => removeForm(idx)}
                      className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                  {/* Day selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground">Jours</label>
                      <div className="flex gap-1.5 pr-6">
                        <button onClick={() => selectWeekdays(idx)} className="text-[10px] text-primary underline">Lun–Ven</button>
                        <span className="text-muted-foreground text-[10px]">·</span>
                        <button onClick={() => selectAllDays(idx)} className="text-[10px] text-primary underline">Tous</button>
                        <span className="text-muted-foreground text-[10px]">·</span>
                        <button onClick={() => clearDays(idx)} className="text-[10px] text-muted-foreground underline">Effacer</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {DAY_LABELS.map((label, dayIdx) => {
                        const selected = bulkForm.dayOfWeeks.includes(dayIdx);
                        return (
                          <button
                            key={dayIdx}
                            onClick={() => toggleDay(idx, dayIdx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              selected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-border hover:border-primary/50"
                            }`}
                          >
                            {label.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shift selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground">Shifts</label>
                      <button onClick={() => selectAllShifts(idx)} className="text-[10px] text-primary underline pr-6">Tous</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {shiftTypes.map((s) => {
                        const selected = bulkForm.idShiftTypes.includes(s.idShiftType);
                        return (
                          <button
                            key={s.idShiftType}
                            onClick={() => toggleShift(idx, s.idShiftType)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              selected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-border hover:border-primary/50"
                            }`}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Count and Preview */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Nombre requis</label>
                      <input
                        type="number"
                        min={1}
                        value={bulkForm.requiredCount}
                        onChange={(e) => updateCount(idx, e.target.value)}
                        className="w-32 h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    {bulkForm.dayOfWeeks.length > 0 && bulkForm.idShiftTypes.length > 0 && (
                      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 sm:mt-5">
                        → <span className="font-bold text-primary">{bulkForm.dayOfWeeks.length * bulkForm.idShiftTypes.length}</span> règle(s) : {bulkForm.dayOfWeeks.length} jour(s) &times; {bulkForm.idShiftTypes.length} shift(s), <span className="font-bold">{bulkForm.requiredCount}</span> pers/shift.
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <Button onClick={addForm} variant="outline" size="sm" className="w-full border-dashed gap-1.5 rounded-xl text-primary hover:text-primary hover:bg-primary/5">
                <Plus className="size-4" />
                Ajouter une autre configuration pour ce poste
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2 border-t border-border/50">
            <Button size="sm" variant="ghost" onClick={cancelForm} className="gap-1.5 text-xs rounded-lg">
              <X className="size-3" /> Annuler
            </Button>
            <Button
              size="sm"
              onClick={saveForm}
              disabled={!isBulkValid}
              className="gap-1.5 text-xs rounded-lg"
            >
              <Check className="size-3" />
              Créer les configurations
            </Button>
          </div>
        </div>
      )}

      {requirements.length === 0 && !showForm ? (
        <p className="text-xs text-muted-foreground text-center py-4 bg-muted/10 rounded-xl border border-dashed">
          Aucun besoin configuré pour ce poste.
        </p>
      ) : (
        <div className="space-y-6 mt-4">
          {DAY_LABELS.map((label, dayIdx) => {
            const dayReqs = requirements.filter(r => r.dayOfWeek === dayIdx);
            if (dayReqs.length === 0) return null;

            return (
              <div key={dayIdx} className="space-y-2">
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-2 border-l-2 border-primary/50">
                  {label}
                </h4>
                <div className="space-y-2">
                  {dayReqs.map((req) => (
                    editingId === req.idRequirement ? (
                      <div key={req.idRequirement} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 rounded-xl bg-muted/20 border border-primary/30 shadow-sm">
                        <div className="flex-1 flex gap-2">
                          <select
                            value={singleForm.dayOfWeek}
                            onChange={(e) => setSingleForm((prev) => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                            className="w-full sm:w-auto h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                          >
                            {DAY_LABELS.map((lbl, idx) => (
                              <option key={idx} value={idx}>{lbl}</option>
                            ))}
                          </select>
                          <select
                            value={singleForm.idShiftType}
                            onChange={(e) => setSingleForm((prev) => ({ ...prev, idShiftType: e.target.value }))}
                            className="w-full sm:w-auto h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                          >
                            {shiftTypes.map((s) => (
                              <option key={s.idShiftType} value={s.idShiftType}>{s.label}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={1}
                            value={singleForm.requiredCount}
                            onChange={(e) => setSingleForm((prev) => ({ ...prev, requiredCount: e.target.value === "" ? "" : Number(e.target.value) }))}
                            className="w-20 h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-1 ml-auto">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={saveEdit}
                            disabled={!isSingleValid}
                            className="size-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            className="size-8 text-muted-foreground hover:bg-muted/50 rounded-lg"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={req.idRequirement}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-background border border-border/40 hover:bg-muted/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-semibold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs">{DAY_LABELS[req.dayOfWeek]}</span>
                          <span className="text-muted-foreground">—</span>
                          <span className="text-foreground font-medium">{req.shiftLabel ?? "Shift inconnu"}</span>
                          <span className="text-muted-foreground">—</span>
                          <span className="font-bold text-primary">{req.requiredCount} <span className="text-muted-foreground font-normal text-xs">requis</span></span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(req)}
                            className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(req.idRequirement)}
                            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {snackbar.show && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar((prev) => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
}
