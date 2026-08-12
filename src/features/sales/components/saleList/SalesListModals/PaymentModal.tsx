import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balanceDue: number;
  paymentDate: string;
  onPaymentDateChange: (val: string) => void;
  isPartial: boolean;
  onIsPartialChange: (val: boolean) => void;
  amount: string;
  onAmountChange: (val: string) => void;
  paymentCode: string;
  onPaymentCodeChange: (val: string) => void;
  methodId: string;
  onMethodIdChange: (val: string) => void;
  paymentMethods: { idPaymentMethod: string; methodName: string }[];
  actionLoading: boolean;
  onConfirm: () => void;
  saleDate: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  balanceDue,
  paymentDate,
  onPaymentDateChange,
  isPartial,
  onIsPartialChange,
  amount,
  onAmountChange,
  paymentCode,
  onPaymentCodeChange,
  methodId,
  onMethodIdChange,
  paymentMethods,
  actionLoading,
  onConfirm,
  saleDate
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Encaisser la vente</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <div className="mb-4">
            <label className="text-sm font-medium mb-1 block">Reste à payer</label>
            <div className="text-2xl font-bold text-primary">{balanceDue.toLocaleString("fr-FR")} Ar</div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium mb-1 block">Date du paiement</label>
            <Input
              type="datetime-local"
              max={new Date().toISOString().slice(0, 16)}
              min={saleDate}
              value={paymentDate}
              onChange={(e) => onPaymentDateChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="isPartial"
                checked={isPartial}
                onChange={(e) => onIsPartialChange(e.target.checked)}
                className="accent-primary"
              />
              <label htmlFor="isPartial" className="text-sm font-medium cursor-pointer">Payer une partie seulement (Tranche)</label>
            </div>
            {isPartial && (
              <div className="pl-6">
                <label className="text-xs text-muted-foreground mb-1 block">Montant à encaisser (Ar)</label>
                <Input
                  type="number"
                  min="0"
                  max={balanceDue}
                  value={amount}
                  onChange={(e) => onAmountChange(e.target.value)}
                  placeholder="Entrez le montant..."
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium mb-1 block">Code de Paiement (Optionnel)</label>
            <Input
              type="text"
              placeholder="Ex: Ref chèque, Mvola..."
              value={paymentCode}
              onChange={(e) => onPaymentCodeChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="mb-2">
            <label className="text-sm font-medium mb-2 block">Mode de paiement</label>
            <div className="flex flex-col gap-2">
              {paymentMethods.map(m => (
                <label key={m.idPaymentMethod} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${methodId === m.idPaymentMethod ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary/10'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.idPaymentMethod}
                    checked={methodId === m.idPaymentMethod}
                    onChange={(e) => onMethodIdChange(e.target.value)}
                    className="accent-primary"
                  />
                  <span className="font-medium text-sm">{m.methodName}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 flex justify-end gap-3">
          <Button variant="outline" disabled={actionLoading} onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button disabled={actionLoading || !methodId} onClick={onConfirm}>
            {actionLoading ? "Enregistrement..." : "Confirmer le paiement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
