import React, { useState, useEffect, useCallback } from "react";
import { SaleService } from "../../../services/sale.service";
import { PaymentService } from "../../../../payments/services/payment.service";
import { fetchSalesListDependencies } from "../../../utils/saleFetchers";
import { SaleDetailSheet } from "../SaleDetailSheet";
import { SalesListFilters } from "../SalesListFilters/SalesListFilters";
import { SalesListTable } from "../SalesListTable/SalesListTable";
import { PaymentModal } from "../SalesListModals/PaymentModal";
import { CancelSaleModal } from "../SalesListModals/CancelSaleModal";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import { InputDialog } from "@/components/ui/InputDialog/InputDialog";
import type { SaleRecord } from "../../../types";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";

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
  const [cancelRefundMethodId, setCancelRefundMethodId] = useState<string>("");

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

  const handleCancel = async (id: string, overpaymentAction?: "REFUND" | "ADJUST", idPaymentMethodRefund?: string) => {
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
      await SaleService.cancelSale(id, overpaymentAction, idPaymentMethodRefund);
      showSnackbar("Vente annulée avec succès.", "success");
      setSheetOpen(false);
      fetchSales();
    } catch (err: any) {
      showSnackbar(resolveError(err, "Erreur lors de l'annulation."), "error");
    } finally {
      setActionLoading(false);
    }
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
        if (fullSale) onEditSale({ ...fullSale, _wasJustReopened: true } as any);
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

  const handleAdjustPayment = async (idSale: string, idPayment: string, newAmount: number): Promise<void> => {
    try {
      await SaleService.adjustPayment(idSale, idPayment, newAmount);
      const updated = await SaleService.getSaleById(idSale);
      if (updated) setSelectedSale(updated);
      fetchSales();
    } catch (err: any) {
      const msg = resolveError(err, "Erreur lors de la modification du paiement.");
      showSnackbar(msg, "error");
      throw new Error(msg);
    }
  };

  const handleRefundPayment = async (idSale: string, amount: number, idPaymentMethod: string, reason?: string): Promise<void> => {
    try {
      await SaleService.refundPayment(idSale, amount, idPaymentMethod, reason);
      const updated = await SaleService.getSaleById(idSale);
      if (updated) setSelectedSale(updated);
      fetchSales();
    } catch (err: any) {
      const msg = resolveError(err, "Erreur lors du remboursement.");
      showSnackbar(msg, "error");
      throw new Error(msg);
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
      <SalesListFilters 
        showCancelled={showCancelled}
        onToggleCancelled={() => { setShowCancelled(!showCancelled); setPage(1); }}
        dateFilter={dateFilter}
        onDateFilterChange={(val) => { setDateFilter(val); setPage(1); }}
        menuFilter={menuFilter}
        onMenuFilterChange={(val) => { setMenuFilter(val); setPage(1); }}
        menuOptions={menuOptions}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusFilterChange={(val) => { setPaymentStatusFilter(val); setPage(1); }}
      />

      <SalesListTable
        loading={loading}
        sales={sales}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        showCancelled={showCancelled}
        onSaleClick={(sale) => { setSelectedSale(sale); setSheetOpen(true); }}
        onEditSale={handleEdit}
      />

      <SaleDetailSheet
        sale={selectedSale}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onCancel={handleCancel}
        onReopen={(id) => setReopenDialog({ isOpen: true, saleId: id })}
        onClose={handleClose}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onUpdate={fetchSales}
        onAdjustPayment={handleAdjustPayment}
        onRefundPayment={handleRefundPayment}
        onPay={handleOpenPayModal}
        loading={actionLoading}
      />

      <PaymentModal 
        open={payModal.isOpen}
        onOpenChange={(open) => !open && setPayModal(p => ({ ...p, isOpen: false }))}
        balanceDue={payModal.balanceDue}
        paymentDate={payModal.paymentDate}
        onPaymentDateChange={(val) => setPayModal(p => ({ ...p, paymentDate: val }))}
        isPartial={payModal.isPartial}
        onIsPartialChange={(val) => setPayModal(p => ({ ...p, isPartial: val, amount: val ? "" : String(p.balanceDue) }))}
        amount={payModal.amount}
        onAmountChange={(val) => setPayModal(p => ({ ...p, amount: val }))}
        paymentCode={payModal.paymentCode}
        onPaymentCodeChange={(val) => setPayModal(p => ({ ...p, paymentCode: val }))}
        methodId={payModal.methodId}
        onMethodIdChange={(val) => setPayModal(p => ({ ...p, methodId: val }))}
        paymentMethods={paymentMethods}
        actionLoading={actionLoading}
        onConfirm={handlePay}
        saleDate={payModal.saleDate}
      />

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

      <CancelSaleModal 
        open={cancelOverpaymentDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCancelOverpaymentDialog(p => ({ ...p, isOpen: false }));
            setCancelRefundMethodId("");
          }
        }}
        totalPaid={cancelOverpaymentDialog.totalPaid}
        refundMethodId={cancelRefundMethodId}
        onRefundMethodIdChange={setCancelRefundMethodId}
        paymentMethods={paymentMethods}
        onConfirmRefund={() => {
          setCancelOverpaymentDialog(p => ({ ...p, isOpen: false }));
          handleCancel(cancelOverpaymentDialog.saleId, "REFUND", cancelRefundMethodId);
          setCancelRefundMethodId("");
        }}
      />

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
