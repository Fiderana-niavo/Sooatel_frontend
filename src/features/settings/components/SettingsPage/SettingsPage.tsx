import { useState } from "react";
import { Briefcase, Building, Clock } from "lucide-react";
import { JobTitlesModal } from "@/features/employees/components/JobTitlesModal/JobTitlesModal";
import type { JobTitle } from "@/features/employees/types/type";

const MOCK_JOB_TITLES: JobTitle[] = [
  { idJobTitle: "j1", title: "Manager" },
  { idJobTitle: "j2", title: "Serveur" },
  { idJobTitle: "j3", title: "Cuisinier" },
  { idJobTitle: "j4", title: "Réceptionniste" },
];

export function SettingsPage() {
  const [isJobTitlesModalOpen, setIsJobTitlesModalOpen] = useState(false);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>(MOCK_JOB_TITLES);

  const handleAddJobTitle = (title: string) => {
    const newId = `j${Date.now()}`;
    setJobTitles(prev => [...prev, { idJobTitle: newId, title }]);
  };

  const handleEditJobTitle = (id: string, newTitle: string) => {
    setJobTitles(prev => prev.map(job => job.idJobTitle === id ? { ...job, title: newTitle } : job));
  };

  const handleDeleteJobTitle = (id: string) => {
    setJobTitles(prev => prev.filter(job => job.idJobTitle !== id));
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
        onDelete={handleDeleteJobTitle}
      />
    </div>
  );
}
