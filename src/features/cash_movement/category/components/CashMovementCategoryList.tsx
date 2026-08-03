import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { CashMovementCategoryService } from "../services/cash-movement-category.service";
import type { CashMovementCategory, CashMovementCategoryDto } from "../../types";
import { Button } from "@/components/ui/Button/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Input } from "@/components/ui/Inputs/input";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { getDirectionLabel } from "../../utils/cash-movement.utils";

export function CashMovementCategoryList() {
  const [categories, setCategories] = useState<CashMovementCategory[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CashMovementCategory | null>(null);
  const [formData, setFormData] = useState<CashMovementCategoryDto>({ label: "", allowedDirection: 0 });

  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; isOpen: boolean }>({ message: "", type: "info", isOpen: false });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CashMovementCategory | null>(null);

  const showSnackbar = (message: string, type: SnackbarType = "info") => setSnackbar({ message, type, isOpen: true });

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await CashMovementCategoryService.getAll({ search, limit: 100 });
      setCategories(data.records);
    } catch (err) {
      showSnackbar("Erreur lors du chargement des catégories", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => loadCategories(), 300);
    return () => clearTimeout(delay);
  }, [search]);

  const handleOpenDialog = (category?: CashMovementCategory) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({ label: category.label, allowedDirection: category.allowedDirection });
    } else {
      setSelectedCategory(null);
      setFormData({ label: "", allowedDirection: 0 });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.label) {
      showSnackbar("Le libellé est requis", "error");
      return;
    }
    try {
      if (selectedCategory) {
        await CashMovementCategoryService.update(selectedCategory.idCashMovementCategory, formData);
        showSnackbar("Catégorie modifiée", "success");
      } else {
        await CashMovementCategoryService.create(formData);
        showSnackbar("Catégorie créée", "success");
      }
      setIsDialogOpen(false);
      loadCategories();
    } catch (err: any) {
      showSnackbar(err.message || "Erreur lors de la sauvegarde", "error");
    }
  };

  const confirmDelete = (category: CashMovementCategory) => {
    setCategoryToDelete(category);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await CashMovementCategoryService.delete(categoryToDelete.idCashMovementCategory);
      showSnackbar("Catégorie supprimée", "success");
      loadCategories();
    } catch (err: any) {
      showSnackbar(err.message || "Erreur lors de la suppression", "error");
    } finally {
      setConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };



  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Catégorie
        </Button>
      </div>

      <div className="border rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Libellé</th>
              <th className="px-4 py-3 font-medium">Type (Direction)</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-muted-foreground">Chargement...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-muted-foreground">Aucune catégorie trouvée</td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.idCashMovementCategory} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3">{cat.label}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.allowedDirection === 5 ? 'bg-green-100 text-green-700' : cat.allowedDirection === -5 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {getDirectionLabel(cat.allowedDirection)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(cat)}>
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => confirmDelete(cat)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Modifier" : "Nouvelle"} Catégorie</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Libellé *</label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Ex: Fournitures"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Type (Direction) *</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.allowedDirection}
                onChange={(e) => setFormData({ ...formData, allowedDirection: Number(e.target.value) })}
              >
                <option value={-5}>Sortie</option>
                <option value={5}>Entrée </option>
                <option value={0}>Entrée et sortie</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmer la suppression"
        description="Voulez-vous vraiment supprimer cette catégorie ?"
        onConfirm={executeDelete}
      />

      {snackbar.isOpen && (
        <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar({ ...snackbar, isOpen: false })} />
      )}
    </div>
  );
}
