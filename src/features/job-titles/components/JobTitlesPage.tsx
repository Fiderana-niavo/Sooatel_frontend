import { useState, useEffect, useCallback } from "react";
import { Briefcase, Edit, Trash2, Plus, X, Check } from "lucide-react";
import { JobTitleService } from "../services/job-title.service";
import type { JobTitle } from "../types/type";
import { Input } from "@/components/ui/Inputs/input";
import { Button } from "@/components/ui/Button/button";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";

export function JobTitlesPage() {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: SnackbarType;
    isOpen: boolean;
  }>({
    message: "",
    type: "info",
    isOpen: false,
  });

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type, isOpen: true });
  };

  const fetchJobTitles = useCallback(async () => {
    try {
      const data = await JobTitleService.getAll();
      setJobTitles(data);
    } catch (error) {
      console.error("Failed to fetch job titles:", error);
      showSnackbar("Erreur lors de la récupération des postes.", "error");
    }
  }, []);

  useEffect(() => {
    fetchJobTitles();
  }, [fetchJobTitles]);

  const handleAdd = async () => {
    if (!newJobTitle.trim()) return;
    try {
      const newJob = await JobTitleService.create(newJobTitle.trim());
      setJobTitles((prev) => [...prev, newJob]);
      setNewJobTitle("");
      showSnackbar("Poste créé avec succès.", "success");
    } catch (error) {
      console.error("Failed to create job title:", error);
      showSnackbar("Erreur lors de la création du poste.", "error");
    }
  };

  const startEdit = (job: JobTitle) => {
    setEditingId(job.idJobTitle);
    setEditingTitle(job.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveEdit = async () => {
    if (!editingTitle.trim() || !editingId) return;
    try {
      await JobTitleService.update(editingId, editingTitle.trim());
      setJobTitles((prev) =>
        prev.map((job) =>
          job.idJobTitle === editingId ? { ...job, title: editingTitle.trim() } : job
        )
      );
      setEditingId(null);
      setEditingTitle("");
      showSnackbar("Poste modifié avec succès.", "success");
    } catch (error) {
      console.error("Failed to update job title:", error);
      showSnackbar("Erreur lors de la modification du poste.", "error");
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
      setJobTitles((prev) =>
        prev.filter((job) => job.idJobTitle !== itemToDelete)
      );
      showSnackbar("Poste supprimé avec succès.", "success");
    } catch (error) {
      console.error("Failed to delete job title:", error);
      showSnackbar("Erreur lors de la suppression du poste.", "error");
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
          <Briefcase className="size-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-secondary">
            Gestion des Postes
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Ajoutez, modifiez ou supprimez les intitulés de postes disponibles pour les employés.
          </p>
        </div>
      </div>

      <div className="flex items-end gap-3 bg-muted/10 p-4 rounded-2xl border border-border/50">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Nouvel intitulé de poste
          </label>
          <Input
            placeholder="Ex: Réceptionniste, Manager..."
            value={newJobTitle}
            onChange={(e) => setNewJobTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="bg-background"
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={!newJobTitle.trim()}
          className="gap-2 px-5 rounded-xl shrink-0"
        >
          <Plus className="size-4" />
          Ajouter
        </Button>
      </div>

      <div className="flex-1 min-h-[400px]">
        {jobTitles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed flex flex-col items-center justify-center h-full">
            <Briefcase className="size-12 mb-4 opacity-20" />
            <p>Aucun poste n'a été créé pour le moment.</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Intitulé du poste</th>
                  <th className="px-6 py-4 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {jobTitles.map((job) => (
                  <tr key={job.idJobTitle} className="hover:bg-muted/30 transition-colors group">
                    {editingId === job.idJobTitle ? (
                      <td colSpan={2} className="px-6 py-2">
                        <div className="flex items-center gap-3">
                          <Input
                            autoFocus
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="h-9 flex-1"
                          />
                          <div className="flex justify-end gap-1 w-24">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={saveEdit}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                            >
                              <Check className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={cancelEdit}
                              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {job.title}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => startEdit(job)}
                              className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => promptDeleteJobTitle(job.idJobTitle)}
                              className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={executeDeleteJobTitle}
        title="Supprimer ce poste ?"
        description="Êtes-vous sûr de vouloir supprimer ce poste ? Cette action est irréversible."
        loading={isDeleting}
      />

      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
}
