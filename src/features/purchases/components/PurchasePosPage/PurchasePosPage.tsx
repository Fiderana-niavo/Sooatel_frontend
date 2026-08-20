import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseService } from "../../services/purchase.service";
import { getSuppliers } from "@/features/suppliers/services/supplier.service";
import { EmployeeService } from "@/features/employees/services/employee.service";
import type { CreatePurchaseDto } from "../../types/purchase.type";
import { PurchaseInfoForm } from "./PurchaseInfoForm";
import { PurchaseItemsForm } from "./PurchaseItemsForm";
import { Button } from "@/components/ui/Button/button";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import { Snackbar, type SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { AddSuppliedItemModal } from "./AddSuppliedItemModal";
import { formatCurrency } from "../../../../utils/formatters";

export function PurchasePosPage({ onGoToList, idPurchaseToEdit, onGoToDeliveries }: { onGoToList?: () => void, idPurchaseToEdit?: string, onGoToDeliveries?: (idPurchase: string) => void }) {
  const [purchaseData, setPurchaseData] = useState<CreatePurchaseDto>({
    purchaseDate: new Date().toISOString().slice(0, 16),
    idSupplier: "",
    idPurchaser: "",
    details: [],
  });

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; isOpen: boolean }>({ message: "", type: "info", isOpen: false });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const initializedForId = useRef<string | undefined | null>(null);

  useEffect(() => {
    if (initializedForId.current === idPurchaseToEdit) return;

    const savedStr = sessionStorage.getItem("purchasePosSavedState");
    if (savedStr) {
      try {
        const parsed = JSON.parse(savedStr);
        if (parsed && parsed.idPurchaseToEdit === idPurchaseToEdit) {
          setPurchaseData(parsed.purchaseData);
          sessionStorage.removeItem("purchasePosSavedState");
          initializedForId.current = idPurchaseToEdit;
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved pos state", e);
      }
    }
  }, [idPurchaseToEdit]);

  // If in edit mode, fetch the purchase details
  const { data: editPurchase } = useQuery({
    queryKey: ["purchase", idPurchaseToEdit],
    queryFn: () => purchaseService.getById(idPurchaseToEdit!),
    enabled: !!idPurchaseToEdit
  });

  const { data: editDetails } = useQuery({
    queryKey: ["purchaseDetails", idPurchaseToEdit],
    queryFn: () => purchaseService.getDetails(idPurchaseToEdit!),
    enabled: !!idPurchaseToEdit
  });

  useEffect(() => {
    if (initializedForId.current === idPurchaseToEdit) return;

    if (editPurchase && editDetails) {
      setPurchaseData({
        purchaseDate: editPurchase.purchaseDate
          ? new Date(editPurchase.purchaseDate).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        idSupplier: editPurchase.idSupplier,
        idPurchaser: editPurchase.idPurchaser,
        details: editDetails.map((d) => ({
          idSuppliedItem: d.idSuppliedItem,
          quantity: d.quantity,
          unitPrice: d.unitPrice,
        })),
      });
      initializedForId.current = idPurchaseToEdit;
    }
  }, [editPurchase, editDetails, idPurchaseToEdit]);

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type, isOpen: true });
  };

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => getSuppliers({ limit: 100 })
  });

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: () => EmployeeService.getAll({ limit: 100 })
  });

  const { data: suppliedItems, refetch: refetchSuppliedItems } = useQuery({
    queryKey: ["suppliedItems", purchaseData.idSupplier],
    queryFn: () => purchaseService.getSuppliedItemsBySupplier(purchaseData.idSupplier),
    enabled: !!purchaseData.idSupplier,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePurchaseDto) => purchaseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      showSnackbar("Commande créée avec succès", "success");
      if (onGoToList) onGoToList();
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.error || error.response?.data?.message || "Erreur lors de la création de la commande", "error");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreatePurchaseDto) => purchaseService.update(idPurchaseToEdit!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchase", idPurchaseToEdit] });
      queryClient.invalidateQueries({ queryKey: ["purchaseDetails", idPurchaseToEdit] });
      showSnackbar("Commande modifiée avec succès", "success");
      if (onGoToList) onGoToList();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.response?.data?.message || "Erreur lors de la modification de la commande";
      if (msg.includes("livraison en cours")) {
        setSubmitError(msg);
      } else {
        showSnackbar(msg, "error");
      }
    }
  });

  const handleInfoChange = (field: keyof CreatePurchaseDto, value: any) => {
    setPurchaseData(prev => {
      // If supplier changes, clear existing details and add one empty row
      if (field === "idSupplier") {
        return {
          ...prev,
          [field]: value,
          details: [{ idSuppliedItem: "", quantity: 1, unitPrice: 0 }]
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newDetails = [...purchaseData.details];
    (newDetails[index] as any)[field] = value;
    setPurchaseData(prev => ({ ...prev, details: newDetails }));
  };

  const handleAddItem = () => {
    setPurchaseData(prev => ({
      ...prev,
      details: [...prev.details, { idSuppliedItem: "", quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    const newDetails = [...purchaseData.details];
    newDetails.splice(index, 1);
    setPurchaseData(prev => ({ ...prev, details: newDetails }));
  };

  const totalAmount = purchaseData.details.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const isFormValid = purchaseData.idSupplier && purchaseData.idPurchaser && purchaseData.details.length > 0 && purchaseData.details.every(d => d.idSuppliedItem && d.quantity > 0 && d.unitPrice >= 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      if (idPurchaseToEdit) {
        updateMutation.mutate(purchaseData);
      } else {
        createMutation.mutate(purchaseData);
      }
    } else {
      showSnackbar("Veuillez remplir correctement tous les champs obligatoires.", "error");
    }
  };

  const supplierOptions = suppliers?.records?.map(s => ({ value: s.idSupplier, label: s.name })) || [];
  const employeeOptions = employees?.records?.map(e => ({ value: e.idEmployee, label: `${e.name || ''} ${e.lastname || ''}`.trim() })) || [];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onGoToList}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            {idPurchaseToEdit ? `Modifier la commande` : `Nouvelle Commande`}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PurchaseInfoForm
          data={purchaseData}
          suppliers={supplierOptions}
          employees={employeeOptions}
          onChange={handleInfoChange}
        />

        {purchaseData.idSupplier && (
          <PurchaseItemsForm
            items={purchaseData.details}
            suppliedItems={suppliedItems || []}
            totalAmount={totalAmount}
            onChange={handleItemChange}
            onAdd={handleAddItem}
            onRemove={handleRemoveItem}
            onAddNewProduct={() => setIsAddProductModalOpen(true)}
          />
        )}

        {submitError && (
          <div className="flex flex-col gap-2 bg-red-500/10 px-4 py-3 rounded-md mb-6">
            <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {submitError}
            </div>
            {submitError.includes("livraison en cours") && onGoToDeliveries && idPurchaseToEdit && (
              <Button
                variant="outline"
                className="w-full mt-1 text-sm text-red-600 border-red-200 hover:bg-red-500/20"
                onClick={() => {
                  sessionStorage.setItem("purchasePosSavedState", JSON.stringify({ idPurchaseToEdit, purchaseData }));
                  onGoToDeliveries(idPurchaseToEdit);
                }}
              >
                Voir les livraisons en cours
              </Button>
            )}
          </div>
        )}

        <div className="flex justify-end gap-4 border-t border-border/30 pt-6">
          <Button type="button" variant="outline" onClick={onGoToList}>
            Annuler
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
            disabled={!isFormValid || createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? "Enregistrement..." : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Valider la commande ({formatCurrency(totalAmount)})
              </>
            )}
          </Button>
        </div>
      </form>

      {isAddProductModalOpen && (
        <AddSuppliedItemModal
          idSupplier={purchaseData.idSupplier}
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
          showSnackbar={showSnackbar}
          onSuccess={(newSuppliedItem) => {
            refetchSuppliedItems();
            setIsAddProductModalOpen(false);
            // Optionally, automatically select the new item in the last added row or add a new row for it
            const newDetails = [...purchaseData.details];
            if (newDetails.length > 0 && !newDetails[newDetails.length - 1].idSuppliedItem) {
              newDetails[newDetails.length - 1].idSuppliedItem = newSuppliedItem.idSuppliedItem;
              newDetails[newDetails.length - 1].unitPrice = newSuppliedItem.supplierProduct?.actualPrice || 0;
            } else {
              newDetails.push({ idSuppliedItem: newSuppliedItem.idSuppliedItem, quantity: 1, unitPrice: newSuppliedItem.supplierProduct?.actualPrice || 0 });
            }
            setPurchaseData(prev => ({ ...prev, details: newDetails }));
          }}
        />
      )}

      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
        />
      )}
    </div>
  );
}
