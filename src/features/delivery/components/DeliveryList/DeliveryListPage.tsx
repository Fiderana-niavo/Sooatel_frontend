import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { deliveryService } from "../../services/delivery.service";
import { formatCurrency } from "../../../../utils/formatters";
import { Eye, CheckCircle2, Edit2, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { ActionDropdown } from "@/components/ui/ActionDropdown/ActionDropdown";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";
import { DeliveryDetailSheet } from "./DeliveryDetailSheet";
import { DeliverySheet } from "../DeliverySheet/DeliverySheet";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";

export function DeliveryListPage({ onGoToPurchases }: { onGoToPurchases?: () => void }) {
  const [page] = useState(1);
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

  const [confirmAction, setConfirmAction] = useState<{ type: "validate" | "delete", id: string } | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; isOpen: boolean }>({ message: "", type: "info", isOpen: false });

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

  const handleConfirm = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === "validate") {
        await deliveryService.validateDelivery(confirmAction.id);
        showSnackbar("Livraison validée avec succès.", "success");
      } else if (confirmAction.type === "delete") {
        await deliveryService.deleteDelivery(confirmAction.id);
        showSnackbar("Livraison supprimée avec succès.", "success");
      }
      refetch();
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || `Erreur lors de la ${confirmAction.type === "validate" ? "validation" : "suppression"}.`;
      showSnackbar(msg, "error");
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Livraisons Fournisseurs</h1>
        <div className="flex gap-2">
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
              Afficher toutes les livraisons
            </Button>
          )}
        </div>
      </div>

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
                                  onClick: () => setConfirmAction({ type: "validate", id: delivery.idDelivery }),
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
        onEdit={(id, supplierId) => {
          setSelectedDeliveryId(null);
          setEditingDeliveryId(id);
          setEditingSupplierId(supplierId || null);
        }}
        onDelete={(id) => {
          setSelectedDeliveryId(null);
          setConfirmAction({ type: "delete", id });
        }}
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
