import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryService } from "../../services/delivery.service";
import { buildDeliveryPayload, calculateCurrentTotalAmount } from "../../utils/delivery.utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Sheet/sheet";
import { Button } from "@/components/ui/Button/button";
import { formatCurrency } from "../../../../utils/formatters";
import { PackagePlus, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import type { Purchase } from "../../../purchases/types/purchase.type";
import type { PendingPurchase } from "../../types/delivery.type";

interface DeliverySheetProps {
  purchase?: Purchase | null;
  deliveryIdToEdit?: string | null;
  supplierIdForEdit?: string | null;
  onClose: () => void;
}

export const DeliverySheet: React.FC<DeliverySheetProps> = ({ purchase, deliveryIdToEdit, supplierIdForEdit, onClose }) => {
  const queryClient = useQueryClient();

  // Purchases for which input is active (the clicked purchase is active by default)
  const [activePurchaseIds, setActivePurchaseIds] = useState<Set<string>>(new Set());
  // Purchases for which details are expanded
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  // Map idPurchaseDetail -> entered quantity
  const [qtyMap, setQtyMap] = useState<Map<string, number>>(new Map());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const isEditMode = !!deliveryIdToEdit;

  const { data: deliveryDetails } = useQuery({
    queryKey: ["deliveryDetails", deliveryIdToEdit],
    queryFn: () => deliveryService.getDeliveryDetails(deliveryIdToEdit!),
    enabled: isEditMode,
  });

  const idSupplier = purchase?.idSupplier ?? supplierIdForEdit ?? deliveryDetails?.purchases?.[0]?.idSupplier ?? null;

  const pendingResult = useQuery({
    queryKey: ["deliveries-pending", idSupplier, deliveryIdToEdit],
    queryFn: () => deliveryService.getPendingBySupplier(idSupplier!, deliveryIdToEdit || undefined),
    enabled: !!idSupplier,
  });

  // Initialize for Creation mode
  React.useEffect(() => {
    if (!isEditMode && pendingResult.data && purchase) {
      setActivePurchaseIds(new Set([purchase.idPurchase]));
      setExpandedIds(new Set([purchase.idPurchase]));
      setQtyMap(new Map());
      setSubmitError(null);
      setSubmitSuccess(null);
    }
  }, [isEditMode, pendingResult.data, purchase]);

  // Initialize for Edit mode
  React.useEffect(() => {
    if (isEditMode && pendingResult.data && deliveryDetails) {
      const activeIds = new Set<string>();
      const qtyMapInit = new Map<string, number>();

      for (const p of pendingResult.data) {
        for (const detail of p.details) {
          const editDetail = deliveryDetails.details?.find((d: any) => d.idSuppliedItem === detail.idSuppliedItem);
          
          if (editDetail && Number(editDetail.quantity) > 0) {
            activeIds.add(p.idPurchase);
            qtyMapInit.set(detail.idPurchaseDetail, Number(editDetail.quantity));
          }
        }
      }

      setActivePurchaseIds(activeIds);
      setExpandedIds(new Set(activeIds));
      setQtyMap(qtyMapInit);
      setSubmitError(null);
      setSubmitSuccess(null);
    }
  }, [isEditMode, pendingResult.data, deliveryDetails]);

  const createMutation = useMutation({
    mutationFn: deliveryService.create,
    onSuccess: (result) => {
      setSubmitSuccess(`Livraison ${result.ref} enregistrée avec succès !`);
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["deliveries-pending", idSupplier] });
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      setTimeout(onClose, 2000);
    },
    onError: () => {
      setSubmitError("Erreur lors de l'enregistrement. Veuillez réessayer.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => deliveryService.updateDelivery(deliveryIdToEdit!, payload),
    onSuccess: (result) => {
      setSubmitSuccess(`Livraison ${result.ref} modifiée avec succès !`);
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["deliveries-pending", idSupplier] });
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["deliveryDetails", deliveryIdToEdit] });
      setTimeout(onClose, 2000);
    },
    onError: () => {
      setSubmitError("Erreur lors de la modification. Veuillez réessayer.");
    },
  });

  const isPending = isEditMode ? updateMutation.isPending : createMutation.isPending;

  const handleToggleActive = useCallback((idPurchase: string) => {
    setActivePurchaseIds((prev) => {
      const next = new Set(prev);
      if (next.has(idPurchase)) {
        next.delete(idPurchase);
      } else {
        next.add(idPurchase);
        setExpandedIds((e) => new Set(e).add(idPurchase));
      }
      return next;
    });
  }, []);

  const handleToggleExpand = useCallback((idPurchase: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(idPurchase)) {
        next.delete(idPurchase);
      } else {
        next.add(idPurchase);
      }
      return next;
    });
  }, []);

  const handleQtyChange = useCallback((idPurchaseDetail: string, value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    setQtyMap((prev) => {
      const next = new Map(prev);
      next.set(idPurchaseDetail, num);
      return next;
    });
  }, []);

  const handleSubmit = () => {
    if (!pendingResult.data) return;
    if (!isEditMode && !purchase) return;

    setSubmitError(null);

    const mainPurchaseId = purchase?.idPurchase || deliveryDetails?.purchases?.[0]?.idPurchase || "";

    const payload = buildDeliveryPayload(
      pendingResult.data,
      activePurchaseIds,
      qtyMap,
      mainPurchaseId
    );

    if (payload.lines.length === 0) {
      setSubmitError("Veuillez saisir au moins une quantité reçue.");
      return;
    }
    if (payload.idPurchases.length === 0) {
      setSubmitError("Aucune commande touchée par cette livraison.");
      return;
    }

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const currentTotalAmount = React.useMemo(() => {
    return pendingResult.data ? calculateCurrentTotalAmount(pendingResult.data, activePurchaseIds, qtyMap) : 0;
  }, [pendingResult.data, activePurchaseIds, qtyMap]);

  // Sort: clicked purchase first, then others
  const sorted: PendingPurchase[] = pendingResult.data
    ? [
        ...pendingResult.data.filter((p) => p.idPurchase === purchase?.idPurchase),
        ...pendingResult.data.filter((p) => p.idPurchase !== purchase?.idPurchase),
      ]
    : [];

  return (
    <Sheet open={!!purchase || !!deliveryIdToEdit} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <PackagePlus className="h-6 w-6 text-primary" />
            {isEditMode ? "Modification de la livraison" : "Réception de marchandises"}
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            {isEditMode 
              ? "Modifiez les quantités reçues pour cette livraison. Cochez ou décochez les commandes pour les inclure ou les exclure." 
              : "Saisissez les quantités reçues par article. Les autres commandes du même fournisseur sont affichées — elles ont peut-être été livrées en même temps."}
          </p>
        </SheetHeader>

        {pendingResult.isLoading && (
          <div className="flex justify-center py-12 text-muted-foreground">
            Chargement des commandes en attente...
          </div>
        )}

        {!pendingResult.isLoading && sorted.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            Aucune commande en attente pour ce fournisseur.
          </div>
        )}

        {sorted.length > 1 && (
          <div className="mb-4 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-600 dark:text-amber-400">
              <strong>Peut-être que ces commandes ont déjà été livrées aussi.</strong>{" "}
              Cochez «&nbsp;Inclure&nbsp;» sur les commandes concernées pour y saisir des quantités.
            </p>
          </div>
        )}

        <div className="space-y-4 pb-6">
          {sorted.map((p) => {
            const isMain = p.idPurchase === purchase?.idPurchase;
            const isActive = activePurchaseIds.has(p.idPurchase);
            const isExpanded = expandedIds.has(p.idPurchase);

            return (
              <div
                key={p.idPurchase}
                className={`rounded-lg border transition-all ${
                  isActive
                    ? "border-primary/50 bg-card"
                    : "border-border/40 bg-muted/20 opacity-60"
                }`}
              >
                {/* Purchase header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleExpand(p.idPurchase)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      type="button"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <div>
                      <p className="font-semibold text-sm">
                        {p.ref}
                        {isMain && (
                          <span className="ml-2 text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                            Commande sélectionnée
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.purchaseDate).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                        {p.purchaser && ` · ${p.purchaser.name} ${p.purchaser.lastname ?? ""}`}
                        {` · ${p.status}`}
                      </p>
                    </div>
                  </div>

                  {!isMain && (
                    <Button
                      variant={isActive ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => handleToggleActive(p.idPurchase)}
                      className="text-xs"
                    >
                      {isActive ? "Retirer" : "Inclure cette livraison"}
                    </Button>
                  )}
                </div>

                {/* Items details */}
                {isExpanded && (
                  <div className="border-t border-border/50 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Article</th>
                          <th className="px-4 py-2 text-right font-medium">Commandé</th>
                          <th className="px-4 py-2 text-right font-medium">Déjà livré</th>
                          <th className="px-4 py-2 text-right font-medium">Restant</th>
                          <th className="px-4 py-2 text-right font-medium">Reçu maintenant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {p.details.map((detail) => {
                          const currentQty = qtyMap.get(detail.idPurchaseDetail) ?? 0;
                          const fullyDelivered = detail.remaining <= 0;

                          return (
                            <tr
                              key={detail.idPurchaseDetail}
                              className={`${fullyDelivered ? "opacity-50" : ""}`}
                            >
                              <td className="px-4 py-2.5 font-medium">
                                {detail.suppliedItem?.item?.label ?? "Article inconnu"}
                              </td>
                              <td className="px-4 py-2.5 text-right text-muted-foreground">
                                {detail.quantity}
                              </td>
                              <td className="px-4 py-2.5 text-right text-muted-foreground">
                                {detail.alreadyDelivered > 0 ? (
                                  <span className="text-emerald-600 dark:text-emerald-400">
                                    {detail.alreadyDelivered}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                {fullyDelivered ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Livré
                                  </span>
                                ) : (
                                  <span className="text-amber-600 dark:text-amber-400">
                                    {detail.remaining}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={currentQty === 0 ? "" : currentQty}
                                  placeholder="0"
                                  disabled={!isActive}
                                  onChange={(e) =>
                                    handleQtyChange(detail.idPurchaseDetail, e.target.value)
                                  }
                                  className="w-24 text-right border border-border rounded-md px-2 py-1 text-sm bg-background
                                    focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                                    disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-muted/30">
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-right text-xs text-muted-foreground">
                            Total commande
                          </td>
                          <td colSpan={2} className="px-4 py-2 text-right font-semibold text-sm">
                            {formatCurrency(p.totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: messages + submit button */}
        <div className="sticky bottom-0 bg-background border-t border-border/50 pt-4 pb-2 space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="font-semibold text-muted-foreground">Montant total de la livraison :</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(currentTotalAmount)}</span>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-md">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              {submitSuccess}
            </div>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isPending || (isEditMode && !deliveryDetails)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {isPending ? "Enregistrement..." : (isEditMode ? "Enregistrer les modifications" : "Valider la réception")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
