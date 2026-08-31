import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { supplierPaymentService } from "../../services/supplier-payment.service";
import type { DeliveryPaymentSummary } from "../../types/supplier-payment.type";
import { SupplierPaymentForm } from "./SupplierPaymentForm";
import { formatCurrency } from "@/utils/formatters";
import { CheckCircle2, Loader2, ExternalLink, Edit2 } from "lucide-react";

interface Props {
  idDelivery: string | null;
  onClose: () => void;
}

function PaymentStatusBadge({ status }: { status: DeliveryPaymentSummary["paymentStatus"] }) {
  const map: Record<string, { label: string; cls: string }> = {
    UNPAID: { label: "Impayé", cls: "bg-red-100 text-red-800 border-red-200" },
    PARTIAL: { label: "Partiel", cls: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    PAID: { label: "Payé", cls: "bg-green-100 text-green-800 border-green-200" },
  };
  const cfg = map[status];
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export function DeliveryPaymentDialog({ idDelivery, onClose }: Props) {
  const queryClient = useQueryClient();
  const [showFullForm, setShowFullForm] = useState(false);
  const [idPaymentToEdit, setIdPaymentToEdit] = useState<string | null>(null);

  const summaryQuery = useQuery({
    queryKey: ["delivery-payment-summary", idDelivery],
    queryFn: async () => {
      const res = await supplierPaymentService.getDeliverySummary(idDelivery!);
      return res.data.payload as DeliveryPaymentSummary;
    },
    enabled: !!idDelivery,
  });

  const summary = summaryQuery.data;

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    queryClient.invalidateQueries({ queryKey: ["delivery-payment-summary", idDelivery] });
    onClose();
  };

  if (!idDelivery) return null;

  if (showFullForm && summary) {
    return (
      <ConfirmDialog
        open
        title="Paiement fournisseur"
        onOpenChange={(open) => { if (!open) onClose(); }}
        onConfirm={() => {}}
        hideConfirmButton
        cancelText="Fermer"
      >
        <SupplierPaymentForm
          idSupplier={summary.idSupplier}
          idPaymentToEdit={idPaymentToEdit}
          initialAllocation={{
            allocationType: "DELIVERY",
            idDelivery: idDelivery,
            amount: summary.balanceDue,
          }}
          onSuccess={handleSuccess}
          onCancel={() => setShowFullForm(false)}
        />
      </ConfirmDialog>
    );
  }

  return (
    <ConfirmDialog
      open={!!idDelivery}
      title="Paiement de la livraison"
      onOpenChange={(open) => { if (!open) onClose(); }}
      onConfirm={() => setShowFullForm(true)}
      loading={summaryQuery.isLoading}
      confirmText="Payer cette livraison"
      cancelText="Fermer"
    >
      {summaryQuery.isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : summary ? (
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut</span>
              <PaymentStatusBadge status={summary.paymentStatus} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total livraison</span>
              <span className="font-medium">{formatCurrency(summary.totalAmount)}</span>
            </div>
            {summary.totalPaid > 0 && (
              <div className="flex justify-between text-green-700 dark:text-green-400">
                <span>Déjà payé</span>
                <span>- {formatCurrency(summary.totalPaid)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t border-border pt-2">
              <span>Reste à payer</span>
              <span className={summary.balanceDue <= 0 ? "text-green-600" : "text-foreground"}>
                {formatCurrency(Math.max(0, summary.balanceDue))}
              </span>
            </div>
          </div>

          {summary.payments && summary.payments.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h4 className="text-sm font-semibold">Historique des paiements</h4>
              <div className="space-y-2">
                {summary.payments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-medium flex items-center gap-1.5 flex-wrap">
                        {p.ref}
                        </span>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {new Date(p.date).toLocaleDateString()} - {p.method}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-green-700 dark:text-green-400">
                        {formatCurrency(p.amount)}
                      </span>
                      <button
                        title="Modifier ce paiement"
                        onClick={() => { setIdPaymentToEdit(p.idPayment); setShowFullForm(true); }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.paymentStatus === "PAID" ? (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-3 text-sm text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Cette livraison est entièrement payée.
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Cliquez sur <strong>"Payer cette livraison"</strong> pour continuer.
              <button
                onClick={() => setShowFullForm(true)}
                className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Payer plusieurs destinations à la fois
              </button>
            </p>
          )}
        </div>
      ) : null}
    </ConfirmDialog>
  );
}

