import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseService } from "../../services/purchase.service";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { AlertCircle } from "lucide-react";
import type { Purchase } from "../../types/purchase.type";

interface ConfirmPurchaseDialogProps {
  purchase: Purchase | null;
  onClose: () => void;
  /** Called after confirmation so caller can open the reception sheet right after */
  onConfirmed?: () => void;
}

export const ConfirmPurchaseDialog: React.FC<ConfirmPurchaseDialogProps> = ({
  purchase,
  onClose,
  onConfirmed,
}) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => purchaseService.confirm(purchase!.idPurchase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchase", purchase!.idPurchase] });
      if (onConfirmed) onConfirmed();
      onClose();
    },
    onError: (err: unknown) => {
      const respData = (err as any)?.response?.data;
      const msg = respData?.error || respData?.message || "Erreur lors de la confirmation.";
      setError(msg);
    },
  });

  return (
    <ConfirmDialog
      open={!!purchase}
      onOpenChange={(open) => !open && onClose()}
      title="Confirmer la commande"
      confirmText="Confirmer la commande"
      loadingText="Confirmation..."
      confirmButtonClassName="bg-emerald-600 hover:bg-emerald-700 text-white"
      onConfirm={() => mutation.mutate()}
      loading={mutation.isPending}
    >
      {purchase && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Vous êtes sur le point de confirmer la commande{" "}
            <span className="font-semibold text-foreground">{purchase.ref}</span>.
          </p>

          <div className="bg-muted/40 border border-border/50 rounded-lg p-4 text-sm space-y-1 text-muted-foreground">
            <p>
              Une commande <span className="font-medium text-foreground">CONFIRMÉE</span> ne peut plus être supprimée.
            </p>
            <p>Elle pourra être modifiée ou annulée sous certaines conditions.</p>
          </div>

          {error && (
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
