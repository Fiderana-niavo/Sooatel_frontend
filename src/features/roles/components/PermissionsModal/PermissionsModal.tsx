import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { PermissionService } from "../../services/permission.service";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";

interface PermissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionsChanged: () => void;
  showSnackbar: (message: string, type: "success" | "error" | "info") => void;
}

export function PermissionsModal({ open, onOpenChange, onPermissionsChanged, showSnackbar }: PermissionsModalProps) {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({ permissionName: "", description: "", idCategory: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [permsRes, catsRes] = await Promise.all([
        PermissionService.getAll({ limit: 1000, search: searchQuery }),
        PermissionService.getCategories({ limit: 100 })
      ]);
      setPermissions(permsRes.records);
      setCategories(catsRes.records);
    } catch (err) {
      console.error(err);
      showSnackbar("Erreur lors du chargement des permissions.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, searchQuery]);

  const handleOpenForm = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        permissionName: item.permissionName,
        description: item.description || "",
        idCategory: item.idCategory || ""
      });
    } else {
      setEditingItem(null);
      setFormData({ permissionName: "", description: "", idCategory: "" });
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.permissionName || !formData.idCategory) {
      showSnackbar("Veuillez remplir les champs obligatoires.", "error");
      return;
    }

    try {
      if (editingItem) {
        await PermissionService.update(editingItem.idPermission, formData);
        showSnackbar("Permission modifiée avec succès.", "success");
      } else {
        await PermissionService.create(formData);
        showSnackbar("Permission créée avec succès.", "success");
      }
      setIsFormOpen(false);
      loadData();
      onPermissionsChanged();
    } catch (err: any) {
      console.error(err);
      showSnackbar(err.message || "Erreur lors de l'enregistrement.", "error");
    }
  };

  const promptDelete = (id: string) => {
    setPermissionToDelete(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!permissionToDelete) return;
    setIsDeleting(true);
    try {
      await PermissionService.delete(permissionToDelete);
      showSnackbar("Permission supprimée avec succès.", "success");
      loadData();
      onPermissionsChanged();
    } catch (err: any) {
      console.error(err);
      showSnackbar("Erreur lors de la suppression.", "error");
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
      setPermissionToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-border/50 bg-muted/10 shrink-0">
            <DialogTitle className="text-xl">
              {!isFormOpen 
                ? "Gestion des Permissions" 
                : editingItem 
                  ? "Modifier la permission" 
                  : "Créer une nouvelle permission"
              }
            </DialogTitle>
            <DialogDescription>
              {!isFormOpen 
                ? "Gérez les permissions individuelles et leurs catégories." 
                : "Remplissez les informations ci-dessous pour configurer cette permission."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col bg-muted/5">
            {!isFormOpen ? (
              <div className="flex-1 flex flex-col w-full h-full">
                <div className="p-4 md:p-6 border-b border-border/50 flex flex-col sm:flex-row gap-4 shrink-0 bg-background">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input 
                      placeholder="Rechercher une permission..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 bg-muted/20 border-border/50 focus-visible:ring-1"
                    />
                  </div>
                  <Button onClick={() => handleOpenForm()} className="h-12 px-6 rounded-xl shadow-md">
                    <Plus className="size-4 mr-2" />
                    Nouvelle Permission
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                  {loading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : permissions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                      <Search className="size-10 opacity-20 mb-4" />
                      <p className="text-lg">Aucune permission trouvée.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {permissions.map(p => (
                        <div key={p.idPermission} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50 hover:bg-muted/20 transition-colors group">
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="font-semibold text-secondary truncate">{p.permissionName}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium uppercase tracking-wider text-[10px] shrink-0">
                                {p.category?.name || "Sans catégorie"}
                              </span>
                              {p.description && <span className="truncate">{p.description}</span>}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenForm(p)}>
                              <Edit className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => promptDelete(p.idPermission)}>
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col w-full h-full bg-background animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="px-6 py-6 md:px-8 md:py-8 flex-1 overflow-y-auto custom-scrollbar">
                  <form id="permission-form" onSubmit={handleSave} className="max-w-2xl mx-auto space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-secondary">Nom de la permission <span className="text-destructive">*</span></label>
                      <Input 
                        required 
                        value={formData.permissionName}
                        onChange={(e) => setFormData({...formData, permissionName: e.target.value})}
                        placeholder="ex: users_read"
                        className="h-12 bg-muted/20"
                      />
                      <p className="text-xs text-muted-foreground">Le nom technique de la permission utilisé dans le code.</p>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-secondary">Catégorie <span className="text-destructive">*</span></label>
                      <select 
                        required
                        value={formData.idCategory}
                        onChange={(e) => setFormData({...formData, idCategory: e.target.value})}
                        className="flex h-12 w-full items-center justify-between rounded-lg border border-input bg-muted/20 px-4 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                      >
                        <option value="">Sélectionnez une catégorie...</option>
                        {categories.map(c => (
                          <option key={c.idCategory} value={c.idCategory}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-secondary">Description</label>
                      <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="flex min-h-[120px] w-full rounded-lg border border-input bg-muted/20 px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y transition-colors"
                        placeholder="Expliquez clairement ce que cette permission autorise à faire..."
                      />
                    </div>
                  </form>
                </div>
                
                <div className="p-6 border-t border-border/50 shrink-0 flex justify-end gap-3 bg-muted/5">
                  <Button type="button" variant="outline" className="h-12 px-6 rounded-xl" onClick={() => setIsFormOpen(false)}>Annuler</Button>
                  <Button type="submit" form="permission-form" className="h-12 px-8 rounded-xl shadow-md">Enregistrer la permission</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        description="Êtes-vous sûr de vouloir supprimer cette permission ? Cette action est irréversible et pourrait affecter les rôles qui l'utilisent."
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
