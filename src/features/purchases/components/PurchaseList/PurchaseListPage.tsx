import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { purchaseService } from "../../services/purchase.service";
import { Button } from "@/components/ui/Button/button";
import { formatCurrency } from "../../../../utils/formatters";
import { Plus } from "lucide-react";
import { PurchaseDetailSheet } from "./PurchaseDetailSheet";
import { PurchaseStatusBadge } from "./PurchaseStatusBadge";
import { getPurchaseDropdownActions } from "../../utils/purchase-actions";
import { DeliverySheet } from "../../../delivery/components/DeliverySheet/DeliverySheet";
import { ActionDropdown } from "@/components/ui/ActionDropdown/ActionDropdown";
import { ConfirmPurchaseDialog } from "./ConfirmPurchaseDialog";
import { CancelPurchaseDialog } from "./CancelPurchaseDialog";
import { DeliveryDetailSheet } from "../../../delivery/components/DeliveryList/DeliveryDetailSheet";
import { GlobalSupplierPaymentDialog } from "./GlobalSupplierPaymentDialog";
import type { Purchase } from "../../types/purchase.type";
import { useEffect } from "react";

export function PurchaseListPage({ onGoToCreate, onGoToEdit, onGoToDeliveries }: { onGoToCreate?: () => void, onGoToEdit?: (p: Purchase) => void, onGoToDeliveries?: () => void }) {
  const [activeTab, setActiveTab] = useState<"toutes" | "annulees">("toutes");
  const [page] = useState(1);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [receptionPurchase, setReceptionPurchase] = useState<Purchase | null>(null);
  const [viewDeliveryId, setViewDeliveryId] = useState<string | null>(null);
  const [confirmPurchase, setConfirmPurchase] = useState<Purchase | null>(null);
  const [cancelPurchase, setCancelPurchase] = useState<Purchase | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [confirmAndReceivePurchase, setConfirmAndReceivePurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    const savedStr = sessionStorage.getItem("deliverySheetSavedState");
    if (savedStr) {
      try {
        const parsed = JSON.parse(savedStr);
        if (parsed && parsed.purchase) {
          console.log("PurchaseListPage restoring receptionPurchase from saved state:", parsed.purchase.idPurchase);
          setReceptionPurchase(parsed.purchase);
        }
      } catch (e) {
        console.error("Failed to parse saved delivery sheet state", e);
      }
    }
  }, []);

  const result = useQuery({
    queryKey: ["purchases", page, activeTab],
    queryFn: () => purchaseService.getAll({
      page,
      limit: 10,
      lifecycleStatus: activeTab === "annulees" ? -3 : undefined
    })
  });

  const { data, isLoading } = result;

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Commandes Fournisseurs</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setPaymentDialogOpen(true)} className="border-primary text-primary hover:bg-primary/10">
            Faire un paiement / acompte
          </Button>
          <Button onClick={onGoToCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Commande
          </Button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border/50 pb-2">
        <button
          onClick={() => setActiveTab("toutes")}
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeTab === "toutes" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Toutes les commandes
          {activeTab === "toutes" && (
            <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("annulees")}
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeTab === "annulees" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Annulées
          {activeTab === "annulees" && (
            <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      <div className="border border-border/50 shadow-sm rounded-lg bg-card text-card-foreground mt-4">
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Référence</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Fournisseur</th>
                  <th className="px-6 py-4 font-semibold text-right">Total</th>
                  <th className="px-6 py-4 font-semibold text-center whitespace-nowrap">Confirmation</th>
                  <th className="px-6 py-4 font-semibold text-center whitespace-nowrap">Statut</th>
                  <th className="px-4 py-4 font-semibold text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Chargement des commandes...</td>
                  </tr>
                ) : data?.records?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Aucune commande trouvée.</td>
                  </tr>
                ) : (
                  data?.records.map((purchase) => {
                    const isConfirmed = purchase.lifecycleStatus === "Confirmé" || (purchase.lifecycleStatus as unknown) === 0;
                    const isCancelled = purchase.lifecycleStatus === "Annulé" || (purchase.lifecycleStatus as unknown) === -3;

                    return (
                      <tr key={purchase.idPurchase} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">{purchase.ref}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 truncate max-w-[200px]" title={purchase.supplier?.name}>{purchase.supplier?.name}</td>
                        <td className="px-6 py-4 text-right font-medium whitespace-nowrap">{formatCurrency(purchase.totalAmount)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${isConfirmed ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              isCancelled ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                            {isConfirmed ? 'Confirmé' : isCancelled ? 'Annulé' : 'Non confirmé'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <PurchaseStatusBadge status={purchase.status} />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <ActionDropdown
                              items={getPurchaseDropdownActions(purchase, activeTab, {
                                onDetails: (id) => setSelectedPurchaseId(id),
                                onConfirm: (p) => setConfirmPurchase(p),
                                onEdit: (p) => onGoToEdit && onGoToEdit(p),
                                onCancel: (p) => setCancelPurchase(p),

                                onConfirmAndReceive: (p) => setConfirmAndReceivePurchase(p),
                                onReceive: (p) => setReceptionPurchase(p),
                              })}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PurchaseDetailSheet
        idPurchase={selectedPurchaseId}
        onClose={() => setSelectedPurchaseId(null)}
        onGoToDelivery={(idDelivery) => {
          setViewDeliveryId(idDelivery);
        }}
        onConfirm={(p) => {
          setSelectedPurchaseId(null);
          setConfirmPurchase(p);
        }}
        onReceive={(p) => {
          setSelectedPurchaseId(null);
          if (p.status === "Créé" || p.status === "Brouillon") {
            setConfirmAndReceivePurchase(p);
          } else {
            setReceptionPurchase(p);
          }
        }}
        onEdit={(p) => {
          setSelectedPurchaseId(null);
          if (onGoToEdit) onGoToEdit(p);
        }}
        onCancel={(p) => {
          setSelectedPurchaseId(null);
          setCancelPurchase(p);
        }}
      />

      <DeliveryDetailSheet
        idDelivery={viewDeliveryId}
        onClose={() => setViewDeliveryId(null)}
      />

      <DeliverySheet
        purchase={receptionPurchase}
        onClose={() => {
          setReceptionPurchase(null);
        }}
        onGoToDeliveries={(idPurchase) => {
          sessionStorage.setItem("deliveryFilter", JSON.stringify({ idPurchase, status: 5 /* OPEN */, returnToPurchases: true }));
          if (onGoToDeliveries) onGoToDeliveries();
        }}
      />

      {confirmPurchase && (
        <ConfirmPurchaseDialog
          purchase={confirmPurchase}
          onClose={() => setConfirmPurchase(null)}
        />
      )}

      {confirmAndReceivePurchase && (
        <ConfirmPurchaseDialog
          purchase={confirmAndReceivePurchase}
          onClose={() => setConfirmAndReceivePurchase(null)}
          onConfirmed={() => {
            setReceptionPurchase(confirmAndReceivePurchase);
          }}
        />
      )}

      {cancelPurchase && (
        <CancelPurchaseDialog
          purchase={cancelPurchase}
          onClose={() => setCancelPurchase(null)}
        />
      )}

      <GlobalSupplierPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSuccess={() => {}}
      />
    </div>
  );
}

