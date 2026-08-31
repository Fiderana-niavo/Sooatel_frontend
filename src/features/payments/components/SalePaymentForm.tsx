import React, { useState } from "react";
import { Input } from "@/components/ui/Inputs/input";
import { Button } from "@/components/ui/Button/button";
import type { SalePayment, PaymentMethodRef } from "../../sales/types";
import { CalendarDays } from "lucide-react";

interface SalePaymentProps {
  payment: SalePayment | undefined;
  saleDate: string;
  paymentMethods: PaymentMethodRef[];
  balanceDue: number;
  totalAmount: number;
  onChange: (field: keyof SalePayment, value: any) => void;
  onClear: () => void;
}

export const SalePaymentForm: React.FC<SalePaymentProps> = ({
  payment, saleDate, paymentMethods, balanceDue, totalAmount, onChange, onClear
}) => {
  const [showDatePrompt, setShowDatePrompt] = useState(false);

  const handleDateBlur = () => {
    if (payment && !payment.paymentDate && saleDate) {
      setShowDatePrompt(true);
    }
  };

  const useSaleDate = () => {
    onChange("paymentDate", saleDate);
    setShowDatePrompt(false);
  };

  if (!payment) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm flex flex-col items-center justify-center space-y-4 h-full">
        <div className="text-center text-muted-foreground">
          <p className="mb-4">Aucun paiement initial ?</p>
          <Button variant="outline" onClick={() => onChange("amount", 0)}>
            Ajouter un paiement
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-4 flex flex-col h-full relative overflow-y-auto overflow-x-hidden">
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none"></div>

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-zsemibold text-primary">Paiement</h3>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-red-500 h-8 text-xs">
          Annuler
        </Button>
      </div>

      <div className="bg-secondary/5 p-4 rounded-lg border border-border/30 text-center mb-4">
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Net à Payer</p>
        <p className="text-3xl font-extrabold text-primary">{totalAmount} Ar</p>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-medium mb-1">Montant Payé <span className="text-red-500">*</span></label>
          <Input
            type="number"
            min="0"
            value={payment.amount === 0 ? "" : payment.amount}
            onChange={(e) => {
              const val = Number(e.target.value);
              onChange("amount", val < 0 ? 0 : val);
            }}
            className="text-lg font-bold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mode de Paiement <span className="text-red-500">*</span></label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background"
            value={payment.idPaymentMethod}
            onChange={(e) => onChange("idPaymentMethod", e.target.value)}
          >
            <option value="">Sélectionner...</option>
            {paymentMethods.map(method => (
              <option key={method.idPaymentMethod} value={method.idPaymentMethod}>{method.methodName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Code de Paiement (Optionnel)</label>
          <Input
            type="text"
            placeholder="Ex: Ref chèque, ticket, Mvola..."
            value={payment.paymentCode || ""}
            onChange={(e) => onChange("paymentCode", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date de Paiement</label>
          <Input 
            type="datetime-local"
            value={payment.paymentDate || ""}
            max={new Date().toISOString().slice(0, 16)}
            onChange={(e) => onChange("paymentDate", e.target.value)}
            onBlur={handleDateBlur}
          />
          {showDatePrompt && (
            <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
              <span className="text-blue-700 flex items-center">
                Date vide. Utiliser la date de vente ?
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={useSaleDate} className="bg-blue-500 hover:bg-blue-600 text-white h-7 flex-1">
                  <CalendarDays size={14} className="mr-1" /> Oui
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowDatePrompt(false)} className="h-7 flex-1">
                  Non
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border/30">
        {balanceDue < 0 ? (
          <div className="flex justify-between items-center bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
            <span className="text-sm font-bold text-emerald-700">Monnaie à rendre</span>
            <span className="text-xl font-extrabold text-emerald-600">
              {Math.abs(balanceDue).toLocaleString("fr-FR")} Ar
            </span>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Reste à payer</span>
            <span className={`text-xl font-bold ${balanceDue > 0 ? "text-orange-500" : "text-emerald-500"}`}>
              {balanceDue.toLocaleString("fr-FR")} Ar
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
