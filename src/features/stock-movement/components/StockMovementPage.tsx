import { useState, useCallback } from "react";
import { ClipboardList, History, ArrowDownCircle, ArrowUpCircle, Package, Flame } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stockMovementService } from "../services/stock-movement.service";
import { StockMovementForm } from "./StockMovementForms/StockMovementForm";
import { StockMovementDraftList } from "./StockMovementLists/StockMovementDraftList";
import { StockMovementHistoryList } from "./StockMovementLists/StockMovementHistoryList";
import { StockOverviewList, type StockOverviewFilters } from "./StockMovementLists/StockOverviewList";
import { LossForm } from "./StockMovementForms/LossForm";
import { ItemService } from "@/features/items/services/item.service";
import type { StockMovement, StockMovementDto, StockMovementFilters, StockMovementTab } from "../types/stock-movement.type";

const DRAFT_STATUS = 5;
const VALIDATED_STATUS = 0;

const DEFAULT_HISTORY_FILTERS: StockMovementFilters = {
  page: 1,
  limit: 10,
  status: VALIDATED_STATUS,
};



const tabClass = (active: boolean) =>
  `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
    active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
  }`;

export function StockMovementPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<StockMovementTab>("overview");
  const [formOpen, setFormOpen] = useState(false);
  const [lossOpen, setLossOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
  const [formDirection, setFormDirection] = useState<number | undefined>(undefined);
  const [historyFilters, setHistoryFilters] = useState<StockMovementFilters>(DEFAULT_HISTORY_FILTERS);
  const [overviewFilters, setOverviewFilters] = useState<StockOverviewFilters>({ page: 1, limit: 10 });
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; open: boolean }>({
    message: "",
    type: "info",
    open: false,
  });

  const showSnackbar = (message: string, type: SnackbarType = "info") =>
    setSnackbar({ message, type, open: true });

  /* ---------- Queries ---------- */
  const draftsResult = useQuery({
    queryKey: ["stock-movements", "drafts"],
    queryFn: () => stockMovementService.getAll({ status: DRAFT_STATUS, limit: 100 }),
  });

  const historyResult = useQuery({
    queryKey: ["stock-movements", "history", historyFilters],
    queryFn: () => stockMovementService.getAll(historyFilters),
  });

  const overviewResult = useQuery({
    queryKey: ["items", "overview", overviewFilters],
    queryFn: () => ItemService.getAllPaginated(overviewFilters),
  });

  /* ---------- Mutations ---------- */
  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["stock-movements"] });
    qc.invalidateQueries({ queryKey: ["items"] });
  }, [qc]);

  const createMutation = useMutation({
    mutationFn: (dto: StockMovementDto) => stockMovementService.create(dto),
    onSuccess: () => { invalidate(); showSnackbar("Brouillon créé", "success"); closeForm(); },
    onError: (err: Error) => showSnackbar(err.message || "Erreur lors de la création", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: StockMovementDto }) => stockMovementService.update(id, dto),
    onSuccess: () => { invalidate(); showSnackbar("Mouvement mis à jour", "success"); closeForm(); },
    onError: (err: Error) => showSnackbar(err.message || "Erreur lors de la modification", "error"),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => stockMovementService.validate(id),
    onSuccess: () => { invalidate(); showSnackbar("Mouvement validé — stock mis à jour", "success"); },
    onError: (err: Error) => showSnackbar(err.message || "Erreur lors de la validation", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => stockMovementService.delete(id),
    onSuccess: () => { invalidate(); showSnackbar("Brouillon supprimé", "success"); },
    onError: (err: Error) => showSnackbar(err.message || "Erreur lors de la suppression", "error"),
  });

  /* ---------- Handlers ---------- */
  const openNewForm = (direction?: number) => { setSelectedMovement(null); setFormDirection(direction); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setSelectedMovement(null); setFormDirection(undefined); };

  const handleEdit = (m: StockMovement) => { setSelectedMovement(m); setFormOpen(true); };

  const handleSave = async (dto: StockMovementDto) => {
    if (selectedMovement) {
      await updateMutation.mutateAsync({ id: selectedMovement.idStockMovement, dto });
    } else {
      await createMutation.mutateAsync(dto);
    }
  };

  const handleFiltersChange = (partial: Partial<StockMovementFilters>) =>
    setHistoryFilters((prev) => ({ ...prev, ...partial }));

  /* ---------- Derived ---------- */
  const drafts = draftsResult.data?.records ?? [];
  const history = historyResult.data?.records ?? [];
  const historyTotal = historyResult.data?.total ?? 0;
  
  const overviewRecords = overviewResult.data?.records ?? [];
  const overviewTotal = overviewResult.data?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={tabClass(activeTab === "overview")}
          >
            <Package className="size-4" />
            État des Stocks
          </button>
          <button
            onClick={() => setActiveTab("drafts")}
            className={tabClass(activeTab === "drafts")}
          >
            <ClipboardList className="size-4" />
            Brouillons
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
            Historique
          </button>
          <button
            onClick={() => setActiveTab("loss")}
            className={tabClass(activeTab === "loss")}
          >
            <Flame className="size-4" />
            Pertes
          </button>
        </div>

        <div className="flex gap-2">
          {(activeTab === "overview" || activeTab === "drafts" || activeTab === "history") && (
            <>
              <Button
                variant="outline"
                className="border-red-500/40 text-red-600 hover:bg-red-500/10"
                onClick={() => openNewForm(-5)}
              >
                <ArrowDownCircle className="size-4 mr-2" />
                Sortie
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => openNewForm(5)}
              >
                <ArrowUpCircle className="size-4 mr-2" />
                Entrée
              </Button>
            </>
          )}
          {activeTab === "loss" && (
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => setLossOpen(true)}
            >
              <Flame className="size-4 mr-2" />
              Nouvelle perte
            </Button>
          )}
        </div>
      </div>

      {activeTab === "overview" && (
        <StockOverviewList
          records={overviewRecords}
          total={overviewTotal}
          isLoading={overviewResult.isLoading}
          filters={overviewFilters}
          onFiltersChange={(partial) => setOverviewFilters((prev) => ({ ...prev, ...partial }))}
        />
      )}

      {activeTab === "drafts" && (
        <StockMovementDraftList
          records={drafts}
          isLoading={draftsResult.isLoading}
          onEdit={handleEdit}
          onValidate={(m) => validateMutation.mutate(m.idStockMovement)}
          onDelete={(m) => deleteMutation.mutate(m.idStockMovement)}
        />
      )}

      {activeTab === "history" && (
        <StockMovementHistoryList
          records={history}
          total={historyTotal}
          isLoading={historyResult.isLoading}
          filters={historyFilters}
          onFiltersChange={handleFiltersChange}
        />
      )}

      {activeTab === "loss" && (
        <div className="flex flex-col gap-4">
          <div className="p-6 text-center bg-muted/30 rounded-xl border border-border/50">
            <Flame className="size-10 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-1">Enregistrement des pertes</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
              Enregistrez les pertes d'articles (casse, péremption, vol...). La quantité sera immédiatement déduite du stock.
            </p>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => setLossOpen(true)}
            >
              <Flame className="size-4 mr-2" />
              Enregistrer une perte
            </Button>
          </div>
        </div>
      )}

      {formOpen && (
        <StockMovementForm
          initial={selectedMovement ? {
            idStockMovement: selectedMovement.idStockMovement,
            idItem: selectedMovement.item?.idItem ?? selectedMovement.idItem,
            quantity: selectedMovement.quantity,
            direction: selectedMovement.direction,
            reason: selectedMovement.reason ?? "",
            movementDate: selectedMovement.movementDate,
          } : formDirection !== undefined ? { direction: formDirection } : undefined}
          onClose={closeForm}
          onSave={handleSave}
        />
      )}

      {lossOpen && (
        <LossForm
          onClose={() => setLossOpen(false)}
          onSuccess={(msg) => showSnackbar(msg, "success")}
          onError={(msg) => showSnackbar(msg, "error")}
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
