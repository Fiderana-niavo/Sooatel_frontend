import { useState, useEffect, useCallback } from "react";
import { Briefcase, Building, Clock } from "lucide-react";
import { JobTitlesModal, JobTitleService, type JobTitle } from "@/features/job-titles";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";

export function SettingsPage() {
  const [isJobTitlesModalOpen, setIsJobTitlesModalOpen] = useState(false);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchJobTitles = useCallback(async () => {
    try {
      const data = await JobTitleService.getAll();
      setJobTitles(data);
    } catch (error) {
      console.error("Failed to fetch job titles:", error);
      alert("Erreur lors de la récupération des postes.");
    }
  }, []);

  useEffect(() => {
    fetchJobTitles();
  }, [fetchJobTitles]);

  const handleAddJobTitle = async (title: string) => {
    try {
      const newJobTitle = await JobTitleService.create(title);
      setJobTitles((prev) => [...prev, newJobTitle]);
    } catch (error) {
      console.error("Failed to create job title:", error);
      alert("Erreur lors de la création du poste.");
    }
  };

  const handleEditJobTitle = async (id: string, newTitle: string) => {
    try {
      await JobTitleService.update(id, newTitle);
      setJobTitles((prev) =>
        prev.map((job) => (job?.idJobTitle === id ? { ...job, title: newTitle } : job))
      );
    } catch (error) {
      console.error("Failed to update job title:", error);
      alert("Erreur lors de la modification du poste.");
    }
  };

  const promptDeleteJobTitle = (id: string) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const executeDeleteJobTitle = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await JobTitleService.delete(itemToDelete);
      setJobTitles((prev) => prev.filter((job) => job.idJobTitle !== itemToDelete));
    } catch (error) {
      console.error("Failed to delete job title:", error);
      alert("Erreur lors de la suppression du poste.");
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Card: Gestion des Postes */}
        <div
          onClick={() => setIsJobTitlesModalOpen(true)}
          className="bg-card border border-border/50 rounded-[2rem] p-6 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-primary/30 transition-all cursor-pointer group"
        >
          <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <Briefcase className="size-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Gestion des Postes</h3>
          <p className="text-muted-foreground text-sm">
            Configurez les intitulés de postes disponibles pour vos employés (Manager, Serveur, etc.).
          </p>
        </div>

        {/* Card: Structure de l'établissement (Placeholder) */}
        <div className="bg-card border border-border/50 rounded-[2rem] p-6 opacity-60 grayscale cursor-not-allowed">
          <div className="p-3 bg-secondary/10 text-secondary rounded-xl w-fit mb-4">
            <Building className="size-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Structure de l'établissement</h3>
          <p className="text-muted-foreground text-sm">
            Départements, filiales et informations globales (Bientôt disponible).
          </p>
        </div>

        {/* Card: Types de contrats (Placeholder) */}
        <div className="bg-card border border-border/50 rounded-[2rem] p-6 opacity-60 grayscale cursor-not-allowed">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl w-fit mb-4">
            <Clock className="size-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Types de Contrats</h3>
          <p className="text-muted-foreground text-sm">
            Gérez les types de contrats de travail (CDI, CDD, Freelance).
          </p>
        </div>
      </div>

      <JobTitlesModal
        isOpen={isJobTitlesModalOpen}
        onClose={() => setIsJobTitlesModalOpen(false)}
        jobTitles={jobTitles}
        onAdd={handleAddJobTitle}
        onEdit={handleEditJobTitle}
        onDelete={promptDeleteJobTitle}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmation de suppression"
        description="Êtes-vous sûr de vouloir supprimer ce poste ? Cette action peut impacter les employés qui y sont assignés."
        onConfirm={executeDeleteJobTitle}
        loading={isDeleting}
      />
    </div>
  );
}
