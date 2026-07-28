import React from "react";
import { Input } from "@/components/ui/Inputs/input";
import { Button } from "@/components/ui/Button/button";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import { Trash2, AlertTriangle, Check } from "lucide-react";
import type { SaleItem, MenuItemRef } from "../../types";

interface SaleItemRowProps {
  item: SaleItem;
  index: number;
  availableMenus: { value: string; label: string }[];
  selectedMenu?: MenuItemRef;
  needsConfirmation: boolean;
  onMenuChange: (index: number, idMenu: string) => void;
  onQuantityChange: (index: number, val: string) => void;
  onQuantityBlur: (index: number, quantity: number | undefined) => void;
  onPriceChange: (index: number, newPrice: number) => void;
  onRequestRemove: (index: number) => void;
  onConfirmPrice: (index: number) => void;
}

export const SaleItemRow: React.FC<SaleItemRowProps> = ({
  item,
  index,
  availableMenus,
  selectedMenu,
  needsConfirmation,
  onMenuChange,
  onQuantityChange,
  onQuantityBlur,
  onPriceChange,
  onRequestRemove,
  onConfirmPrice
}) => {
  return (
    <div className="flex flex-col gap-2 p-4 border border-border/30 rounded-lg bg-secondary/5 relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4">
          <label className="block text-xs font-medium mb-1">Plat <span className="text-red-500">*</span></label>
          <SearchableSelect
            value={item.idMenu}
            onChange={(val) => onMenuChange(index, String(val))}
            options={availableMenus}
            placeholder="Sélectionner un plat..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1">Quantité <span className="text-red-500">*</span></label>
          <Input
            type="number"
            min="1"
            value={item.quantity === 0 ? "" : item.quantity}
            onChange={(e) => onQuantityChange(index, e.target.value)}
            onBlur={() => onQuantityBlur(index, item.quantity)}
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-medium mb-1">Prix Unitaire <span className="text-red-500">*</span></label>
          <div className="relative">
            <Input
              type="number"
              min="0"
              value={item.unitPrice === 0 ? "" : item.unitPrice}
              onChange={(e) => {
                const val = Number(e.target.value);
                onPriceChange(index, val < 0 ? 0 : val);
              }}
              className={needsConfirmation ? "border-orange-500 pr-10" : ""}
            />
            {needsConfirmation && (
              <div className="absolute right-2 top-2 text-orange-500">
                <AlertTriangle size={16} />
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1">Total</label>
          <div className="h-10 flex items-center whitespace-nowrap overflow-hidden font-semibold text-sm px-2 bg-muted/50 rounded-md border border-input">
            {(item.quantity * item.unitPrice) || 0} Ar
          </div>
        </div>

        <div className="md:col-span-1 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            className="text-red-500 hover:bg-red-500/10 hover:text-red-600 px-2"
            onClick={() => onRequestRemove(index)}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      {needsConfirmation && (
        <div className="flex items-center justify-between mt-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded text-sm">
          <span className="text-orange-700 flex items-center">
            <AlertTriangle size={14} className="mr-2" />
            Le prix saisi ({item.unitPrice}) est différent du prix catalogue ({selectedMenu?.salePrice}).
          </span>
          <Button type="button" size="sm" onClick={() => onConfirmPrice(index)} className="bg-orange-500 hover:bg-orange-600 text-white h-7 text-xs">
            <Check size={14} className="mr-1" /> Confirmer
          </Button>
        </div>
      )}
    </div>
  );
};
