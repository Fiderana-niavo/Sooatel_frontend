import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { Switch } from "@/components/ui/Switch/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog/dialog";
import type { Employee } from "../../types/type";

interface ChangeJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableJobTitles: { idJobTitle: string; title: string }[];
  availableEmploymentTypes: { idEmploymentType: string; label: string }[];
  currentJobData?: Partial<Employee>;
  onSaveJob: (jobData: { 
    idJobTitle: string; 
    idEmploymentType: string; 
    assignmentDate: string; 
    endDate: string; 
    hasFixedSchedule: boolean; 
  }) => void;
}

export function ChangeJobModal({
  isOpen,
  onClose,
  availableJobTitles,
  availableEmploymentTypes,
  currentJobData,
  onSaveJob
}: ChangeJobModalProps) {
  const [idJobTitle, setIdJobTitle] = useState("");
  const [idEmploymentType, setIdEmploymentType] = useState("");
  const [assignmentDate, setAssignmentDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hasFixedSchedule, setHasFixedSchedule] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIdJobTitle(currentJobData?.idJobTitle || "");
      setIdEmploymentType(currentJobData?.idEmploymentType || "");
      // Usually, when changing job, you'd set assignmentDate to today, but we leave it empty or pre-fill
      setAssignmentDate("");
      setEndDate("");
      setHasFixedSchedule(currentJobData?.hasFixedSchedule || false);
    }
  }, [isOpen, currentJobData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idJobTitle || !idEmploymentType || !assignmentDate) return;
    
    onSaveJob({
      idJobTitle,
      idEmploymentType,
      assignmentDate,
      endDate,
      hasFixedSchedule
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl flex flex-col p-0 overflow-hidden sm:rounded-2xl gap-0">
        <DialogHeader className="p-6 border-b border-border/50 flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-secondary text-left">
            Changer le poste de l'employé
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nouveau Poste / Fonction <span className="text-destructive">*</span></label>
                <select 
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={idJobTitle}
                  onChange={(e) => setIdJobTitle(e.target.value)}
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
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={idEmploymentType}
                  onChange={(e) => setIdEmploymentType(e.target.value)}
                >
                  <option value="">Sélectionner un type...</option>
                  {availableEmploymentTypes.map(type => (
                    <option key={type.idEmploymentType} value={type.idEmploymentType}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de début <span className="text-destructive">*</span></label>
                <Input required type="date" className="bg-background" value={assignmentDate} onChange={(e) => setAssignmentDate(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de fin</label>
                <Input type="date" className="bg-background" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              
              <div className="md:col-span-2 flex items-center gap-3 mt-2">
                <Switch
                  checked={hasFixedSchedule}
                  onCheckedChange={setHasFixedSchedule}
                />
                <label className="text-sm font-medium cursor-pointer" onClick={() => setHasFixedSchedule(!hasFixedSchedule)}>Horaires fixes</label>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border/50 bg-muted/5 flex justify-end gap-3 flex-shrink-0">
            <Button type="button" onClick={onClose} variant="outline" className="rounded-xl">
              Annuler
            </Button>
            <Button type="submit" className="rounded-xl bg-primary hover:bg-primary/90 text-white">
              Enregistrer le changement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
