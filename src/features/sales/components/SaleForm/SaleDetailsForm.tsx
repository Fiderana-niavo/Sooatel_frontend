import React from "react";
import { Input } from "@/components/ui/Inputs/input";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";

import type { SelectOptionDto } from "@/types/api.type";

interface SaleDetailsProps {
  saleDate: string;
  invoiceNumber: string;
  tableNumber: number | "";
  chargeToRoom: boolean;
  idRoom: string;
  idSaler: string;
  salers: SelectOptionDto[];
  rooms: SelectOptionDto[];
  locationType: "restaurant" | "room";
  onLocationChange: (type: "restaurant" | "room") => void;
  comment: string;
  deliveryDate: string;
  onChange: (field: string, value: any) => void;
}

export const SaleDetailsForm: React.FC<SaleDetailsProps> = ({
  saleDate, invoiceNumber, tableNumber, chargeToRoom, idRoom, idSaler, salers, rooms, comment, deliveryDate, onChange, locationType, onLocationChange
}) => {
  const handleLocationChange = (type: "restaurant" | "room") => {
    onLocationChange(type);
    if (type === "room") {
      onChange("tableNumber", "");
      onChange("chargeToRoom", true);
    } else {
      if (!chargeToRoom) {
        onChange("idRoom", "");
      }
    }
  };


  return (
    <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-primary mb-4">Détails de la Vente</h3>
      
      {/* Location Type Selector */}
      <div className="flex gap-4 mb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="radio" 
            name="locationType"
            checked={locationType === "restaurant"}
            onChange={() => handleLocationChange("restaurant")}
            className="w-4 h-4 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium">Consommation au Restaurant</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="radio" 
            name="locationType"
            checked={locationType === "room"}
            onChange={() => handleLocationChange("room")}
            className="w-4 h-4 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium">Service en Chambre (Room Service)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Numéro de Facture <span className="text-red-500">*</span></label>
          <Input 
            value={invoiceNumber} 
            onChange={(e) => onChange("invoiceNumber", e.target.value)} 
            placeholder="Ex: FAC-001" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date de Vente <span className="text-red-500">*</span></label>
          <Input 
            type="date"
            value={saleDate} 
            onChange={(e) => onChange("saleDate", e.target.value)} 
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Vendeur <span className="text-red-500">*</span></label>
          <SearchableSelect
            value={idSaler}
            onChange={(val) => onChange("idSaler", val)}
            options={salers}
            placeholder="Sélectionner un vendeur..."
          />
        </div>
        
        {locationType === "restaurant" ? (
          <div>
            <label className="block text-sm font-medium mb-1">
              Numéro de Table <span className="text-red-500">*</span>
            </label>
            <Input 
              type="number"
              value={tableNumber} 
              onChange={(e) => onChange("tableNumber", e.target.value ? Number(e.target.value) : "")} 
              placeholder="Ex: 12" 
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">Chambre <span className="text-red-500">*</span></label>
            <SearchableSelect
              value={idRoom}
              onChange={(val) => onChange("idRoom", val)}
              options={rooms}
              placeholder="Sélectionner une chambre..."
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Commentaire additionnel (Optionnel)</label>
          <textarea
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Ex: Pas de salade, sans oignon..."
            value={comment}
            onChange={(e) => onChange("comment", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date et heure de livraison (Optionnel)</label>
          <Input 
            type="datetime-local"
            value={deliveryDate} 
            onChange={(e) => onChange("deliveryDate", e.target.value)} 
          />
        </div>

        <div className="md:col-span-2 flex flex-col justify-end mt-2">
          <label className="flex items-center space-x-2 cursor-pointer p-2 bg-secondary/10 rounded-md border border-border/50 w-max">
            <input 
              type="checkbox" 
              checked={chargeToRoom}
              onChange={(e) => {
                onChange("chargeToRoom", e.target.checked);
                if (!e.target.checked && locationType === "restaurant") {
                  onChange("idRoom", "");
                }
              }}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <span className="text-sm font-medium">Payer à la caisse de l'hôtel (Imputer sur la chambre) ?</span>
          </label>
        </div>

        {locationType === "restaurant" && chargeToRoom && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Chambre à imputer <span className="text-red-500">*</span></label>
            <SearchableSelect
              value={idRoom}
              onChange={(val) => onChange("idRoom", val)}
              options={rooms}
              placeholder="Sélectionner une chambre..."
            />
          </div>
        )}
      </div>
    </div>
  );
};
