import { useState, useEffect } from "react";
import type { SalePayload, SaleItem, MenuItemRef, PaymentMethodRef } from "./types";
import type { SelectOptionDto } from "@/types/api.type";
import { SaleService } from "./services/sale.service";
import { SaleDetailsForm } from "./components/SaleForm/SaleDetailsForm";
import { SaleItemsForm } from "./components/SaleForm/SaleItemsForm";
import { SalePaymentForm } from "./components/SaleForm/SalePaymentForm";
import { validateSaleForm } from "./utils/saleValidation";
import { mapSaleRecordToFormData, calculateAlreadyPaid } from "./utils/saleMappers";
import { fetchSalesDependencies } from "./utils/saleFetchers";
import { Button } from "@/components/ui/Button/button";
import { Save, AlertCircle, List } from "lucide-react";
import { useAppStore } from "@/store/app.store";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog/dialog";

import type { SaleRecord } from "./types";

interface SalesPosPageProps {
  onGoToHistory?: () => void;
  saleToEdit?: SaleRecord | null;
  onClearEdit?: () => void;
}

export default function SalesPosPage({ onGoToHistory, saleToEdit, onClearEdit }: SalesPosPageProps) {
  const connectedUser = useAppStore(state => state.connectedUser);
  const [formData, setFormData] = useState<SalePayload>({
    saleDate: new Date().toISOString().slice(0, 16),
    idSaler: connectedUser?.idEmployee || "",
    invoiceNumber: "",
    tableNumber: undefined,
    chargeToRoom: false,
    idRoom: "",
    items: [{ idMenu: "", quantity: 1, unitPrice: 0 }],
    payment: undefined,
    comment: "",
    deliveryDate: ""
  });

  useEffect(() => {
    if (saleToEdit) {
      setLocationType(saleToEdit.chargeToRoom ? "room" : "restaurant");
      setFormData(mapSaleRecordToFormData(saleToEdit, connectedUser?.idEmployee || ""));
    }
  }, [saleToEdit, connectedUser]);

  const [menuItems, setMenuItems] = useState<MenuItemRef[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRef[]>([]);
  const [refundMethodId, setRefundMethodId] = useState("");
  const [rooms, setRooms] = useState<SelectOptionDto[]>([]);
  const [salers, setSalers] = useState<SelectOptionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; isOpen: boolean }>({ message: "", type: "info", isOpen: false });
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; desc: string; onConfirm: () => void }>({ isOpen: false, title: "", desc: "", onConfirm: () => { } });
  const [overpaymentDialog, setOverpaymentDialog] = useState<{ isOpen: boolean; balanceDue: number }>({ isOpen: false, balanceDue: 0 });

  const [recloseDialog, setRecloseDialog] = useState<{ isOpen: boolean; saleId: string }>({ isOpen: false, saleId: "" });
  const [journalConfirm, setJournalConfirm] = useState<{ isOpen: boolean; paymentId: string }>({ isOpen: false, paymentId: "" });
  const [locationType, setLocationType] = useState<"restaurant" | "room">("restaurant");
  const [idPaymentToAdjust, setIdPaymentToAdjust] = useState<string>("");

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type, isOpen: true });
  };

  useEffect(() => {
    const loadDependencies = async () => {
      const deps = await fetchSalesDependencies();
      setRooms(deps.rooms);
      setSalers(deps.salers);
      setMenuItems(deps.menuItems);
      setPaymentMethods(deps.paymentMethods);
    };
    loadDependencies();
  }, []);



  const alreadyPaid = calculateAlreadyPaid(saleToEdit);
  const totalAmount = formData.items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice) || 0), 0);
  const paidAmount = formData.payment?.amount || 0;
  const balanceDue = totalAmount - (paidAmount + alreadyPaid);

  const handleDetailsChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof SaleItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { idMenu: "", quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handlePaymentChange = (field: string, value: any) => {
    setFormData(prev => {
      if (!prev.payment) {
        return { ...prev, payment: { paymentDate: "", amount: 0, idPaymentMethod: "", [field]: value } };
      }
      return { ...prev, payment: { ...prev.payment, [field]: value } };
    });
  };

  const handleClearPayment = () => {
    setFormData(prev => ({ ...prev, payment: undefined }));
  };

  const handleSubmit = async () => {
    setError(null);

    const validationError = validateSaleForm(formData, locationType);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (saleToEdit && balanceDue < 0) {
      setOverpaymentDialog({ isOpen: true, balanceDue: Math.abs(balanceDue) });
      return;
    }

    if (balanceDue > 0 && !formData.chargeToRoom) {
      setConfirmDialog({
        isOpen: true,
        title: "Reste à payer",
        desc: "Le montant payé est inférieur au total et la vente n'est pas imputée sur une chambre. Êtes-vous sûr de vouloir enregistrer cette vente avec un reste à payer ?",
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          executeSubmit();
        }
      });
      return;
    }

    executeSubmit();
  };



  const executeSubmit = async (overpaymentAction?: "REFUND" | "ADJUST", idPaymentMethodRefund?: string, idPaymentToAdjustParam?: string) => {
    setLoading(true);
    try {
      if (saleToEdit) {
        const payload = {
          ...formData,
          overpaymentAction,
          idPaymentMethodRefund,
          idPaymentToAdjust: idPaymentToAdjustParam
        };
        await SaleService.updateSale(saleToEdit.idSale, payload);
        showSnackbar("Vente modifiée avec succès !", "success");
        if (saleToEdit.status === 5 && (saleToEdit as any)._wasJustReopened) {
          setRecloseDialog({ isOpen: true, saleId: saleToEdit.idSale });
        } else {
          if (onGoToHistory) onGoToHistory();
          else if (onClearEdit) onClearEdit();
        }
      } else {
        await SaleService.createSale(formData);
        showSnackbar("Vente enregistrée avec succès ! (Status = Ouverte)", "success");
        if (onGoToHistory) onGoToHistory();
      }

      // Reset form on success
      setFormData({
        saleDate: new Date().toISOString().slice(0, 16),
        idSaler: connectedUser?.idEmployee || "",
        invoiceNumber: "",
        tableNumber: undefined,
        chargeToRoom: false,
        idRoom: "",
        items: [{ idMenu: "", quantity: 1, unitPrice: 0 }],
        payment: undefined,
        comment: "",
        deliveryDate: ""
      });
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Une erreur est survenue lors de l'enregistrement de la vente.";


      showSnackbar(msg, "error");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Point de Vente (Caisse)</h2>
          <p className="text-muted-foreground mt-1">Gérez la facturation et les paiements des clients.</p>
        </div>
        <div className="flex items-center gap-3">
          {onGoToHistory && (
            <Button variant="outline" size="lg" onClick={onGoToHistory} className="shadow-sm">
              <List size={20} className="mr-2" />
              Historique
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={loading} size="lg" className="shadow-lg hover:shadow-xl transition-all">
            <Save size={20} className="mr-2" />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className={saleToEdit ? "lg:col-span-12" : "lg:col-span-8"}>
          <SaleDetailsForm
            saleDate={formData.saleDate}
            invoiceNumber={formData.invoiceNumber}
            tableNumber={formData.tableNumber ?? ""}
            chargeToRoom={formData.chargeToRoom || false}
            idRoom={formData.idRoom || ""}
            idSaler={formData.idSaler}
            salers={salers}
            rooms={rooms}
            locationType={locationType}
            comment={formData.comment || ""}
            deliveryDate={formData.deliveryDate || ""}
            onLocationChange={setLocationType}
            onChange={handleDetailsChange}
          />
          <SaleItemsForm
            items={formData.items}
            menuItems={menuItems}
            totalAmount={totalAmount}
            onChange={handleItemChange}
            onTotalChange={(val) => setFormData(prev => ({ ...prev, totalAmount: val }))}
            onAdd={handleAddItem}
            onRemove={handleRemoveItem}
          />
        </div>
        {!saleToEdit && (
          <div className="lg:col-span-4">
            <SalePaymentForm
              payment={formData.payment}
              saleDate={formData.saleDate}
              paymentMethods={paymentMethods}
              totalAmount={totalAmount}
              balanceDue={balanceDue}
              onChange={handlePaymentChange}
              onClear={handleClearPayment}
            />
          </div>
        )}
      </div>
      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
        title={confirmDialog.title}
        description={confirmDialog.desc}
        onConfirm={confirmDialog.onConfirm}
      />

      <Dialog open={overpaymentDialog.isOpen} onOpenChange={(open) => !open && setOverpaymentDialog(p => ({ ...p, isOpen: false }))}>
        <DialogContent className="max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-orange-600">Paiement excédentaire détecté</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Le nouveau total de la vente est inférieur au montant que le client a déjà payé (Différence : <strong className="text-foreground">{Math.abs(overpaymentDialog.balanceDue).toLocaleString("fr-FR")} Ar</strong>). Que souhaitez-vous faire ?
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-4 flex flex-col gap-2">
              <span className="font-bold text-base text-foreground">Rembourser le client</span>
              <span className="font-normal text-muted-foreground text-xs whitespace-normal">Enregistrer un paiement négatif pour lui rendre la différence et équilibrer la caisse.</span>
              <select
                className="w-full mt-2 p-2 rounded-md border border-input bg-background"
                value={refundMethodId}
                onChange={e => setRefundMethodId(e.target.value)}
              >
                <option value="">-- Choisir le mode de remboursement --</option>
                {paymentMethods.map(pm => (
                  <option key={pm.idPaymentMethod} value={pm.idPaymentMethod}>{pm.methodName}</option>
                ))}
              </select>
              <Button
                variant="default"
                className="w-full mt-2"
                disabled={!refundMethodId}
                onClick={() => { setOverpaymentDialog(p => ({ ...p, isOpen: false })); executeSubmit("REFUND", refundMethodId); setRefundMethodId(""); }}
              >
                Confirmer le remboursement
              </Button>
            </div>
            <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-4 flex flex-col gap-2 mt-2">
              <span className="font-bold text-base text-foreground">Ajuster (Erreur de frappe)</span>
              <span className="font-normal text-muted-foreground text-xs whitespace-normal">Le paiement précédent était une erreur. Réduire simplement le montant d'un paiement existant.</span>
              <select
                className="w-full mt-2 p-2 rounded-md border border-input bg-background"
                value={idPaymentToAdjust}
                onChange={e => setIdPaymentToAdjust(e.target.value)}
              >
                <option value="">-- Choisir le paiement à réduire --</option>
                {saleToEdit?.invoice?.payments?.filter(p => Number(p.amount) > 0 && p.paymentCode !== "Remboursement manuel").map(p => (
                  <option key={p.idPayment} value={p.idPayment}>
                    {new Date(p.paymentDate).toLocaleString('fr-FR')} - {Number(p.amount).toLocaleString('fr-FR')} Ar ({p.paymentMethod?.methodName})
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                className="w-full mt-2 border-orange-200 text-orange-900 hover:bg-orange-100 transition-colors"
                disabled={!idPaymentToAdjust}
                onClick={() => { 
                  const payment = saleToEdit?.invoice?.payments?.find((p: any) => p.idPayment === idPaymentToAdjust);
                  if ((payment as any)?.idCashMovement || (payment as any)?.cashMovement) {
                    setOverpaymentDialog(p => ({ ...p, isOpen: false }));
                    setJournalConfirm({ isOpen: true, paymentId: idPaymentToAdjust });
                  } else {
                    setOverpaymentDialog(p => ({ ...p, isOpen: false }));
                    executeSubmit("ADJUST", undefined, idPaymentToAdjust);
                    setIdPaymentToAdjust("");
                  }
                }}
              >
                Confirmer l'ajustement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={journalConfirm.isOpen}
        onOpenChange={(open) => !open && setJournalConfirm({ isOpen: false, paymentId: "" })}
        title="Paiement journalisé"
        description="Ce paiement est déjà journalisé en caisse. Souhaitez-vous quand même le réduire ? Un mouvement de caisse compensatoire sera créé."
        onConfirm={() => {
          executeSubmit("ADJUST", undefined, journalConfirm.paymentId);
          setJournalConfirm({ isOpen: false, paymentId: "" });
          setIdPaymentToAdjust("");
        }}
      />

      <ConfirmDialog
        open={recloseDialog.isOpen}
        onOpenChange={(open) => {
          setRecloseDialog(prev => ({ ...prev, isOpen: open }));
          if (!open) {
            if (onGoToHistory) onGoToHistory();
            else if (onClearEdit) onClearEdit();
          }
        }}
        title="Fermer la vente"
        description="Souhaitez-vous fermer manuellement cette vente maintenant que les modifications sont terminées ?"
        onConfirm={async () => {
          setLoading(true);
          try {
            await SaleService.closeSale(recloseDialog.saleId);
            showSnackbar("Vente fermée avec succès.", "success");
            setRecloseDialog({ isOpen: false, saleId: "" });
            if (onGoToHistory) onGoToHistory();
            else if (onClearEdit) onClearEdit();
          } catch (err: any) {
            showSnackbar(err.response?.data?.error || "Erreur lors de la fermeture.", "error");
            setLoading(false);
          }
        }}
      />
    </div>
  );
}
