import React from "react";
import { useQuery } from "@tanstack/react-query";
import { purchaseService } from "../../services/purchase.service";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Sheet/sheet";
import { Button } from "@/components/ui/Button/button";
import { CheckCircle2, PackageCheck, Edit, Ban } from "lucide-react";
import { formatCurrency } from "../../../../utils/formatters";
import { PurchaseStatusBadge } from "./PurchaseStatusBadge";
import type { PurchaseDeliveryHistory } from "../../../delivery/types/delivery.type";

interface PurchaseDetailSheetProps {
  idPurchase: string | null;
  onClose: () => void;
  onGoToDelivery?: (idDelivery: string) => void;
  onConfirm?: (purchase: any) => void;
  onReceive?: (purchase: any) => void;
  onEdit?: (purchase: any) => void;
  onCancel?: (purchase: any) => void;
}

export const PurchaseDetailSheet: React.FC<PurchaseDetailSheetProps> = ({ idPurchase, onClose, onGoToDelivery, onConfirm, onReceive, onEdit, onCancel }) => {
  const { data: purchase, isLoading: isLoadingPurchase } = useQuery({
    queryKey: ["purchase", idPurchase],
    queryFn: () => purchaseService.getById(idPurchase!),
    enabled: !!idPurchase,
  });

  const { data: details, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["purchaseDetails", idPurchase],
    queryFn: () => purchaseService.getDetails(idPurchase!),
    enabled: !!idPurchase,
  });

  const { data: deliveries, isLoading: isLoadingDeliveries } = useQuery({
    queryKey: ["purchaseDeliveries", idPurchase],
    queryFn: () => purchaseService.getDeliveries(idPurchase!),
    enabled: !!idPurchase,
  });

  const isLoading = isLoadingPurchase || isLoadingDetails || isLoadingDeliveries;

  return (
    <Sheet open={!!idPurchase} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex flex-col gap-4 pr-8">
            <div className="flex justify-between items-center w-full">
              <span className="text-2xl font-bold">Détails de la commande</span>
              {purchase && <PurchaseStatusBadge status={purchase.status} />}
            </div>
            {purchase && (
              <div className="flex flex-wrap items-center gap-3">
                {(purchase.status === "Créé" || purchase.status === "Brouillon") && onConfirm && (
                  <Button variant="outline" size="sm" onClick={() => onConfirm(purchase)} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmer
                  </Button>
                )}
                {purchase.status !== "Annulé" && purchase.status !== "Livré" && onReceive && (
                  <Button variant="outline" size="sm" onClick={() => onReceive(purchase)} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                    <PackageCheck className="h-4 w-4 mr-2" />
                    Réception
                  </Button>
                )}
                {purchase.status !== "Annulé" && purchase.status !== "Livré" && onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(purchase)} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}
                {purchase.status !== "Annulé" && purchase.status !== "Livré" && onCancel && (
                  <Button variant="outline" size="sm" onClick={() => onCancel(purchase)} className="text-red-600 border-red-200 hover:bg-red-50">
                    <Ban className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                )}
              </div>
            )}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center py-8 text-muted-foreground">Chargement des détails...</div>
        ) : purchase ? (
          <div className="space-y-6 px-2 pb-6">
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border/50">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Référence</p>
                <p className="font-semibold">{purchase.ref}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Date</p>
                <p className="font-semibold">{new Date(purchase.purchaseDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Fournisseur</p>
                <p className="font-semibold">{purchase.supplier?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Responsable de l'achat</p>
                <p className="font-semibold">{purchase.purchaser?.name} {purchase.purchaser?.lastname}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 border-b border-border/50 pb-2">Produits Commandés</h3>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-left">Produit</th>
                      <th className="px-4 py-3 font-semibold text-right">Qté</th>
                      <th className="px-4 py-3 font-semibold text-right">Prix Unitaire</th>
                      <th className="px-4 py-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {details?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                          Aucun produit dans cette commande.
                        </td>
                      </tr>
                    ) : (
                      details?.map((detail) => (
                        <tr key={detail.idPurchaseDetail} className="hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">
                            {detail.suppliedItem?.item?.label || "Produit inconnu"}
                          </td>
                          <td className="px-4 py-3 text-right">{detail.quantity}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(detail.unitPrice)}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(detail.totalAmount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-muted/50 font-semibold">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right">Total Général</td>
                      <td className="px-4 py-3 text-right text-lg text-primary">{formatCurrency(purchase.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {deliveries && deliveries.length > 0 && (
              <div className="pt-6 mt-6 border-t border-border/50">
                <h3 className="text-lg font-semibold mb-4">Historique des Livraisons</h3>
                <div className="space-y-4">
                  {deliveries.map((delivery: PurchaseDeliveryHistory) => (
                    <div key={delivery.idDelivery} className="rounded-lg border border-border/50 overflow-hidden">
                      <div className="bg-muted/30 px-4 py-3 flex justify-between items-center border-b border-border/50">
                        <div>
                          {onGoToDelivery ? (
                            <button
                              onClick={() => onGoToDelivery(delivery.idDelivery)}
                              className="font-semibold text-primary hover:underline"
                            >
                              {delivery.ref}
                            </button>
                          ) : (
                            <p className="font-semibold">{delivery.ref}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(delivery.deliveryDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-muted-foreground mb-0.5">{delivery.status}</p>
                          <p className="font-semibold text-primary">{formatCurrency(delivery.totalAmount)}</p>
                        </div>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-muted/10 text-muted-foreground text-xs uppercase">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium">Produit</th>
                            <th className="px-4 py-2 text-right font-medium">Qté Livrée</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {delivery.details.map((detail) => (
                            <tr key={detail.idDeliveryDetail} className="hover:bg-muted/20">
                              <td className="px-4 py-2 text-muted-foreground">
                                {detail.itemLabel || "Produit inconnu"}
                              </td>
                              <td className="px-4 py-2 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                +{detail.quantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-red-500">Erreur lors du chargement de la commande.</div>
        )}
      </SheetContent>
    </Sheet>
  );
};
