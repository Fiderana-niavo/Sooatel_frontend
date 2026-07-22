import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { List, Edit, Trash2, Plus, X, Check, Search } from "lucide-react";
import type { MenuCategory } from "../types";

interface MenuCategorysModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MenuCategory[];
  onAdd: (data: Partial<MenuCategory>) => void;
  onEdit: (id: string, data: Partial<MenuCategory>) => void;
  onDelete: (id: string) => void;
}

export function MenuCategorysModal({ isOpen, onClose, data, onAdd, onEdit, onDelete }: MenuCategorysModalProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [search, setSearch] = useState("");

  const handleAdd = () => {
    if (newLabel.trim()) {
      onAdd({
        label: newLabel.trim(),
        description: newDescription.trim() || null,
      } as any);
      setNewLabel("");
      setNewDescription("");
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.idCategory);
    setEditLabel(item.label || "");
    setEditDescription(item.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (editLabel.trim() && editingId) {
      onEdit(editingId, {
        label: editLabel.trim(),
        description: editDescription.trim() || null,
      } as any);
      setEditingId(null);
    }
  };

  const filteredData = data.filter((r) =>
    r.label?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-4xl rounded-[2rem] p-0 overflow-hidden bg-card border shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 border-b">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
                  <List className="size-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight text-secondary">
                    Catégories de Menu
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-1 text-sm">
                    Gérez les catégories (Entrées, Plats...).
                  </DialogDescription>
                </div>
              </div>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64 bg-background"
                />
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="bg-muted/10 p-5 rounded-2xl border border-border/50">
            <h4 className="text-sm font-semibold mb-4 text-foreground">Nouvelle catégorie</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Nom (Label)</label>
                <Input placeholder="Ex: Entrées" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
                <Input placeholder="Infos..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="bg-background" />
              </div>
              <Button onClick={handleAdd} disabled={!newLabel.trim()} className="gap-2 rounded-xl h-10 w-full">
                <Plus className="size-4" /> Ajouter
              </Button>
            </div>
          </div>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                Aucune catégorie.
              </div>
            ) : (
              filteredData.map((item: any) => (
                <div key={item.idCategory} className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors group">
                  {editingId === item.idCategory ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                      <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="h-9" placeholder="Nom" />
                      <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="h-9" placeholder="Description" />
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={saveEdit} className="text-green-600"><Check className="size-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={cancelEdit}><X className="size-4" /></Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="font-semibold text-foreground w-1/3 truncate">{item.label}</div>
                        <div className="text-sm text-muted-foreground flex-1 truncate">{item.description || "-"}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(item)} className="opacity-0 group-hover:opacity-100"><Edit className="size-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => onDelete(item.idCategory)} className="opacity-0 group-hover:opacity-100 text-destructive"><Trash2 className="size-4" /></Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="p-4 bg-muted/10 border-t">
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto rounded-xl">Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
