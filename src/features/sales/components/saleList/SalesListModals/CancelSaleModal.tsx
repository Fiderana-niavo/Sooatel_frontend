import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";

interface CancelSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalPaid: number;
  refundMethodId: string;
  onRefundMethodIdChange: (val: string) => void;
  paymentMethods: { idPaymentMethod: string; methodName: string }[];
  onConfirmRefund: () => void;
}

export const CancelSaleModal: React.FC<CancelSaleModalProps> = ({
  open,
  onOpenChange,
  totalPaid,
  refundMethodId,
  onRefundMethodIdChange,
  paymentMethods,
  onConfirmRefund
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-orange-600">Paiement existant détecté</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-sm text-muted-foreground">
          Vous annulez une vente qui a déjà été payée (Total payé : <strong className="text-foreground">{totalPaid.toLocaleString("fr-FR")} Ar</strong>). L'annulation nécessite un remboursement.
        </div>
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex flex-col gap-4 border p-4 rounded-lg bg-muted/30">
            <h4 className="font-semibold">Remboursement</h4>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Sélectionnez le mode de paiement utilisé pour le remboursement *</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={refundMethodId}
                onChange={e => onRefundMethodIdChange(e.target.value)}
              >
                <option value="" disabled>Choisir un mode...</option>
                {paymentMethods.map(pm => (
                  <option key={pm.idPaymentMethod} value={pm.idPaymentMethod}>{pm.methodName}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button disabled={!refundMethodId} onClick={onConfirmRefund}>Confirmer le remboursement</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
