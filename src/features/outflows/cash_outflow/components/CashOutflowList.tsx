import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { CashOutflowService } from "../services/cash-outflow.service";
import { OutflowCategoryService } from "../../category/services/category.service";
import { CashJournalService } from "../../services/cash-journal.service";
import type { CashOutflow, CashOutflowDto, OutflowCategory, CashJournal } from "../../types";
import { Button } from "@/components/ui/Button/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Input } from "@/components/ui/Inputs/input";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { useAppStore } from "@/store/app.store";

export function CashOutflowList() {
  const user = useAppStore(state => state.connectedUser);
  
  const [outflows, setOutflows] = useState<CashOutflow[]>([]);
  const [categories, setCategories] = useState<OutflowCategory[]>([]);
  const [journals, setJournals] = useState<CashJournal[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [selectedOutflow, setSelectedOutflow] = useState<CashOutflow | null>(null);
  
  const emptyForm: CashOutflowDto = {
    ref: "",
    amount: "" as unknown as number,
    outflowDate: new Date().toISOString().slice(0, 16),
    reason: "",
    invoiceReference: "",
    idProcessedBy: user?.idEmployee || "",
    idJournal: "",
    idOutflowCategory: ""
  };
  
  const [formData, setFormData] = useState<CashOutflowDto>(emptyForm);
  
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; isOpen: boolean }>({ message: "", type: "info", isOpen: false });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [outflowToDelete, setOutflowToDelete] = useState<CashOutflow | null>(null);

  const showSnackbar = (message: string, type: SnackbarType = "info") => setSnackbar({ message, type, isOpen: true });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [outflowsData, categoriesData, journalsData] = await Promise.all([
        CashOutflowService.getAll({ search, limit: 100 }),
        OutflowCategoryService.getAll({ limit: 100 }),
        CashJournalService.getAll({ limit: 50 })
      ]);
      setOutflows(outflowsData.records);
      setCategories(categoriesData.records);
      setJournals(journalsData.records);
    } catch (err) {
      showSnackbar("Erreur lors du chargement des sorties", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => loadData(), 300);
    return () => clearTimeout(delay);
  }, [search]);

  const handleOpenDialog = (outflow?: CashOutflow) => {
    if (outflow) {
      setSelectedOutflow(outflow);
      setFormData({
        ref: outflow.ref,
        amount: outflow.amount,
        outflowDate: outflow.outflowDate ? new Date(outflow.outflowDate).toISOString().slice(0, 16) : "",
        reason: outflow.reason || "",
        invoiceReference: outflow.invoiceReference || "",
        idProcessedBy: outflow.idProcessedBy,
        idJournal: outflow.idJournal,
        idOutflowCategory: outflow.idOutflowCategory || ""
      });
    } else {
      const openJournal = journals.find(j => !j.journalClosing) || journals[0];
      setSelectedOutflow(null);
      setFormData({ 
        ...emptyForm, 
        idProcessedBy: user?.idEmployee || emptyForm.idProcessedBy,
        idJournal: openJournal ? openJournal.idJournal : "" 
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (formData.amount <= 0 || !formData.idOutflowCategory) {
      showSnackbar("Le montant et la catégorie sont requis", "error");
      return;
    }
    
    try {
      const dataToSave = { ...formData, idOutflowCategory: formData.idOutflowCategory || null, reason: formData.reason || null };
      
      if (selectedOutflow) {
        await CashOutflowService.update(selectedOutflow.idCashOutflows, dataToSave);
        showSnackbar("Sortie modifiée", "success");
      } else {
        await CashOutflowService.create(dataToSave);
        showSnackbar("Sortie créée", "success");
      }
      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      showSnackbar(err.message || "Erreur lors de la sauvegarde", "error");
    }
  };

  const confirmDelete = (outflow: CashOutflow) => {
    setOutflowToDelete(outflow);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!outflowToDelete) return;
    try {
      await CashOutflowService.delete(outflowToDelete.idCashOutflows);
      showSnackbar("Sortie supprimée", "success");
      loadData();
    } catch (err: any) {
      showSnackbar(err.message || "Erreur lors de la suppression", "error");
    } finally {
      setConfirmOpen(false);
      setOutflowToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par référence facture..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Sortie
        </Button>
      </div>

      <div className="border rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Référence</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Motif</th>
              <th className="px-4 py-3 font-medium text-right">Montant</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted-foreground">Chargement...</td>
              </tr>
            ) : outflows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted-foreground">Aucune sortie trouvée</td>
              </tr>
            ) : (
              outflows.map((out) => (
                <tr key={out.idCashOutflows} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3">{out.outflowDate ? new Date(out.outflowDate).toLocaleString() : "-"}</td>
                  <td className="px-4 py-3">{out.ref}</td>
                  <td className="px-4 py-3">
                    {out.outflowCategory ? `${out.outflowCategory.label} ${out.outflowCategory.code ? `(${out.outflowCategory.code})` : ''}` : "-"}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{out.reason || "-"}</td>
                  <td className="px-4 py-3 text-right font-medium">{Number(out.amount).toLocaleString()} Ar</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(out)}>
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => confirmDelete(out)}>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedOutflow ? "Modifier" : "Nouvelle"} Sortie de Caisse</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Référence Facture</label>
              <Input
                value={formData.invoiceReference || ""}
                onChange={(e) => setFormData({ ...formData, invoiceReference: e.target.value })}
                placeholder="Ex: FAC-2023-001"
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
              <label className="text-sm font-medium">Date & Heure</label>
              <Input
                type="datetime-local"
                value={formData.outflowDate}
                onChange={(e) => setFormData({ ...formData, outflowDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Catégorie *</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.idOutflowCategory || ""}
                onChange={(e) => setFormData({ ...formData, idOutflowCategory: e.target.value })}
              >
                <option value="" disabled>Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.idOutflowCategory} value={cat.idOutflowCategory}>
                    {cat.label} {cat.code ? `(${cat.code})` : ''}
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
              >
                <option value="" disabled>Sélectionner un journal</option>
                {journals.map((j) => (
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
                placeholder="Raison de la sortie"
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
        description="Voulez-vous vraiment supprimer cette sortie de caisse ?"
        onConfirm={executeDelete}
      />

      {snackbar.isOpen && (
        <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar({ ...snackbar, isOpen: false })} />
      )}
    </div>
  );
}
