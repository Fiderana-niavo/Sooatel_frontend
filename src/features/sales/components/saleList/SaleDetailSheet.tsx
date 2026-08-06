import React, { useState } from "react";
import { useAppStore } from "@/store/app.store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/Sheet/sheet";
import { Button } from "@/components/ui/Button/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { PaymentManagementDialog } from "../../../payments/components/PaymentManagementDialog";
import { SaleStatusBadge, PaymentStatusBadge } from "./SaleStatusBadge";
import { Can } from "@/components/Can/Can";
import type { SaleRecord } from "../../types";
import { RotateCcw, Trash2, XCircle, Edit, Banknote, Lock } from "lucide-react";

interface SaleDetailSheetProps {
  sale: SaleRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (id: string) => void;
  onReopen: (id: string) => void;
  onClose: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (sale: SaleRecord) => void;
  onUpdate: () => void;
  onAdjustPayment: (idSale: string, idPayment: string, newAmount: number) => Promise<void>;
  onRefundPayment: (idSale: string, amount: number, idPaymentMethod: string, reason?: string) => Promise<void>;
  onPay?: (sale: SaleRecord) => void;
  loading?: boolean;
}

export const SaleDetailSheet: React.FC<SaleDetailSheetProps> = ({
  sale,
  open,
  onOpenChange,
  onCancel,
  onReopen,
  onClose,
  onDelete,
  onEdit,
  onUpdate,
  onAdjustPayment,
  onRefundPayment,
  onPay,
  loading = false
}) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", desc: "", onConfirm: () => { } });
  const [paymentManagementDialog, setPaymentManagementDialog] = useState<{ isOpen: boolean }>({ isOpen: false });

  if (!sale) return null;

  const calculatedTotal = sale.saleItems.reduce((sum, item) => {
    return sum + Number(item.quantity) * Number(item.menu?.salePrice ?? item.unitPrice);
  }, 0);

  const hasTotalMismatch = Math.abs(Number(sale.totalAmount) - calculatedTotal) > 0.01;

  const confirm = (title: string, desc: string, action: () => void) => {
    setConfirmDialog({ isOpen: true, title, desc, onConfirm: action });
  };

  const salerName = sale.saler
    ? `${sale.saler.name} ${sale.saler.lastname}`
    : "—";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
          <SheetHeader className="p-6 border-b border-border/50 sticky top-0 bg-background z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SheetTitle className="text-xl font-bold">
                  Vente #{(sale.invoice?.invoiceNumber ?? "")}
                </SheetTitle>
                <SheetDescription className="mt-1 flex items-center gap-2">
                  <SaleStatusBadge status={sale.status} />
                  <PaymentStatusBadge status={sale.invoice?.status} totalAmount={sale.totalAmount} balanceDue={(sale.invoice?.balanceDue ?? sale.totalAmount)} />
                  <span className="text-muted-foreground text-xs">Réf: {sale.ref}</span>
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Date</p>
                <p className="font-medium">{new Date(sale.saleDate).toLocaleDateString("fr-FR")}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Vendeur</p>
                <p className="font-medium">{salerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">
                  {sale.chargeToRoom ? "Chambre" : "Table"}
                </p>
                <p className="font-medium">
                  {sale.chargeToRoom
                    ? (sale.room?.roomNumber ?? "—")
                    : (sale.tableNumber ?? "—")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Reste à payer</p>
                <p className="font-medium">{Number((sale.invoice?.balanceDue ?? sale.totalAmount)).toLocaleString("fr-FR")} Ar</p>
              </div>
            </div>

            {(sale.comment || sale.deliveryDate) && (
              <div className="p-4 rounded-xl border border-border/50 bg-secondary/5 space-y-3">
                {sale.deliveryDate && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Livraison prévue le</p>
                    <p className="font-medium text-primary">
                      {new Date(sale.deliveryDate).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
                    </p>
                  </div>
                )}
                {sale.comment && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Commentaire additionnel</p>
                    <p className="font-medium text-sm whitespace-pre-wrap">{sale.comment}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold mb-3 text-primary">Plats commandés</h4>
              <div className="space-y-2">
                {sale.saleItems.map((item) => (
                  <div key={item.idSaleItem} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg text-sm">
                    <div>
                      <p className="font-medium">{item.menu?.item?.label ?? `Menu #${item.idMenu.slice(0, 8)}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {Number(item.unitPrice).toLocaleString("fr-FR")} Ar
                      </p>
                    </div>
                    <p className="font-semibold">{Number(item.totalAmount).toLocaleString("fr-FR")} Ar</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total calculé</span>
                <span className="font-medium">{calculatedTotal.toLocaleString("fr-FR")} Ar</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total enregistré</span>
                <span className={`font-semibold ${hasTotalMismatch ? "text-orange-500" : ""}`}>
                  {Number(sale.totalAmount).toLocaleString("fr-FR")} Ar
                </span>
              </div>
              {hasTotalMismatch && (
                <p className="text-xs text-orange-500 bg-orange-500/10 px-3 py-2 rounded-lg">
                  ⚠ Le total enregistré ne correspond pas au total calculé.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Can permission="sales.pos">
                {sale.status === 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(sale)}
                    className="flex items-center gap-2"
                  >
                    <Edit size={14} /> Modifier
                  </Button>
                )}
              </Can>

              <Can permission="sale.manage">
                {sale.status === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => confirm(
                      "Rouvrir la vente",
                      "Voulez-vous rouvrir cette vente ? Elle repassera au statut Ouverte.",
                      () => { setConfirmDialog(p => ({ ...p, isOpen: false })); onReopen(sale.idSale); }
                    )}
                    className="flex items-center gap-2 border-blue-500/40 text-blue-600 hover:bg-blue-500/10"
                  >
                    <RotateCcw size={14} /> Rouvrir
                  </Button>
                )}
                {sale.status === 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => confirm(
                      "Fermer la vente",
                      "Voulez-vous fermer manuellement cette vente ?",
                      () => { setConfirmDialog(p => ({ ...p, isOpen: false })); onClose(sale.idSale); }
                    )}
                    className="flex items-center gap-2 border-zinc-500/40 text-zinc-600 hover:bg-zinc-500/10"
                  >
                    <Lock size={14} /> Fermer
                  </Button>
                )}
                {sale.status !== -3 && onPay && ((sale.invoice?.balanceDue ?? sale.totalAmount) != null ? Number((sale.invoice?.balanceDue ?? sale.totalAmount)) : Number(sale.totalAmount)) > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    disabled={loading}
                    onClick={() => { setConfirmDialog(p => ({ ...p, isOpen: false })); onPay(sale); }}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Banknote size={14} /> Payer
                  </Button>
                )}
                {sale.status !== -3 && sale.invoice?.payments && sale.invoice.payments.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => setPaymentManagementDialog({ isOpen: true })}
                    className="flex items-center gap-2 border-indigo-500/40 text-indigo-600 hover:bg-indigo-500/10"
                  >
                    <Banknote size={14} /> Modifier le paiement
                  </Button>
                )}
                {sale.status !== -3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => confirm(
                      "Annuler la vente",
                      "Voulez-vous annuler cette vente ? Cette action sera enregistrée dans les logs.",
                      () => { setConfirmDialog(p => ({ ...p, isOpen: false })); onCancel(sale.idSale); }
                    )}
                    className="flex items-center gap-2 border-orange-500/40 text-orange-600 hover:bg-orange-500/10"
                  >
                    <XCircle size={14} /> Annuler la vente
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => confirm(
                    "Supprimer la vente",
                    "Cette action est irréversible. La vente sera définitivement supprimée mais tracée dans les logs.",
                    () => { setConfirmDialog(p => ({ ...p, isOpen: false })); onDelete(sale.idSale); }
                  )}
                  className="flex items-center gap-2 border-red-500/40 text-red-600 hover:bg-red-500/10"
                >
                  <Trash2 size={14} /> Supprimer
                </Button>
              </Can>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
        title={confirmDialog.title}
        description={confirmDialog.desc}
        onConfirm={confirmDialog.onConfirm}
        loading={loading}
      />
      {sale && (
        <PaymentManagementDialog
          invoiceNumber={sale.invoice?.invoiceNumber}
          payments={sale.invoice?.payments || []}
          isOpen={paymentManagementDialog.isOpen}
          canManage={useAppStore.getState().hasPermission('sale.manage')}
          onAdjust={(idPayment, newAmount) => onAdjustPayment(sale.idSale, idPayment, newAmount).then(onUpdate)}
          onRefund={(amount, idPaymentMethod) => onRefundPayment(sale.idSale, amount, idPaymentMethod).then(onUpdate)}
          onClose={() => setPaymentManagementDialog({ isOpen: false })}
        />
      )}
    </>
  );
};
