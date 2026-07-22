import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { Briefcase, Edit, Trash2, Plus, X, Check } from "lucide-react";
import type { JobTitle } from "../types/type";

interface JobTitlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitles: JobTitle[];
  onAdd: (title: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

export function JobTitlesModal({ isOpen, onClose, jobTitles, onAdd, onEdit, onDelete }: JobTitlesModalProps) {
  const [newJobTitle, setNewJobTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleAdd = () => {
    if (newJobTitle.trim()) {
      onAdd(newJobTitle.trim());
      setNewJobTitle("");
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

  const saveEdit = () => {
    if (editingTitle.trim() && editingId) {
      onEdit(editingId, editingTitle.trim());
      setEditingId(null);
      setEditingTitle("");
    }
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-xl rounded-[2rem] p-0 overflow-hidden bg-card border shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 border-b">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
                <Briefcase className="size-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-secondary">
                  Gestion des Postes
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1 text-sm">
                  Ajoutez, modifiez ou supprimez les intitulés de postes disponibles pour les employés.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 md:p-8 space-y-6">
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

                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {jobTitles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                Aucun poste n'a été créé pour le moment.
              </div>
            ) : (
              jobTitles.map((job) => (
                <div
                  key={job.idJobTitle}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors group"
                >
                  {editingId === job.idJobTitle ? (
                    <div className="flex-1 flex items-center gap-2 mr-4">
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
                    </div>
                  ) : (
                    <div className="flex-1 font-semibold text-foreground text-sm">
                      {job.title}
                    </div>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    {editingId === job.idJobTitle ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={saveEdit}
                          className="size-8 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={cancelEdit}
                          className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                        >
                          <X className="size-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEdit(job)}
                          className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(job.idJobTitle)}
                          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="p-4 bg-muted/10 border-t">
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto rounded-xl">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
