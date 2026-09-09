import { useState, useCallback } from "react";
import { ClipboardList, History, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dishProductionService } from "../services/dish-production.service";
import { DishProductionForm } from "./DishProductionForm";
import { DishProductionDraftList } from "./DishProductionDraftList";
import { DishProductionHistoryList } from "./DishProductionHistoryList";
import type { DishProduction, DishProductionDto, DishProductionFilters } from "../types";

const DRAFT_STATUS = 5;
const VALIDATED_STATUS = 0;

const DEFAULT_HISTORY_FILTERS: DishProductionFilters = {
  page: 1,
  limit: 20,
  status: VALIDATED_STATUS,
};

type Tab = "drafts" | "history";

const tabClass = (active: boolean) =>
  `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
    active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
  }`;

export function DishProductionPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("drafts");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<DishProduction | null>(null);
  const [historyFilters, setHistoryFilters] = useState<DishProductionFilters>(DEFAULT_HISTORY_FILTERS);
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; open: boolean }>({
    message: "",
    type: "info",
    open: false,
  });

  const showSnackbar = (message: string, type: SnackbarType = "info") =>
    setSnackbar({ message, type, open: true });

  /* ---------- Queries ---------- */
  const draftsResult = useQuery({
    queryKey: ["dish-productions", "drafts"],
    queryFn: () => dishProductionService.getAll({ status: DRAFT_STATUS, limit: 100 }),
  });

  const historyResult = useQuery({
    queryKey: ["dish-productions", "history", historyFilters],
    queryFn: () => dishProductionService.getAll(historyFilters),
  });

  /* ---------- Mutations ---------- */
  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["dish-productions"] });
    qc.invalidateQueries({ queryKey: ["items"] });
    qc.invalidateQueries({ queryKey: ["stock-movements"] });
  }, [qc]);

  const createMutation = useMutation({
    mutationFn: (dto: DishProductionDto) => dishProductionService.create(dto),
    onSuccess: () => { invalidate(); showSnackbar("Brouillon créé", "success"); closeForm(); },
    onError: (err: Error) => showSnackbar(err.message || "Erreur lors de la création", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: DishProductionDto }) => dishProductionService.update(id, dto),
    onSuccess: () => { invalidate(); showSnackbar("Production mise à jour", "success"); closeForm(); },
    onError: (err: Error) => showSnackbar(err.message || "Erreur lors de la modification", "error"),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => dishProductionService.validate(id),
    onSuccess: () => { invalidate(); showSnackbar("Production validée. Stock mis à jour avec succès !", "success"); },
    onError: (err: Error) => showSnackbar(err.message || "Erreur lors de la validation. Vérifiez le stock des ingrédients.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dishProductionService.delete(id),
    onSuccess: () => { invalidate(); showSnackbar("Brouillon supprimé", "success"); },
    onError: (err: Error) => showSnackbar(err.message || "Erreur lors de la suppression", "error"),
  });

  /* ---------- Handlers ---------- */
  const openNewForm = () => { setSelectedProduction(null); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setSelectedProduction(null); };

  const handleEdit = (m: DishProduction) => { setSelectedProduction(m); setFormOpen(true); };

  const handleSave = async (dto: DishProductionDto) => {
    if (selectedProduction) {
      await updateMutation.mutateAsync({ id: selectedProduction.idDishProduction, dto });
    } else {
      await createMutation.mutateAsync(dto);
    }
  };

  const handleFiltersChange = (partial: Partial<DishProductionFilters>) =>
    setHistoryFilters((prev) => ({ ...prev, ...partial }));

  /* ---------- Derived ---------- */
  const drafts = draftsResult.data?.records ?? [];
  const history = historyResult.data?.records ?? [];
  const historyTotal = historyResult.data?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab("drafts")}
            className={tabClass(activeTab === "drafts")}
          >
            <ClipboardList className="size-4" />
            Brouillons de Production
            {drafts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 text-xs font-semibold">
                {drafts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={tabClass(activeTab === "history")}
          >
            <History className="size-4" />
            Historique (Validés)
          </button>
        </div>

        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={openNewForm}
        >
          <ChefHat className="size-4 mr-2" />
          Saisir une production
        </Button>
      </div>

      {/* Content */}
      {activeTab === "drafts" ? (
        <DishProductionDraftList
          records={drafts}
          isLoading={draftsResult.isLoading}
          onEdit={handleEdit}
          onValidate={(m) => validateMutation.mutate(m.idDishProduction)}
          onDelete={(m) => deleteMutation.mutate(m.idDishProduction)}
        />
      ) : (
        <DishProductionHistoryList
          records={history}
          total={historyTotal}
          isLoading={historyResult.isLoading}
          filters={historyFilters}
          onFiltersChange={handleFiltersChange}
        />
      )}

      {/* Form Drawer */}
      {formOpen && (
        <DishProductionForm
          initial={selectedProduction ? {
            idDishProduction: selectedProduction.idDishProduction,
            idItem: selectedProduction.item?.idItem ?? selectedProduction.idItem,
            quantity: selectedProduction.quantity,
            notes: selectedProduction.notes ?? "",
            productionDate: selectedProduction.productionDate,
          } : undefined}
          onClose={closeForm}
          onSave={handleSave}
        />
      )}

      {snackbar.open && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        />
      )}
    </div>
  );
}
