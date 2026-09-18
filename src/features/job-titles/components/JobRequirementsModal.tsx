import { useState, useEffect } from "react";
import { X, Users } from "lucide-react";
import { JobRequirementsPanel } from "./JobRequirementsPanel/JobRequirementsPanel";
import type { JobTitle } from "../types/type";

interface JobRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitles: JobTitle[];
}

export function JobRequirementsModal({ isOpen, onClose, jobTitles }: JobRequirementsModalProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedJobId("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedJob = jobTitles.find((job) => job.idJobTitle === selectedJobId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl border border-border/50 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Users className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Besoins en Personnel</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configurez les exigences de planning pour chaque poste
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Sélectionnez un poste à configurer
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            >
              <option value="" disabled>-- Choisir un poste --</option>
              {jobTitles.map((job) => (
                <option key={job.idJobTitle} value={job.idJobTitle}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          {selectedJobId ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <JobRequirementsPanel
                idJobTitle={selectedJobId}
                jobTitleName={selectedJob?.title || ""}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border/50">
              <Users className="size-12 mb-3 opacity-20" />
              <p>Choisissez un poste ci-dessus pour voir la liste de ses besoins ou en ajouter de nouveaux.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
