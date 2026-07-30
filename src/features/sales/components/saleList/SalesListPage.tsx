import React, { useState, useEffect, useCallback } from "react";
import { SaleService } from "../../services/sale.service";
import { PaymentService } from "../../../payments/services/payment.service";
import { calcTotal } from "../../utils/saleMappers";
import { fetchSalesListDependencies } from "../../utils/saleFetchers";
import { SaleDetailSheet } from "./SaleDetailSheet";
import { SaleStatusBadge, PaymentStatusBadge } from "./SaleStatusBadge";
import { ActionDropdown } from "@/components/ui/ActionDropdown/ActionDropdown";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import Pagination from "@/components/ui/Pagination/pagination";
import type { SaleRecord } from "../../types";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { AlertTriangle, Loader2, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import { Input } from "@/components/ui/Inputs/input";
import { InputDialog } from "@/components/ui/InputDialog/InputDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog/dialog";





interface SalesListPageProps {
  onEditSale?: (sale: SaleRecord) => void;
}

export const SalesListPage: React.FC<SalesListPageProps> = ({ onEditSale }) => {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");
  const [menuFilter, setMenuFilter] = useState<string | number>("");
  const [menuOptions, setMenuOptions] = useState<{ value: string; label: string }[]>([{ value: "", label: "Tous les produits" }]);
  const [paymentMethods, setPaymentMethods] = useState<{ idPaymentMethod: string; methodName: string }[]>([]);
  const [payModal, setPayModal] = useState<{ isOpen: boolean; saleId: string; balanceDue: number; methodId: string; paymentCode: string; amount: string; paymentDate: string; isPartial: boolean; saleDate: string }>({ isOpen: false, saleId: "", balanceDue: 0, methodId: "", paymentCode: "", amount: "", paymentDate: new Date().toISOString().slice(0, 16), isPartial: false, saleDate: "" });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ isOpen: boolean; message: string; type: SnackbarType }>({
    isOpen: false, message: "", type: "info"
  });
  const [reopenDialog, setReopenDialog] = useState<{ isOpen: boolean; saleId: string }>({ isOpen: false, saleId: "" });
  const [showCancelled, setShowCancelled] = useState(false);
  const [cancelOverpaymentDialog, setCancelOverpaymentDialog] = useState<{ isOpen: boolean; saleId: string; totalPaid: number }>({ isOpen: false, saleId: "", totalPaid: 0 });

  const showSnackbar = (message: string, type: SnackbarType = "info") =>
    setSnackbar({ isOpen: true, message, type });

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (dateFilter) filters.date = dateFilter;
      if (paymentStatusFilter) filters.paymentStatus = paymentStatusFilter as any;
      if (menuFilter && menuFilter !== "") filters.idMenu = String(menuFilter);
      filters.status = showCancelled ? [-3] : [0, 5];

      const result = await SaleService.getAllSales(page, 10, filters);
      setSales(result.records);
      setTotalPages(result.totalPages);
    } catch {
      showSnackbar("Erreur lors du chargement des ventes.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, dateFilter, paymentStatusFilter, menuFilter, showCancelled]);

  const loadDependencies = useCallback(async () => {
    const deps = await fetchSalesListDependencies();
    setPaymentMethods(deps.paymentMethods);
    setMenuOptions(deps.menuOptions);
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    loadDependencies();
  }, [loadDependencies]);

  const resolveError = (err: any, fallback: string): string => {
    if (err.response?.status === 403) return "Vous n'avez pas la permission pour cette action.";
    return err.response?.data?.error || err.response?.data?.message || err.message || fallback;
  };

  const handleCancel = async (id: string, overpaymentAction?: "REFUND" | "ADJUST") => {
    if (!overpaymentAction) {
      if (selectedSale?.idSale === id && selectedSale.invoice) {
        const totalPaid = Number(selectedSale.invoice.totalAmount) - Number(selectedSale.invoice.balanceDue);
        if (totalPaid > 0) {
          setCancelOverpaymentDialog({ isOpen: true, saleId: id, totalPaid });
          return;
        }
      }
    }

    setActionLoading(true);
    try {
      await SaleService.cancelSale(id, overpaymentAction);
      showSnackbar("Vente annulée avec succès.", "success");
      setSheetOpen(false);
      fetchSales();
    } catch (err: any) {
      showSnackbar(resolveError(err, "Erreur lors de l'annulation."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async (id: string) => {
    setReopenDialog({ isOpen: true, saleId: id });
  };

  const handleReopenConfirm = async (reason: string) => {
    const saleIdToReopen = reopenDialog.saleId;
    setReopenDialog({ isOpen: false, saleId: "" });
    setActionLoading(true);
    try {
      await SaleService.reopenSale(saleIdToReopen, reason);
      showSnackbar("Vente rouverte avec succès.", "success");
      setSheetOpen(false);
      fetchSales();
      if (onEditSale) {
        const fullSale = await SaleService.getSaleById(saleIdToReopen);
        if (fullSale) onEditSale(fullSale);
      }
    } catch (err: any) {
      showSnackbar(resolveError(err, "Erreur lors de la réouverture."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async (id: string) => {
    setActionLoading(true);
    try {
      await SaleService.closeSale(id);
      showSnackbar("Vente fermée avec succès.", "success");
      setSheetOpen(false);
      fetchSales();
    } catch (err: any) {
      showSnackbar(resolveError(err, "Erreur lors de la fermeture."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      await SaleService.deleteSale(id);
      showSnackbar("Vente supprimée.", "success");
      setSheetOpen(false);
      fetchSales();
    } catch (err: any) {
      showSnackbar(resolveError(err, "Erreur lors de la suppression."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (sale: SaleRecord) => {
    if (onEditSale) {
      onEditSale(sale);
    }
  };

  const handleOpenPayModal = (sale: SaleRecord) => {
    if (!sale.invoice || !sale.invoice.idInvoice) {
      showSnackbar("Cette vente n'a pas de facture associée (ancienne vente). Veuillez contacter l'administrateur.", "error");
      return;
    }
    const balanceDue = (sale.invoice.balanceDue ?? sale.totalAmount) != null ? Number((sale.invoice.balanceDue ?? sale.totalAmount)) : Number(sale.totalAmount);
    setPayModal({
      isOpen: true,
      saleId: sale.invoice.idInvoice,
      balanceDue,
      methodId: paymentMethods[0]?.idPaymentMethod || "",
      paymentCode: "",
      amount: String(balanceDue),
      paymentDate: new Date().toISOString().split('T')[0],
      isPartial: false,
      saleDate: sale.saleDate ? new Date(sale.saleDate).toISOString().slice(0, 16) : ""
    });
  };

  const handlePay = async () => {
    if (!payModal.methodId) {
      showSnackbar("Veuillez sélectionner un mode de paiement.", "error");
      return;
    }
    setActionLoading(true);
    try {
      await PaymentService.addPayment(payModal.saleId, {
        amount: payModal.isPartial && payModal.amount ? Number(payModal.amount) : payModal.balanceDue,
        idPaymentMethod: payModal.methodId,
        paymentDate: payModal.paymentDate,
        paymentCode: payModal.paymentCode || undefined
      });
      showSnackbar("Paiement enregistré avec succès.", "success");
      setPayModal({ isOpen: false, saleId: "", balanceDue: 0, methodId: "", paymentCode: "", amount: "", paymentDate: new Date().toISOString().slice(0, 16), isPartial: false, saleDate: "" });
      setSheetOpen(false);
      fetchSales();
    } catch (err: any) {
      showSnackbar(resolveError(err, "Erreur lors du paiement."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{showCancelled ? "Ventes annulées" : "Historique des ventes"}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{showCancelled ? "Consultez les ventes qui ont été annulées." : "Consultez et gérez toutes les ventes enregistrées."}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <Button
            variant={showCancelled ? "default" : "outline"}
            onClick={() => {
              setShowCancelled(!showCancelled);
              setPage(1);
            }}
            className="flex items-center gap-2"
          >
            <AlertTriangle size={16} />
            {showCancelled ? "Retour à l'historique" : "Ventes annulées"}
          </Button>

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-[160px]"
          />
          <div className="w-full sm:w-[220px]">
            <SearchableSelect
              options={menuOptions}
              value={menuFilter}
              onChange={(val) => { setMenuFilter(val); setPage(1); }}
              placeholder="Filtrer par produit..."
            />
          </div>
          <select
            className="w-full sm:w-[160px] flex h-10 items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={paymentStatusFilter}
            onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">Tous statuts paiement</option>
            <option value="PAID">Payé</option>
            <option value="UNPAID">Non payé</option>
            <option value="PARTIAL">Partiel</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="animate-spin size-8" />
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card shadow-sm">
          <div className="w-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border/50">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">N° Facture</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Vendeur</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Statut</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Paiement</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      Aucune vente enregistrée.
                    </td>
                  </tr>
                )}
                {sales.map((sale) => {
                  const computed = calcTotal(sale);
                  const mismatch = Math.abs(Number(sale.totalAmount) - computed) > 0.01;
                  const salerName = sale.saler
                    ? `${sale.saler.name} ${sale.saler.lastname}`
                    : "—";

                  return (
                    <tr
                      key={sale.idSale}
                      onClick={() => { setSelectedSale(sale); setSheetOpen(true); }}
                      className="hover:bg-muted/20 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(sale.saleDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium">{(sale.invoice?.invoiceNumber ?? "")}</td>
                      <td className="px-4 py-3">{salerName}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={mismatch ? "text-orange-500 font-semibold inline-flex items-center gap-1" : "font-semibold"}>
                          {mismatch && <AlertTriangle size={12} />}
                          {Number(sale.totalAmount).toLocaleString("fr-FR")} Ar
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <SaleStatusBadge status={sale.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <PaymentStatusBadge status={sale.invoice?.status} totalAmount={sale.totalAmount} balanceDue={(sale.invoice?.balanceDue ?? sale.totalAmount)} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ActionDropdown
                          items={[
                            {
                              label: "Détails",
                              icon: <Eye className="size-4" />,
                              onClick: () => {
                                setSelectedSale(sale);
                                setSheetOpen(true);
                              }
                            },
                            {
                              label: "Modifier",
                              icon: <Edit className="size-4" />,
                              hidden: showCancelled || sale.status === -3 || sale.status === 0,
                              onClick: () => {
                                handleEdit(sale);
                              }
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="border-t border-border/50 px-4 py-3">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      <SaleDetailSheet
        sale={selectedSale}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onCancel={handleCancel}
        onReopen={handleReopen}
        onClose={handleClose}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onPay={handleOpenPayModal}
        loading={actionLoading}
      />

      <Dialog open={payModal.isOpen} onOpenChange={(open) => !open && setPayModal(p => ({ ...p, isOpen: false }))}>
        <DialogContent className="max-w-sm rounded-xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Encaisser la vente</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Reste à payer</label>
              <div className="text-2xl font-bold text-primary">{payModal.balanceDue.toLocaleString("fr-FR")} Ar</div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Date du paiement</label>
              <Input
                type="datetime-local"
                max={new Date().toISOString().split("T")[0]}
                min={payModal.saleDate}
                value={payModal.paymentDate}
                onChange={(e) => setPayModal(p => ({ ...p, paymentDate: e.target.value }))}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="isPartial"
                  checked={payModal.isPartial}
                  onChange={(e) => setPayModal(p => ({ ...p, isPartial: e.target.checked, amount: e.target.checked ? "" : String(p.balanceDue) }))}
                  className="accent-primary"
                />
                <label htmlFor="isPartial" className="text-sm font-medium cursor-pointer">Payer une partie seulement (Tranche)</label>
              </div>
              {payModal.isPartial && (
                <div className="pl-6">
                  <label className="text-xs text-muted-foreground mb-1 block">Montant à encaisser (Ar)</label>
                  <Input
                    type="number"
                    min="0"
                    max={payModal.balanceDue}
                    value={payModal.amount}
                    onChange={(e) => setPayModal(p => ({ ...p, amount: e.target.value }))}
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
                value={payModal.paymentCode}
                onChange={(e) => setPayModal(p => ({ ...p, paymentCode: e.target.value }))}
                className="w-full"
              />
            </div>

            <div className="mb-2">
              <label className="text-sm font-medium mb-2 block">Mode de paiement</label>
              <div className="flex flex-col gap-2">
                {paymentMethods.map(m => (
                  <label key={m.idPaymentMethod} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${payModal.methodId === m.idPaymentMethod ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary/10'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.idPaymentMethod}
                      checked={payModal.methodId === m.idPaymentMethod}
                      onChange={(e) => setPayModal(p => ({ ...p, methodId: e.target.value }))}
                      className="accent-primary"
                    />
                    <span className="font-medium text-sm">{m.methodName}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2 flex justify-end gap-3">
            <Button variant="outline" disabled={actionLoading} onClick={() => setPayModal(p => ({ ...p, isOpen: false }))}>
              Annuler
            </Button>
            <Button disabled={actionLoading || !payModal.methodId} onClick={handlePay}>
              {actionLoading ? "Enregistrement..." : "Confirmer le paiement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InputDialog
        open={reopenDialog.isOpen}
        onOpenChange={(open) => setReopenDialog(p => ({ ...p, isOpen: open }))}
        title="Rouvrir la vente"
        description="Veuillez indiquer le motif de la réouverture. Cette information sera conservée dans les logs d'audit."
        placeholder="Ex: Le client a changé d'avis et souhaite ajouter un article..."
        confirmLabel="Rouvrir"
        onConfirm={handleReopenConfirm}
        loading={actionLoading}
      />

      <Dialog open={cancelOverpaymentDialog.isOpen} onOpenChange={(open) => !open && setCancelOverpaymentDialog(p => ({ ...p, isOpen: false }))}>
        <DialogContent className="max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-orange-600">Paiement existant détecté</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Vous annulez une vente qui a déjà été payée (Total payé : <strong className="text-foreground">{cancelOverpaymentDialog.totalPaid.toLocaleString("fr-FR")} Ar</strong>). Que souhaitez-vous faire des paiements existants ?
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <Button variant="outline" className="h-auto justify-start p-4 flex flex-col items-start gap-1 text-left" onClick={() => { setCancelOverpaymentDialog(p => ({ ...p, isOpen: false })); handleCancel(cancelOverpaymentDialog.saleId, "REFUND"); }}>
              <span className="font-bold text-base text-foreground">Rembourser le client</span>
              <span className="font-normal text-muted-foreground text-xs whitespace-normal">Enregistrer un paiement négatif pour équilibrer la caisse.</span>
            </Button>
            <Button variant="outline" className="h-auto justify-start p-4 flex flex-col items-start gap-1 text-left" onClick={() => { setCancelOverpaymentDialog(p => ({ ...p, isOpen: false })); handleCancel(cancelOverpaymentDialog.saleId, "ADJUST"); }}>
              <span className="font-bold text-base text-foreground">Ajuster (Annuler le paiement)</span>
              <span className="font-normal text-muted-foreground text-xs whitespace-normal">Supprimer/Réduire les paiements existants dans la base de données.</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(p => ({ ...p, isOpen: false }))}
        />
      )}
    </div>
  );
};
