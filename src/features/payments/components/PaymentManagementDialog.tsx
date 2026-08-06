import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog/dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import type { PaymentMethodRef } from "../../sales/types";
import type { PaymentRecord } from "../types";
import { fetchSalesDependencies } from "../../sales/utils/saleFetchers";

import { Edit2, Check, X, AlertCircle, Lock, ArrowDownLeft } from "lucide-react";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";

interface Props {
  invoiceNumber?: string | null;
  payments: PaymentRecord[];
  isOpen: boolean;
  canManage: boolean;
  onAdjust: (idPayment: string, newAmount: number) => Promise<void>;
  onRefund: (amount: number, idPaymentMethod: string, reason?: string) => Promise<void>;
  onClose: () => void;
}

export const PaymentManagementDialog: React.FC<Props> = ({ invoiceNumber, payments, isOpen, canManage, onAdjust, onRefund, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRef[]>([]);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number | "">("");
  const [journalConfirm, setJournalConfirm] = useState<{ isOpen: boolean; payment: PaymentRecord | null }>({ isOpen: false, payment: null });

  // Refund form state
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number | "">("");
  const [refundMethodId, setRefundMethodId] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error"; isOpen: boolean }>({ message: "", type: "success", isOpen: false });

  useEffect(() => {
    if (isOpen) {
      setEditingPaymentId(null);
      setShowRefundForm(false);
      setRefundAmount("");
      setRefundMethodId("");
      setRefundReason("");
      fetchSalesDependencies().then(deps => setPaymentMethods(deps.paymentMethods));
    }
  }, [isOpen]);

  const showSnackbar = (message: string, type: "success" | "error") => {
    setSnackbar({ message, type, isOpen: true });
  };

  const handleStartEdit = (p: PaymentRecord) => {
    if (p.idCashMovement && Number(p.amount) > 0) {
      // Journalized positive payment — need confirmation if canManage
      setJournalConfirm({ isOpen: true, payment: p });
    } else {
      setEditingPaymentId(p.idPayment);
      setEditAmount(Math.abs(Number(p.amount)));
    }
  };

  const handleSaveEdit = async (payment: PaymentRecord, newAmountValue: number | "") => {
    const isRefundRow = Number(payment.amount) < 0;
    const absNewAmount = newAmountValue === "" ? 0 : newAmountValue;
    const newAmount = isRefundRow ? -absNewAmount : absNewAmount;
    
    if (newAmount === Number(payment.amount)) {
      setEditingPaymentId(null);
      return;
    }
    setLoading(true);
    try {
      await onAdjust(payment.idPayment, newAmount);
      showSnackbar("Paiement modifié avec succès.", "success");
      setEditingPaymentId(null);
    } catch (err: any) {
      showSnackbar(err.response?.data?.error || "Erreur lors de la modification.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    const amount = refundAmount === "" ? 0 : refundAmount;
    if (amount <= 0) {
      showSnackbar("Le montant du remboursement doit être positif.", "error");
      return;
    }
    if (!refundMethodId) {
      showSnackbar("Veuillez sélectionner un mode de paiement.", "error");
      return;
    }
    setLoading(true);
    try {
      await onRefund(Number(amount), refundMethodId, refundReason);
      showSnackbar("Remboursement effectué avec succès.", "success");
      setShowRefundForm(false);
      setRefundAmount("");
      setRefundMethodId("");
      setRefundReason("");
    } catch (err: any) {
      showSnackbar(err.response?.data?.error || "Erreur lors du remboursement.", "error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
        <DialogContent 
          className="max-w-2xl rounded-xl p-6 max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Modifier le paiement (Facture {invoiceNumber})</DialogTitle>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun paiement enregistré pour cette vente.</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-left">
                    <tr>
                      <th className="p-3 font-medium">Date</th>
                      <th className="p-3 font-medium">Mode</th>
                      <th className="p-3 font-medium text-right">Montant réel</th>
                      <th className="p-3 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.map(p => {
                      const isEditing = editingPaymentId === p.idPayment;
                      const isJournalized = !!p.idCashMovement;
                      const isSystemRefund = p.paymentCode?.includes("suite modification") || p.paymentCode?.includes("suite à l'annulation");
                      const isRefundRow = Number(p.amount) < 0;
                      const isModifying = isEditing && editAmount !== "" && Number(editAmount) !== Math.abs(Number(p.amount));
                      const isDeleting = isEditing && (editAmount === 0 || editAmount === "");
                      const isLocked = (isJournalized && !canManage) || isSystemRefund;

                      return (
                        <React.Fragment key={p.idPayment}>
                          <tr className={isLocked ? "opacity-50" : ""}>
                            <td className="p-3 whitespace-nowrap text-xs">
                              {new Date(p.paymentDate).toLocaleString("fr-FR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3">{p.paymentMethod?.methodName || "-"}</td>
                            <td className="p-3 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  className="w-24 p-1 border rounded text-right"
                                  value={editAmount}
                                  onChange={e => setEditAmount(e.target.value === "" ? "" : Number(e.target.value))}
                                  placeholder="0"
                                />
                              ) : isRefundRow ? (
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-orange-600 font-medium">
                                    {Math.abs(Number(p.amount)).toLocaleString("fr-FR")} Ar
                                  </span>
                                  <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full" title={p.cashMovement?.reason || p.paymentCode || "Remboursement"}>
                                    {p.cashMovement?.reason ? p.cashMovement.reason.split(" - ").pop() : (p.paymentCode || "Remboursement")}
                                  </span>
                                </div>
                              ) : (
                                <span>
                                  {Number(p.amount).toLocaleString("fr-FR")} Ar
                                  {isJournalized && <span className="ml-1 text-xs text-muted-foreground">(J)</span>}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {isEditing ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button disabled={loading} onClick={() => handleSaveEdit(p, editAmount)} className="p-1.5 text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 disabled:opacity-50">
                                    <Check size={16} />
                                  </button>
                                  <button disabled={loading} onClick={() => setEditingPaymentId(null)} className="p-1.5 text-zinc-600 bg-zinc-50 rounded hover:bg-zinc-100 disabled:opacity-50">
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : isLocked ? (
                                <div className="flex items-center justify-center" title="Ligne verrouillée (Générée par le système ou requiert une permission)">
                                  <Lock size={14} className={isSystemRefund ? "text-orange-400" : "text-zinc-400"} />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => handleStartEdit(p)} className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100" title="Modifier le montant">
                                    <Edit2 size={16} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                          {(isModifying || isDeleting) && (
                            <tr className="bg-orange-50/50">
                              <td colSpan={4} className="p-3 text-sm text-orange-800">
                                <div className="flex items-center gap-2">
                                  <AlertCircle size={16} className="text-orange-600 shrink-0" />
                                  <span>
                                    {isDeleting
                                      ? (isRefundRow ? "Ce remboursement sera supprimé." : "Ce paiement sera mis à 0 et supprimé" + (p.idCashMovement ? " (sortie de caisse générée)." : "."))
                                      : `Écart : ${Math.abs(Math.abs(Number(p.amount)) - (Number(editAmount) || 0)).toLocaleString("fr-FR")} Ar` + (isRefundRow ? " → Ajusté directement." : (p.idCashMovement ? " → Mouvement de caisse généré." : "."))}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Refund section — only for sale.manage */}
            {canManage && (
              <div className="border-t pt-4">
                {!showRefundForm ? (
                  <button
                    onClick={() => setShowRefundForm(true)}
                    className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    <ArrowDownLeft size={16} />
                    Rembourser le client
                  </button>
                ) : (
                  <div className="bg-orange-50/60 rounded-xl border border-orange-100 p-4 flex flex-col gap-3">
                    <p className="text-sm font-semibold text-orange-800">Remboursement client</p>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-muted-foreground">Montant à rembourser (Ar)</label>
                      <input
                        type="number"
                        className="p-2 border rounded text-left text-sm"
                        value={refundAmount}
                        onChange={e => setRefundAmount(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="0"
                        min={1}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-muted-foreground">Mode de paiement</label>
                      <select
                        className="p-2 border rounded text-sm bg-background"
                        value={refundMethodId}
                        onChange={e => setRefundMethodId(e.target.value)}
                      >
                        <option value="">-- Sélectionner --</option>
                        {paymentMethods.map(pm => (
                          <option key={pm.idPaymentMethod} value={pm.idPaymentMethod}>{pm.methodName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-muted-foreground">Raison du remboursement (optionnel)</label>
                      <input
                        type="text"
                        className="p-2 border rounded text-sm"
                        value={refundReason}
                        onChange={e => setRefundReason(e.target.value)}
                        placeholder="Ex: Erreur de saisie"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setShowRefundForm(false); setRefundAmount(""); setRefundMethodId(""); }} disabled={loading} className="px-3 py-1.5 text-sm rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50">
                        Annuler
                      </button>
                      <button onClick={handleRefund} disabled={loading || !refundAmount || !refundMethodId} className="px-3 py-1.5 text-sm rounded bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50">
                        {loading ? "..." : "Confirmer le remboursement"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation for journalized payment editing */}
      <ConfirmDialog
        open={journalConfirm.isOpen}
        onOpenChange={(open) => !open && setJournalConfirm({ isOpen: false, payment: null })}
        title="Paiement journalisé"
        description="Ce paiement est déjà journalisé en caisse. Souhaitez-vous quand même le modifier ? Un mouvement de caisse compensatoire sera créé."
        onConfirm={() => {
          if (journalConfirm.payment) {
            setEditingPaymentId(journalConfirm.payment.idPayment);
            setEditAmount(Number(journalConfirm.payment.amount));
            setJournalConfirm({ isOpen: false, payment: null });
          }
        }}
      />

      {snackbar.isOpen && (
        <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar({ ...snackbar, isOpen: false })} />
      )}
    </>
  );
};
