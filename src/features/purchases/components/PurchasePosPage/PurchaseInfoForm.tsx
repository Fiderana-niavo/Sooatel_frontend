import React from "react";
import { Input } from "@/components/ui/Inputs/input";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import type { CreatePurchaseDto } from "../../types/purchase.type";

interface PurchaseInfoFormProps {
  data: CreatePurchaseDto;
  suppliers: { value: string; label: string }[];
  employees: { value: string; label: string }[];
  paymentMethods?: { value: string; label: string }[];
  isEditMode?: boolean;
  onChange: (field: keyof CreatePurchaseDto, value: any) => void;
}

export const PurchaseInfoForm: React.FC<PurchaseInfoFormProps> = ({ data, suppliers, employees, paymentMethods = [], isEditMode = false, onChange }) => {
  return (
    <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-primary mb-4">Informations Générales</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Date de la commande <span className="text-red-500">*</span></label>
          <Input
            type="datetime-local"
            value={data.purchaseDate}
            onChange={(e) => onChange("purchaseDate", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fournisseur <span className="text-red-500">*</span></label>
          <SearchableSelect
            value={data.idSupplier}
            onChange={(val) => onChange("idSupplier", val)}
            options={suppliers}
            placeholder="Sélectionner un fournisseur..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Responsable de l'achat (Employé) <span className="text-red-500">*</span></label>
          <SearchableSelect
            value={data.idPurchaser}
            onChange={(val) => onChange("idPurchaser", val)}
            options={employees}
            placeholder="Sélectionner le reponsable de l'achat..."
          />
        </div>
      </div>

      {/* Advance Payment Section (Only on Creation) */}
      {!isEditMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
          <div>
            <label className="block text-sm font-medium mb-1">Acompte / Avance (Optionnel)</label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={data.advanceAmount || ""}
              onChange={(e) => onChange("advanceAmount", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Méthode de paiement</label>
            <SearchableSelect
              value={data.idPaymentMethod || ""}
              onChange={(val) => onChange("idPaymentMethod", val)}
              options={paymentMethods}
              placeholder="Sélectionner..."
              disabled={!data.advanceAmount || data.advanceAmount <= 0}
            />
          </div>
        </div>
      )}
    </div>
  );
};
