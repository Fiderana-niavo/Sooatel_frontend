import { toIsoDate } from "@/utils/date";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePaymentAllocations } from "../../hooks/usePaymentAllocations";
import { supplierPaymentService } from "../../services/supplier-payment.service";
import type { AllocationDto } from "../../types/supplier-payment.type";
import { purchaseService } from "../../services/purchase.service";
import { formatCurrency } from "@/utils/formatters";
import { AlertCircle, Loader2, ArrowRight, Wand2, Coins } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { CurrencyInput } from "@/components/ui/Inputs/CurrencyInput";

interface Props {
  idSupplier: string;
  initialAllocation?: AllocationDto;
  idPaymentToEdit?: string | null;
  onSuccess: () => void;
  onGoToDeliveries?: () => void;
  onCancel: () => void;
}

interface PaymentMethodRef {
  value: string;
  label: string;
}

export function SupplierPaymentForm({ idSupplier, initialAllocation, idPaymentToEdit, onSuccess, onCancel, onGoToDeliveries }: Props) {
  const queryClient = useQueryClient();

  const [idPaymentMethod, setIdPaymentMethod] = useState("");
  const [paymentDate, setPaymentDate] = useState(toIsoDate(new Date()));
  const [notes, setNotes] = useState("");
  const [isCreditAppliedLocally, setIsCreditAppliedLocally] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState<string | number>("");
  const [isEditLoaded, setIsEditLoaded] = useState(!idPaymentToEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedStr = sessionStorage.getItem("supplierPaymentSavedState");
    if (savedStr) {
      try {
        const saved = JSON.parse(savedStr);
        if (saved.idSupplier === idSupplier) {
          if (saved.amount) setAmount(saved.amount);
          if (saved.idPaymentMethod) setIdPaymentMethod(saved.idPaymentMethod);
          if (saved.paymentDate) setPaymentDate(saved.paymentDate);
          if (saved.notes) setNotes(saved.notes);
          if (saved.isCreditAppliedLocally) setIsCreditAppliedLocally(saved.isCreditAppliedLocally);
        }
      } catch (e) {}
      sessionStorage.removeItem("supplierPaymentSavedState");
    }
  }, [idSupplier]);

  const pmQuery = useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const res = await purchaseService.getPaymentMethods();
      return (res ?? []) as PaymentMethodRef[];
    },
  });

  const destQuery = useQuery({
    queryKey: ["payment-destinations", idSupplier],
    queryFn: async () => {
      if (!idSupplier) return null;
      const res = await supplierPaymentService.getAvailableDestinations(idSupplier);
      return res.data.payload;
    },
    enabled: !!idSupplier,
  });

  const destinations = destQuery.data;
  const paymentMethods = pmQuery.data ?? [];

  const balanceQuery = useQuery({
    queryKey: ["supplierBalance", idSupplier],
    queryFn: async () => {
      const res = await supplierPaymentService.getSupplierBalance(idSupplier);
      return res.data.payload;
    },
    enabled: !!idSupplier,
  });
  const balanceData = balanceQuery.data;

  const editQuery = useQuery({
    queryKey: ["supplier-payment", idPaymentToEdit],
    queryFn: async () => {
      if (!idPaymentToEdit) return null;
      const res = await supplierPaymentService.getPaymentById(idPaymentToEdit);
      return res.data.payload;
    },
    enabled: !!idPaymentToEdit,
  });

  const {
    allocations,
    setAllocations,
    totalAllocated,
    remaining,
  } = usePaymentAllocations({ initialAllocation, amount, setAmount, destinations });

  useEffect(() => {
    if (editQuery.data && !isEditLoaded) {
      const p = editQuery.data;
      setAmount(p.amount);
      setIdPaymentMethod(p.idPaymentMethod || "");
      if (p.paymentDate) setPaymentDate(toIsoDate(new Date(p.paymentDate)));
      setNotes(p.notes || "");
      if (p.allocations) {
        setAllocations(p.allocations.map((a: any) => ({ ...a, amount: Number(a.amount) })));
      }
      setIsEditLoaded(true);
    }
  }, [editQuery.data, isEditLoaded, setAllocations]);

  const handleApplyCredit = () => {
    if (!destQuery.data || destQuery.data.deliveries.length === 0) {
      setError("Pas de dette à payer pour le moment.");
      return;
    }
    setIsCreditAppliedLocally(true);
  };

  const handleSubmit = async () => {
    setError(null);
    const hasPaymentAmount = Number(amount) > 0;

    if (!hasPaymentAmount && !isCreditAppliedLocally) {
      setError("Veuillez saisir un montant ou utiliser un crédit.");
      return;
    }

    if (hasPaymentAmount) {
      if (!idPaymentMethod) { setError("Veuillez sélectionner un mode de paiement."); return; }
      if (allocations.length === 0) { setError("Veuillez ajouter au moins une allocation."); return; }
      if (Math.abs(remaining) > 0.01) {
        setError(`Le montant alloué (${formatCurrency(totalAllocated)}) ne correspond pas au montant du paiement (${formatCurrency(Number(amount))}). Reste : ${formatCurrency(remaining)}.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isCreditAppliedLocally) {
        await supplierPaymentService.applySupplierCredit(idSupplier, {});
      }

      if (hasPaymentAmount) {
        const dto = {
          idSupplier,
          amount: Number(amount),
          idPaymentMethod,
          paymentDate,
          notes: notes || undefined,
          allocations: allocations.map((a) => ({ ...a, amount: Number(a.amount) })),
        };
        if (idPaymentToEdit) {
          await supplierPaymentService.updatePayment(idPaymentToEdit, dto);
        } else {
          await supplierPaymentService.createPayment(dto);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["payment-destinations", idSupplier] });
      queryClient.invalidateQueries({ queryKey: ["supplierBalance", idSupplier] });
      queryClient.invalidateQueries({ queryKey: ["supplier-payments"] });

      onSuccess();
    } catch (err: any) {
      const apiMsg = err.response?.data?.message;
      const apiErr = err.response?.data?.error;
      setError(
        (apiMsg && apiMsg !== "Request failed" ? apiMsg : null) ||
        (apiErr && apiErr !== "Request failed" ? apiErr : null) ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        err.message ||
        "Erreur lors de l'enregistrement."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryAllocations = allocations.filter((a) => a.allocationType === "DELIVERY");
  const creditAllocation = allocations.find((a) => a.allocationType === "SUPPLIER_CREDIT");

  return (
    <div className="space-y-5 py-2">
      {idPaymentToEdit && editQuery.isLoading && (
        <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      )}
      {isEditLoaded && (
        <>
          {/* Delivery-specific banner when coming from a delivery */}
          {initialAllocation?.idDelivery && (() => {
            const principalDelivery = destinations?.deliveries?.find(
              (d: any) => d.idDelivery === initialAllocation.idDelivery
            );
            const balanceDue = principalDelivery?.balanceDue ?? initialAllocation.amount;
            const ref = principalDelivery?.ref ?? "cette livraison";
            return (
              <div className="rounded-lg p-3 text-sm border bg-primary/5 border-primary/20 text-foreground">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{ref}</span>
                  {principalDelivery?.deliveryDate && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(principalDelivery.deliveryDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Reste à payer pour cette livraison</span>
                  <span className="font-bold text-amber-600 text-base">{formatCurrency(balanceDue)}</span>
                </div>
              </div>
            );
          })()}

          {/* Credit / Debt info banners */}
          {balanceData && (balanceData.debit > 0 || balanceData.credit > 0) && (
            <div className="flex flex-col gap-2">
              {balanceData.debit > 0 && (
                <div className="rounded-md px-2.5 py-1.5 text-xs border flex items-center justify-between bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" />
                    <span>Dette totale fournisseur</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(balanceData.debit)}</span>
                </div>
              )}
              {balanceData.credit > 0 && (
                <div className="rounded-lg p-3 text-sm border flex items-center justify-between bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    <span>
                      {isCreditAppliedLocally
                        ? <>Crédit appliqué : <strong>{formatCurrency(balanceData.credit)}</strong></>
                        : <>Crédit disponible : <strong>{formatCurrency(balanceData.credit)}</strong></>}
                    </span>
                  </div>
                  {!idPaymentToEdit && !isCreditAppliedLocally && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleApplyCredit}
                      className="h-7 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300 dark:bg-emerald-800 dark:text-emerald-100 dark:border-emerald-700"
                    >
                      <Wand2 className="h-3 w-3 mr-1" />
                      Utiliser
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Unvalidated deliveries warning */}
          {destinations?.unvalidatedDeliveriesCount && destinations.unvalidatedDeliveriesCount > 0 ? (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p><strong>{destinations.unvalidatedDeliveriesCount} livraison(s)</strong> en attente de validation non incluses.</p>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("activeTab", "Livraisons Fournisseurs");
                    sessionStorage.setItem("deliveryFilter", JSON.stringify({ status: 5, openSupplierPaymentFor: idSupplier }));
                    sessionStorage.setItem("supplierPaymentSavedState", JSON.stringify({
                      idSupplier, amount, idPaymentMethod, paymentDate, notes, isCreditAppliedLocally
                    }));
                    if (onGoToDeliveries) {
                      onGoToDeliveries();
                    } else {
                      window.location.reload();
                    }
                  }}
                  className="mt-1 inline-flex items-center gap-1 font-medium underline hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer"
                >
                  Voir les livraisons non validées
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : null}

          {/* Amount + payment method + date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <label className="text-sm font-semibold text-foreground">Montant total (Ar)</label>
              <CurrencyInput
                value={amount === "" ? undefined : (amount as number)}
                onChange={(val) => setAmount(val === undefined ? "" : val)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Mode de paiement</label>
              <select
                value={idPaymentMethod}
                onChange={(e) => setIdPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Sélectionner --</option>
                {paymentMethods.map((pm) => (
                  <option key={pm.value} value={pm.value}>{pm.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-sm font-medium">Notes (Optionnel)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Ex: Virement bancaire, numéro de chèque, etc."
              />
            </div>
          </div>

          {/* Auto-dispatch recap — only shown when amount > 0 and allocations exist */}
          {Number(amount) > 0 && allocations.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
              <div className="px-3 py-2 border-b border-border/60 bg-muted/40">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Répartition automatique</span>
              </div>
              <div className="divide-y divide-border/40">
                {destQuery.isLoading ? (
                  <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                ) : (
                  <>
                    {deliveryAllocations.map((a, i) => {
                      const delivery = destinations?.deliveries?.find((d: any) => d.idDelivery === a.idDelivery);
                      const isPrincipal = initialAllocation?.idDelivery === a.idDelivery;
                      return (
                        <div key={i} className={`flex items-center justify-between px-3 py-2 text-sm ${isPrincipal ? "bg-primary/5" : ""}`}>
                          <div>
                            <span className={isPrincipal ? "font-bold" : "font-medium"}>
                              {delivery?.ref ?? "Livraison"}
                            </span>
                            {delivery?.purchaseRef && (
                              <span className="text-xs text-muted-foreground ml-2">(Cmd {delivery.purchaseRef})</span>
                            )}
                            {delivery?.deliveryDate && (
                              <span className="text-xs text-muted-foreground ml-2">
                                {new Date(delivery.deliveryDate).toLocaleDateString()}
                              </span>
                            )}
                            {delivery && (
                              <span className="text-xs text-muted-foreground ml-2">
                                — solde : {formatCurrency(delivery.balanceDue)}
                              </span>
                            )}
                          </div>
                          <span className="font-semibold text-primary">{formatCurrency(a.amount)}</span>
                        </div>
                      );
                    })}
                    {creditAllocation && (
                      <div className="flex items-center justify-between px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                        <span className="font-medium">Crédit fournisseur</span>
                        <span className="font-semibold">{formatCurrency(creditAllocation.amount)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex justify-between px-3 py-2 border-t border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground">
                <span>Total réparti</span>
                <span className={Math.abs(remaining) > 0.01 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}>
                  {formatCurrency(totalAllocated)} / {formatCurrency(Number(amount))}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="button" className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {idPaymentToEdit ? "Enregistrer" : "Confirmer"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
