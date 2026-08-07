import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { CashMovementService } from "../services/cash-movement.service";
import { CashMovementCategoryService } from "../../category/services/cash-movement-category.service";
import { CashJournalService } from "../../services/cash-journal.service";
import type { CashMovement, CashMovementDto, CashMovementCategory, CashJournal } from "../../types";
import axios from "axios";
import { Button } from "@/components/ui/Button/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Input } from "@/components/ui/Inputs/input";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { useAppStore } from "@/store/app.store";

export function CashMovementList({ direction }: { direction: number }) {
  const user = useAppStore(state => state.connectedUser);
  
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [categories, setCategories] = useState<CashMovementCategory[]>([]);
  const [journals, setJournals] = useState<CashJournal[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ idPaymentMethod: string; methodName: string }[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  
  const [selectedMovement, setSelectedMovement] = useState<CashMovement | null>(null);
  
  const emptyForm: CashMovementDto = {
    ref: "",
    amount: "" as unknown as number,
    movementDate: new Date().toISOString().slice(0, 16),
    reason: "",
    invoiceReference: "",
    direction: direction,
    idProcessedBy: user?.idEmployee || "",
    idJournal: "",
    idCashMovementCategory: "",
    idPaymentMethod: ""
  };
  
  const [formData, setFormData] = useState<CashMovementDto>(emptyForm);
  
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; isOpen: boolean }>({ message: "", type: "info", isOpen: false });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<CashMovement | null>(null);

  const showSnackbar = (message: string, type: SnackbarType = "info") => setSnackbar({ message, type, isOpen: true });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cashMovementsData, categoriesData, journalsData, paymentMethodsRes] = await Promise.all([
        CashMovementService.getAll({ search, limit, page, direction }),
        CashMovementCategoryService.getAll({ limit: 100 }),
        CashJournalService.getAll({ limit: 50 }),
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/payment-methods/select`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      ]);
      
      setCashMovements(cashMovementsData.records);
      setTotal(cashMovementsData.total);
      
      setCategories(categoriesData.records.filter(c => c.allowedDirection === direction || c.allowedDirection === 0));
      setJournals(journalsData.records);
      setPaymentMethods(paymentMethodsRes.data.payload || paymentMethodsRes.data);
    } catch (err) {
      showSnackbar("Erreur lors du chargement des mouvements", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => loadData(), 300);
    return () => clearTimeout(delay);
  }, [search, direction, page]);

  const handleOpenDialog = (movement?: CashMovement) => {
    if (movement) {
      setSelectedMovement(movement);
      setFormData({
        ref: movement.ref,
        amount: movement.amount,
        movementDate: movement.movementDate ? new Date(movement.movementDate).toISOString().slice(0, 16) : "",
        reason: movement.reason || "",
        invoiceReference: movement.invoiceReference || "",
        direction: movement.direction,
        idProcessedBy: movement.idProcessedBy,
        idJournal: movement.idJournal,
        idCashMovementCategory: movement.idCashMovementCategory || "",
        idPaymentMethod: movement.idPaymentMethod || ""
      });
    } else {
      const openJournal = journals.find(j => !j.journalClosing) || journals[0];
      setSelectedMovement(null);
      setFormData({ 
        ...emptyForm, 
        idProcessedBy: user?.idEmployee || emptyForm.idProcessedBy,
        idJournal: openJournal ? openJournal.idJournal : "" 
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (formData.amount <= 0 || !formData.idCashMovementCategory || !formData.idPaymentMethod) {
      showSnackbar("Le montant, la catégorie et le mode de paiement sont requis", "error");
      return;
    }
    
    try {
      const dataToSave = { ...formData, idCashMovementCategory: formData.idCashMovementCategory || null, reason: formData.reason || null };
      
      if (selectedMovement) {
        await CashMovementService.update(selectedMovement.idCashMovement, dataToSave);
        showSnackbar("Mouvement modifié", "success");
      } else {
        await CashMovementService.create(dataToSave);
        showSnackbar("Mouvement créé", "success");
      }
      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      showSnackbar(err.message || "Erreur lors de la sauvegarde", "error");
    }
  };

  const confirmDelete = (movement: CashMovement) => {
    setMovementToDelete(movement);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!movementToDelete) return;
    try {
      await CashMovementService.delete(movementToDelete.idCashMovement);
      showSnackbar("Mouvement supprimé", "success");
      loadData();
    } catch (err: any) {
      showSnackbar(err.message || "Erreur lors de la suppression", "error");
    } finally {
      setConfirmOpen(false);
      setMovementToDelete(null);
    }
  };

  const isOutflow = direction === -5;
  const title = isOutflow ? "Nouvelle Sortie" : "Nouvelle Entrée";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par référence facture..."
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Button onClick={() => handleOpenDialog()} className={isOutflow ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"}>
          <Plus className="w-4 h-4 mr-2" />
          {title}
        </Button>
      </div>

      <div className="border rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Référence</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Mode de paiement</th>
              <th className="px-4 py-3 font-medium">Motif</th>
              <th className="px-4 py-3 font-medium text-right">Montant</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-muted-foreground">Chargement...</td>
              </tr>
            ) : cashMovements.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-muted-foreground">Aucun mouvement trouvé</td>
              </tr>
            ) : (
              cashMovements.map((movement) => (
                <tr key={movement.idCashMovement} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3">{movement.movementDate ? new Date(movement.movementDate).toLocaleString() : "-"}</td>
                  <td className="px-4 py-3">{movement.invoiceReference || "-"}</td>
                  <td className="px-4 py-3">
                    {movement.cashMovementCategory ? movement.cashMovementCategory.label : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {movement.paymentMethod ? movement.paymentMethod.label : "-"}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{movement.reason || "-"}</td>
                  <td className={`px-4 py-3 text-right font-medium ${isOutflow ? 'text-red-500' : 'text-green-500'}`}>
                    {Number(movement.amount).toLocaleString()} Ar
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!(
                      movement.reason === "Journalisation des ventes" ||
                      movement.reason?.toLowerCase().includes("remboursement") ||
                      movement.reason?.toLowerCase().includes("ajustement")
                    ) && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(movement)}>
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => confirmDelete(movement)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-sm text-muted-foreground">
          Affichage {Math.min((page - 1) * limit + 1, total)} à {Math.min(page * limit, total)} sur {total} entrées
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMovement ? "Modifier" : "Nouveau"} Mouvement de Caisse ({isOutflow ? "Sortie" : "Entrée"})</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Date & Heure</label>
              <Input
                type="datetime-local"
                value={formData.movementDate}
                onChange={(e) => setFormData({ ...formData, movementDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Montant *</label>
              <Input
                type="number"
                value={formData.amount === ("" as unknown as number) ? "" : formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value === "" ? ("" as unknown as number) : Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Référence Facture (Optionnel)</label>
              <Input
                value={formData.invoiceReference || ""}
                onChange={(e) => setFormData({ ...formData, invoiceReference: e.target.value })}
                placeholder="Ex: FAC-2023-001"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Catégorie *</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.idCashMovementCategory || ""}
                onChange={(e) => setFormData({ ...formData, idCashMovementCategory: e.target.value })}
              >
                <option value="" disabled>Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.idCashMovementCategory} value={cat.idCashMovementCategory}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Mode de paiement *</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.idPaymentMethod || ""}
                onChange={(e) => setFormData({ ...formData, idPaymentMethod: e.target.value })}
              >
                <option value="" disabled>Sélectionner un mode</option>
                {paymentMethods.map((pm) => (
                  <option key={pm.idPaymentMethod} value={pm.idPaymentMethod}>
                    {pm.methodName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Journal de Caisse *</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.idJournal || ""}
                onChange={(e) => setFormData({ ...formData, idJournal: e.target.value })}
                disabled
              >
                <option value="" disabled>Sélectionner un journal</option>
                {journals.filter(j => !j.journalClosing || j.idJournal === formData.idJournal).map((j) => (
                  <option key={j.idJournal} value={j.idJournal}>
                    {j.ref} ({new Date(j.journalOpening).toLocaleString()} - {j.journalClosing ? new Date(j.journalClosing).toLocaleString() : "En cours"})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-sm font-medium">Motif (Optionnel)</label>
              <Input
                value={formData.reason || ""}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Raison du mouvement"
              />
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
        description="Voulez-vous vraiment supprimer ce mouvement de caisse ?"
        onConfirm={executeDelete}
      />

      {snackbar.isOpen && (
        <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar({ ...snackbar, isOpen: false })} />
      )}
    </div>
  );
}
