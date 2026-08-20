import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseService } from "../../services/purchase.service";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { AlertTriangle, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import type { Purchase } from "../../types/purchase.type";

interface CancelPurchaseDialogProps {
  purchase: Purchase | null;
  onClose: () => void;
}

export const CancelPurchaseDialog: React.FC<CancelPurchaseDialogProps> = ({ purchase, onClose }) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [needsDeliveryAction, setNeedsDeliveryAction] = useState(false);

  const cancel = useMutation({
    mutationFn: (forceAction?: "delete" | "confirm") =>
      purchaseService.cancel(purchase!.idPurchase, { forceAction }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchase", purchase!.idPurchase] });
      onClose();
    },
    onError: (err: unknown) => {
      const data = (err as any)?.response?.data;
      const msg = data?.error || data?.message || (err as Error).message || "";
      if (msg.includes("livraison non validée")) {
        setNeedsDeliveryAction(true);
        setError(null); // Clear previous errors, show prompt instead
      } else {
        setError(msg || "Erreur lors de l'annulation.");
      }
    },
  });

  return (
    <ConfirmDialog
      open={!!purchase}
      onOpenChange={(open) => !open && onClose()}
      title="Annuler la commande"
      confirmText="Confirmer l'annulation"
      cancelText={needsDeliveryAction ? "Ne pas annuler" : "Retour"}
      loadingText="Annulation..."
      confirmButtonClassName="bg-red-600 hover:bg-red-700 text-white"
      onConfirm={() => cancel.mutate(undefined)}
      loading={cancel.isPending}
      hideConfirmButton={needsDeliveryAction}
    >
      {purchase && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Vous êtes sur le point d&apos;annuler la commande{" "}
            <span className="font-semibold text-foreground">{purchase.ref}</span>.
          </p>

          {!needsDeliveryAction && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium text-amber-800 dark:text-amber-300">Attention</p>
              <p className="text-amber-700 dark:text-amber-400">
                Une commande annulée ne peut plus être réactivée.
              </p>
              {purchase.status === "Partiellement" || purchase.status === 3 ? (
                <p className="text-amber-700 dark:text-amber-400 font-medium">
                  Puisque des livraisons ont déjà été faites pour cette commande, seule les quantités restantes seront annulées. Les quantités d'origine resteront intactes dans l'historique.
                </p>
              ) : (
                <p className="text-amber-700 dark:text-amber-400">
                  L'historique des livraisons validées (s'il y en a) sera conservé et les quantités d'origine resteront intactes.
                </p>
              )}
            </div>
          )}

          {needsDeliveryAction && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 text-sm space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <p className="font-medium text-orange-800 dark:text-orange-300">Livraison en cours détectée</p>
              </div>
              <p className="text-orange-700 dark:text-orange-400">
                Cette commande possède une livraison en cours (ouverte). Que voulez-vous faire de cette livraison avant d'annuler le reste de la commande ?
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => cancel.mutate("delete")} 
                  disabled={cancel.isPending}
                  className="flex-1 bg-white hover:bg-orange-100 text-orange-700 border-orange-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer la livraison
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => cancel.mutate("confirm")} 
                  disabled={cancel.isPending}
                  className="flex-1 bg-white hover:bg-green-100 text-green-700 border-green-300"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmer la livraison
                </Button>
              </div>
            </div>
          )}

          {error && !needsDeliveryAction && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      )}
    </ConfirmDialog>
  );
};
