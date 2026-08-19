import React from "react";
import { useQuery } from "@tanstack/react-query";
import { deliveryService } from "../../services/delivery.service";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Sheet/sheet";
import { formatCurrency } from "../../../../utils/formatters";
import { PurchaseStatusBadge } from "../../../purchases/components/PurchaseList/PurchaseStatusBadge";
import { PurchaseDetailSheet } from "../../../purchases/components/PurchaseList/PurchaseDetailSheet";
import { Button } from "@/components/ui/Button/button";
import { CheckCircle2, AlertCircle, Edit2, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";

interface DeliveryDetailSheetProps {
  idDelivery: string | null;
  onClose: () => void;
  onEdit?: (id: string, supplierId?: string) => void;
  onDelete?: (id: string) => void;
}

export const DeliveryDetailSheet: React.FC<DeliveryDetailSheetProps> = ({ idDelivery, onClose, onEdit, onDelete }) => {
  const [selectedPurchaseId, setSelectedPurchaseId] = React.useState<string | null>(null);
  const queryClient = useQueryClient();
  const [isValidating, setIsValidating] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ message: string; type: SnackbarType; isOpen: boolean }>({ message: "", type: "info", isOpen: false });

  const { data: delivery, isLoading } = useQuery({
    queryKey: ["deliveryDetails", idDelivery],
    queryFn: () => deliveryService.getDeliveryDetails(idDelivery!),
    enabled: !!idDelivery,
  });

  const handleValidate = async () => {
    if (!idDelivery || !delivery) return;

    setIsValidating(true);
    try {
      await deliveryService.validateDelivery(idDelivery);
      queryClient.invalidateQueries({ queryKey: ["deliveryDetails", idDelivery] });
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseDeliveries"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseDetails"] });
      setSnackbar({ message: "Livraison validée avec succès.", type: "success", isOpen: true });
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Erreur lors de la validation.";
      setSnackbar({ message: msg, type: "error", isOpen: true });
    } finally {
      setIsValidating(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Sheet open={!!idDelivery} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
          <SheetTitle className="flex flex-col gap-4 pr-8">
            <div className="flex justify-between items-center w-full">
              <span className="text-2xl font-bold">Détails de la Livraison</span>
              {delivery && <PurchaseStatusBadge status={delivery.status} />}
            </div>
            {delivery && delivery.status === "Ouvert" && (
              <div className="flex flex-wrap items-center gap-3">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(delivery.idDelivery, delivery.purchases?.[0]?.idSupplier || "")} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}
                {onDelete && (
                  <Button variant="outline" size="sm" onClick={() => onDelete(delivery.idDelivery)} className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                )}
              </div>
            )}
          </SheetTitle>
        </SheetHeader>

          {isLoading ? (
            <div className="flex justify-center py-8 text-muted-foreground">Chargement des détails...</div>
          ) : delivery ? (
            <div className="space-y-6 px-2 pb-6">
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Référence Livraison</p>
                  <p className="font-semibold">{delivery.ref}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Date de Livraison</p>
                  <p className="font-semibold">{new Date(delivery.deliveryDate).toLocaleDateString()}</p>
                </div>

                {delivery.purchases && delivery.purchases.length > 0 && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Commandes Associées</p>
                      <div className="flex gap-2 flex-wrap">
                        {delivery.purchases.map((p: any, index: number) => (
                          <span key={p.idPurchase || index} className="inline-flex items-center">
                            <button
                              onClick={() => setSelectedPurchaseId(p.idPurchase)}
                              className="font-semibold text-primary hover:underline"
                            >
                              {p.ref}
                            </button>
                            {index < delivery.purchases.length - 1 && <span className="ml-2">,</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Fournisseur</p>
                      <p className="font-semibold">{delivery.purchases[0]?.supplierName || "-"}</p>
                    </div>
                  </>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 border-b border-border/50 pb-2">Articles Réceptionnés</h3>
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-left">Produit</th>
                        <th className="px-4 py-3 font-semibold text-right">Qté Livrée</th>
                        <th className="px-4 py-3 font-semibold text-right">Prix Unitaire</th>
                        <th className="px-4 py-3 font-semibold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {delivery.details?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                            Aucun produit dans cette livraison.
                          </td>
                        </tr>
                      ) : (
                        delivery.details?.map((detail: any) => (
                          <tr key={detail.idDetail} className="hover:bg-muted/50">
                            <td className="px-4 py-3 font-medium">
                              {detail.itemLabel || "Produit inconnu"}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                              +{detail.quantity}
                            </td>
                            <td className="px-4 py-3 text-right">{formatCurrency(detail.unitPrice)}</td>
                            <td className="px-4 py-3 text-right font-medium">{formatCurrency(detail.totalAmount)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-muted/50 font-semibold">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right">Total de la livraison</td>
                        <td className="px-4 py-3 text-right text-lg text-primary">{formatCurrency(delivery.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {delivery.status === "Ouvert" && (
                <div className="pt-6 border-t border-border/50">
                  <div className="mb-4 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      <strong>Attention :</strong> La validation d'une livraison est définitive. Elle mettra à jour les stocks et vous ne pourrez plus la modifier ni la supprimer.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowConfirm(true)}
                    disabled={isValidating}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    {isValidating ? "Validation en cours..." : "Valider définitivement la livraison"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-red-500">Erreur lors du chargement de la livraison.</div>
          )}
        </SheetContent>
      </Sheet>

      <PurchaseDetailSheet
        idPurchase={selectedPurchaseId}
        onClose={() => {
          setTimeout(() => setSelectedPurchaseId(null), 50);
        }}
      />
      
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Valider définitivement la livraison"
        description="Voulez-vous vraiment valider cette livraison ? Cette action mettra à jour les stocks et est irréversible."
        onConfirm={handleValidate}
      />

      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </>
  );
};
