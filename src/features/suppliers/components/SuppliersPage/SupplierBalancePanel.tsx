import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierPaymentService } from "../../../purchases/services/supplier-payment.service";
import { formatCurrency } from "@/utils/formatters";
import { Wallet, ChevronDown, ChevronUp, CreditCard, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
interface Props {
  idSupplier: string;
}

interface BalanceRow {
  credit: number;
  debit: number;
  balance: number;
}


export function SupplierBalancePanel({ idSupplier }: Props) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [affectDialog, setAffectDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<string>("");
  const [affectAmount, setAffectAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const balanceQuery = useQuery({
    queryKey: ["supplierBalance", idSupplier],
    queryFn: async () => {
      const res = await supplierPaymentService.getSupplierBalance(idSupplier);
      return res.data.payload as BalanceRow;
    },
    enabled: !!idSupplier
  });

  const deliveriesQuery = useQuery({
    queryKey: ["payment-destinations", idSupplier],
    queryFn: async () => {
      const res = await supplierPaymentService.getAvailableDestinations(idSupplier);
      return res.data.payload.deliveries; // it returns { deliveries, purchases }
    },
    enabled: affectDialog
  });

  const applyCredit = useMutation({
    mutationFn: () =>
      supplierPaymentService.applySupplierCredit(idSupplier, {
        idDelivery: selectedDelivery || undefined,
        amount: affectAmount ? Number(affectAmount) : undefined
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierBalance", idSupplier] });
      queryClient.invalidateQueries({ queryKey: ["payment-destinations", idSupplier] });
      setAffectDialog(false);
      setSelectedDelivery("");
      setAffectAmount("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? "Erreur lors de l affectation.");
    }
  });

  const row = balanceQuery.data;
  const balance = row?.balance ?? 0;

  const handleAffect = () => {
    setError(null);
    if (affectAmount && Number(affectAmount) <= 0) { setError("Montant invalide."); return; }
    if (affectAmount && Number(affectAmount) > balance) { setError(`Credit insuffisant (${formatCurrency(balance)}).`); return; }
    applyCredit.mutate();
  };

  return (
    <div className="rounded-lg border border-border bg-card mt-4">
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-amber-500" />
          <span>Solde fournisseur</span>
          {balance > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              {formatCurrency(balance)} disponible
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 space-y-3">
          {balanceQuery.isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Credit / Debit summary */}
              <div className="grid grid-cols-3 gap-3 pt-3">
                <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700 p-3 text-center">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Credit</p>
                  <p className="text-base font-bold text-green-700 dark:text-green-300">{formatCurrency(row?.credit ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700 p-3 text-center">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Debit</p>
                  <p className="text-base font-bold text-red-700 dark:text-red-300">{formatCurrency(row?.debit ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-3 text-center">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Solde net</p>
                  <p className={`text-base font-bold ${balance > 0 ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground"}`}>{formatCurrency(balance)}</p>
                </div>
              </div>

              {balance > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setAffectDialog(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Affecter a une livraison
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={affectDialog}
        title="Affecter credit a une livraison"
        onOpenChange={(open) => { if (!open) setAffectDialog(false); }}
        onConfirm={handleAffect}
        loading={applyCredit.isPending}
        confirmText="Affecter"
        cancelText="Annuler"
      >
        <div className="space-y-4 py-2 text-sm">
          {error && (
            <div className="text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs">{error}</div>
          )}
          <div className="space-y-1.5">
            <label className="font-medium">Livraison impayee</label>
            <select
              value={selectedDelivery}
              onChange={(e) => setSelectedDelivery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Auto-répartir sur toutes les dettes --</option>
              {deliveriesQuery.data?.map((d: any) => (
                <option key={d.idDelivery} value={d.idDelivery}>
                  {d.ref} — Reste : {formatCurrency(d.balanceDue)}
                </option>
              ))}
            </select>
            {deliveriesQuery.data?.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucune livraison impayee pour ce fournisseur.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="font-medium">Montant a affecter (Ar)</label>
            <input
              type="number"
              min={0}
              value={affectAmount}
              onChange={(e) => setAffectAmount(e.target.value)}
              placeholder={`Max : ${formatCurrency(balance)}`}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}