import React from "react";
import { useQuery } from "@tanstack/react-query";
import { purchaseService } from "../../services/purchase.service";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Sheet/sheet";
import { formatCurrency } from "../../../../utils/formatters";
import { PurchaseStatusBadge } from "./PurchaseStatusBadge";

interface PurchaseDetailSheetProps {
  idPurchase: string | null;
  onClose: () => void;
}

export const PurchaseDetailSheet: React.FC<PurchaseDetailSheetProps> = ({ idPurchase, onClose }) => {
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

  const isLoading = isLoadingPurchase || isLoadingDetails;

  return (
    <Sheet open={!!idPurchase} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold flex justify-between items-center pr-8">
            Détails de la Commande
            {purchase && <PurchaseStatusBadge status={purchase.status} />}
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
          </div>
        ) : (
          <div className="py-8 text-center text-red-500">Erreur lors du chargement de la commande.</div>
        )}
      </SheetContent>
    </Sheet>
  );
};
