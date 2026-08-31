import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SupplierPaymentForm } from "./SupplierPaymentForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { getSuppliers } from "../../../suppliers/services/supplier.service";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function GlobalSupplierPaymentDialog({ open, onOpenChange, onSuccess }: Props) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

  const { data: suppliersRes, isLoading } = useQuery({
    queryKey: ["all-suppliers"],
    queryFn: () => getSuppliers({ limit: 1000 }),
    enabled: open,
  });

  const suppliers = suppliersRes?.records || [];

  return (
    <ConfirmDialog
      open={open}
      title="Faire un paiement / acompte"
      onOpenChange={(val) => {
        if (!val) {
          onOpenChange(false);
          setSelectedSupplierId("");
        }
      }}
      onConfirm={() => {}}
      hideConfirmButton
      cancelText="Fermer"
    >
      <div className="space-y-4">
        {!selectedSupplierId ? (
          <div className="space-y-3 py-4">
            <label className="text-sm font-medium">Sélectionnez un fournisseur</label>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Chargement des fournisseurs...</div>
            ) : (
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Choisir un fournisseur --</option>
                {suppliers.map((s: any) => (
                  <option key={s.idSupplier} value={s.idSupplier}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/50">
              <span className="font-semibold text-sm">
                Fournisseur: {suppliers.find((s: any) => s.idSupplier === selectedSupplierId)?.name}
              </span>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-primary underline"
                onClick={() => setSelectedSupplierId("")}
              >
                Changer
              </button>
            </div>
            <SupplierPaymentForm
              idSupplier={selectedSupplierId}
              onSuccess={() => {
                onSuccess();
                onOpenChange(false);
                setSelectedSupplierId("");
              }}
              onCancel={() => {
                onOpenChange(false);
                setSelectedSupplierId("");
              }}
            />
          </div>
        )}
      </div>
    </ConfirmDialog>
  );
}
