import { useState, useEffect, useCallback } from "react";
import { Users } from "lucide-react";
import { JobRequirementsPanel } from "./JobRequirementsPanel/JobRequirementsPanel";
import { JobTitleService } from "../services/job-title.service";
import type { JobTitle } from "../types/type";

export function JobRequirementsPage() {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobTitles = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await JobTitleService.getAll();
      setJobTitles(data);
    } catch (error) {
      console.error("Failed to fetch job titles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobTitles();
  }, [fetchJobTitles]);

  const selectedJob = jobTitles.find((job) => job.idJobTitle === selectedJobId);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
          <Users className="size-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-secondary">
            Besoins en Personnel
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Configurez les exigences de planning pour chaque poste
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Sélectionnez un poste à configurer
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            disabled={isLoading || jobTitles.length === 0}
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50"
          >
            <option value="" disabled>
              {isLoading ? "Chargement des postes..." : jobTitles.length === 0 ? "Aucun poste disponible" : "-- Choisir un poste --"}
            </option>
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
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border/50 min-h-[300px]">
            <Users className="size-12 mb-3 opacity-20" />
            <p>
              Choisissez un poste ci-dessus pour voir la liste de ses besoins
              ou en ajouter de nouveaux.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
