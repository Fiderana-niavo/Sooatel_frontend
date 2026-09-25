import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { deliveryService } from "../../services/delivery.service";
import { supplierPaymentService } from "@/features/purchases/services/supplier-payment.service";
import { formatCurrency } from "../../../../utils/formatters";
import { Eye, CheckCircle2, Edit2, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { ActionDropdown } from "@/components/ui/ActionDropdown/ActionDropdown";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";
import { DeliveryDetailSheet } from "./DeliveryDetailSheet";
import { DeliverySheet } from "../DeliverySheet/DeliverySheet";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import { GlobalSupplierPaymentDialog } from "@/features/purchases/components/PurchaseList/GlobalSupplierPaymentDialog";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";

export function DeliveryListPage({ onGoToPurchases }: { onGoToPurchases?: () => void }) {
  const [page] = useState(1);
  const [hasSavedPaymentState, setHasSavedPaymentState] = useState(() => !!sessionStorage.getItem("supplierPaymentSavedState"));
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(() => {
    const saved = sessionStorage.getItem("viewDeliveryDetailId");
    if (saved) {
      sessionStorage.removeItem("viewDeliveryDetailId");
      return saved;
    }
    return null;
  });
  
  // States for Edit Mode
  const [editingDeliveryId, setEditingDeliveryId] = useState<string | null>(null);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

  const [confirmAction, setConfirmAction] = useState<{ type: "validate" | "delete", id: string, idSupplier?: string } | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; isOpen: boolean }>({ message: "", type: "info", isOpen: false });
  const [deleteStrategy, setDeleteStrategy] = useState<"SUPPLIER_CREDIT" | "CORRECTION">("SUPPLIER_CREDIT");

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type, isOpen: true });
  };

  const [filters, setFilters] = useState<{ idPurchase?: string, status?: number, returnToPurchases?: boolean }>(() => {
    const saved = sessionStorage.getItem("deliveryFilter");
    if (saved) {
      sessionStorage.removeItem("deliveryFilter");
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  const result = useQuery({
    queryKey: ["deliveries", page, filters],
    queryFn: () => deliveryService.getAllDeliveries({ 
      page, 
      limit: 10,
      idPurchase: filters.idPurchase,
      status: filters.status
    })
  });

  const { data, isLoading, refetch } = result;

  const [useCredit, setUseCredit] = useState(true);
  const validateSupplierId = confirmAction?.type === "validate" ? confirmAction.idSupplier : null;
  
  const { data: balanceData } = useQuery({
    queryKey: ["supplierBalance", validateSupplierId],
    queryFn: async () => {
      const res = await supplierPaymentService.getSupplierBalance(validateSupplierId!);
      return res.data.payload;
    },
    enabled: !!validateSupplierId,
  });

  const deleteDeliveryId = confirmAction?.type === "delete" ? confirmAction.id : null;
  const deletePaymentSummaryResult = useQuery({
    queryKey: ["deliveryPaymentSummary", deleteDeliveryId],
    queryFn: async () => {
      const res = await supplierPaymentService.getDeliverySummary(deleteDeliveryId!);
      return res.data.payload;
    },
    enabled: !!deleteDeliveryId,
  });
  const deletePaymentSummary = deletePaymentSummaryResult.data;

  const handleConfirm = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === "validate") {
        await deliveryService.validateDelivery(confirmAction.id);
        if (useCredit && balanceData && balanceData.balance > 0) {
           await supplierPaymentService.applySupplierCredit(confirmAction.idSupplier!, { idDelivery: confirmAction.id });
        }
        showSnackbar("Livraison validée avec succès.", "success");
      } else if (confirmAction.type === "delete") {
        await deliveryService.deleteDelivery(confirmAction.id, deleteStrategy);
        showSnackbar("Livraison supprimée avec succès.", "success");
      }
      refetch();
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || `Erreur lors de la ${confirmAction.type === "validate" ? "validation" : "suppression"}.`;
      showSnackbar(msg, "error");
    } finally {
      setConfirmAction(null);
      setDeleteStrategy("SUPPLIER_CREDIT");
    }
  };

  const openDeliveriesResult = useQuery({
    queryKey: ["deliveries-open-count"],
    queryFn: () => deliveryService.getAllDeliveries({ status: 5, limit: 1 })
  });
  const openDeliveriesCount = openDeliveriesResult.data?.total ?? 0;

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Livraisons Fournisseurs</h1>
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <select 
            value={filters.status === undefined ? "" : filters.status} 
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value ? Number(e.target.value) : undefined }))}
            className="bg-background border border-input rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          >
            <option value="">Tous les statuts</option>
            <option value="5">Ouverte (Non validée)</option>
            <option value="0">Validée (Livré)</option>
            <option value="-3">Annulée</option>
          </select>

          {hasSavedPaymentState && (
            <Button 
              variant="default" 
              onClick={() => {
                setPaymentDialogOpen(true);
                setHasSavedPaymentState(false);
              }} 
              className="w-full md:w-auto font-semibold shadow-md animate-in fade-in zoom-in duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Reprendre le paiement en cours
            </Button>
          )}
          {!hasSavedPaymentState && (
            <Button 
              variant="outline" 
              onClick={() => setPaymentDialogOpen(true)} 
              className="border-primary text-primary hover:bg-primary/10 w-full md:w-auto"
            >
              Faire un paiement / acompte
            </Button>
          )}
          {filters.returnToPurchases && onGoToPurchases && (
            <Button
              variant="outline"
              onClick={onGoToPurchases}
              className="text-primary border-primary hover:bg-primary/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la commande
            </Button>
          )}
          {(filters.idPurchase || filters.status !== undefined) && (
            <Button 
              variant="outline" 
              onClick={() => setFilters({})}
              className="text-muted-foreground"
            >
              Effacer les filtres
            </Button>
          )}
        </div>
      </div>

      {openDeliveriesCount > 0 && (
        <div 
          onClick={() => setFilters(prev => ({ ...prev, status: 5 }))}
          className="flex items-start gap-3 bg-amber-500/10 p-4 rounded-lg border border-amber-500/20 text-amber-700 dark:text-amber-400 cursor-pointer hover:bg-amber-500/20 transition-colors"
        >
          <div className="bg-amber-500/20 p-2 rounded-full flex-shrink-0 mt-0.5">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base mb-1">
              {openDeliveriesCount} livraison{openDeliveriesCount > 1 ? "s" : ""} non validée{openDeliveriesCount > 1 ? "s" : ""}
            </h3>
            <p className="text-sm opacity-90">
              Vous avez des livraisons en statut "Ouverte". Cliquez ici pour les filtrer, puis validez-les pour mettre à jour les stocks et autoriser les paiements.
            </p>
          </div>
        </div>
      )}

      {(filters.idPurchase || filters.status !== undefined) && (
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-md text-sm">
          <strong>Filtre actif :</strong> Affichage des livraisons en cours pour une commande spécifique.
        </div>
      )}

      <div className="border border-border/50 shadow-sm rounded-lg bg-card text-card-foreground">
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Référence</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Fournisseur</th>
                  <th className="px-6 py-4 font-semibold">Réf. Commande</th>
                  <th className="px-6 py-4 font-semibold text-right">Total</th>
                  <th className="px-6 py-4 font-semibold text-center">Statut</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Chargement des livraisons...</td>
                  </tr>
                ) : data?.records?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Aucune livraison trouvée.</td>
                  </tr>
                ) : (
                  data?.records.map((delivery) => (
                    <tr key={delivery.idDelivery} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{delivery.ref}</td>
                      <td className="px-6 py-4">{new Date(delivery.deliveryDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{delivery.supplierName || "-"}</td>
                      <td className="px-6 py-4">{delivery.purchaseRef || "-"}</td>
                      <td className="px-6 py-4 text-right font-medium">{formatCurrency(delivery.totalAmount)}</td>
                      <td className="px-6 py-4 text-center">
                        <DeliveryStatusBadge status={delivery.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <ActionDropdown
                            items={[
                              {
                                label: "Détails",
                                icon: <Eye className="h-4 w-4" />,
                                onClick: () => setSelectedDeliveryId(delivery.idDelivery),
                              },
                              ...(delivery.status === "Ouvert" ? [
                                {
                                  label: "Valider",
                                  icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                                  onClick: () => setConfirmAction({ type: "validate", id: delivery.idDelivery, idSupplier: delivery.idSupplier }),
                                },
                                {
                                  label: "Modifier",
                                  icon: <Edit2 className="h-4 w-4 text-amber-500" />,
                                  onClick: () => {
                                    setEditingDeliveryId(delivery.idDelivery);
                                    setEditingSupplierId(delivery.idSupplier || null);
                                  },
                                },
                                {
                                  label: "Supprimer",
                                  icon: <Trash2 className="h-4 w-4 text-red-500" />,
                                  onClick: () => setConfirmAction({ type: "delete", id: delivery.idDelivery }),
                                  className: "text-red-500 hover:bg-red-500/10",
                                }
                              ] : []),
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DeliveryDetailSheet
        idDelivery={selectedDeliveryId}
        onClose={() => setSelectedDeliveryId(null)}
      />

      {editingDeliveryId && (
        <DeliverySheet
          deliveryIdToEdit={editingDeliveryId}
          supplierIdForEdit={editingSupplierId}
          onClose={() => {
            setEditingDeliveryId(null);
            setEditingSupplierId(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.type === "validate" ? "Valider la livraison" : "Supprimer la livraison"}
        description={confirmAction?.type === "validate" 
          ? "Voulez-vous vraiment valider cette livraison ? Cette action est irréversible et mettra à jour les stocks." 
          : "Voulez-vous vraiment supprimer cette livraison ?"}
        onConfirm={handleConfirm}
      >
        {confirmAction?.type === "validate" && balanceData && balanceData.balance > 0 && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 rounded-lg text-emerald-800 dark:text-emerald-400 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={useCredit} 
                onChange={(e) => setUseCredit(e.target.checked)} 
                className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
              />
              Utiliser le crédit fournisseur disponible ({formatCurrency(balanceData.balance)}) pour régler cette livraison
            </label>
          </div>
        )}
        {confirmAction?.type === "delete" && deletePaymentSummary && deletePaymentSummary.totalPaid > 0 && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg text-amber-800 dark:text-amber-400 text-sm space-y-3">
            <p className="font-semibold">
              Cette livraison a {formatCurrency(deletePaymentSummary.totalPaid)} de paiements associés.
              Que souhaitez-vous faire avec ces paiements ?
            </p>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                name="deleteStrategy"
                value="SUPPLIER_CREDIT"
                checked={deleteStrategy === "SUPPLIER_CREDIT"}
                onChange={() => setDeleteStrategy("SUPPLIER_CREDIT")}
                className="mt-0.5"
              />
              <span>
                <strong>Convertir en crédit fournisseur</strong>
                <br />
                <span className="text-xs opacity-80">Les paiements seront conservés et disponibles pour les prochaines livraisons.</span>
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                name="deleteStrategy"
                value="CORRECTION"
                checked={deleteStrategy === "CORRECTION"}
                onChange={() => setDeleteStrategy("CORRECTION")}
                className="mt-0.5"
              />
              <span>
                <strong>Correction (annuler les paiements)</strong>
                <br />
                <span className="text-xs opacity-80">Les allocations seront supprimées. À utiliser uniquement en cas d'erreur de saisie.</span>
              </span>
            </label>
          </div>
        )}
      </ConfirmDialog>

      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar((prev) => ({ ...prev, isOpen: false }))}
        />
      )}

      <GlobalSupplierPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSuccess={() => { refetch(); }}
      />
    </div>
  );
}