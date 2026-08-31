import React, { useState } from "react";
import { Input } from "@/components/ui/Inputs/input";
import { Button } from "@/components/ui/Button/button";
import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { SaleItemRow } from "./SaleItemRow";
import type { SaleItem, MenuItemRef } from "../../../types";

interface SaleItemsProps {
  items: SaleItem[];
  menuItems: MenuItemRef[];
  totalAmount: number;
  onChange: (index: number, field: keyof SaleItem, value: any) => void;
  onTotalChange?: (val: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export const SaleItemsForm: React.FC<SaleItemsProps> = ({
  items, menuItems, totalAmount, onChange, onTotalChange, onAdd, onRemove
}) => {
  const [unconfirmedPrices, setUnconfirmedPrices] = useState<Record<number, boolean>>({});
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; desc: string; onConfirm: () => void }>({ isOpen: false, title: "", desc: "", onConfirm: () => {} });

  const requestRemove = (index: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Supprimer le plat",
      desc: "Voulez-vous vraiment retirer ce plat de la commande ?",
      onConfirm: () => {
        onRemove(index);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleMenuChange = (index: number, idMenu: string) => {
    const selectedMenu = menuItems.find(m => m.idMenu === idMenu);
    onChange(index, "idMenu", idMenu);

    if (selectedMenu) {
      onChange(index, "unitPrice", selectedMenu.salePrice);
      if (!items[index].quantity || items[index].quantity === 0) {
        onChange(index, "quantity", 1);
      }
      setUnconfirmedPrices(prev => ({ ...prev, [index]: false }));
    }
  };

  const handlePriceChange = (index: number, newPrice: number) => {
    const idMenu = items[index].idMenu;
    const selectedMenu = menuItems.find(m => m.idMenu === idMenu);

    onChange(index, "unitPrice", newPrice);

    if (selectedMenu && newPrice !== selectedMenu.salePrice) {
      setUnconfirmedPrices(prev => ({ ...prev, [index]: true }));
    } else {
      setUnconfirmedPrices(prev => ({ ...prev, [index]: false }));
    }
  };

  const confirmPrice = (index: number) => {
    setUnconfirmedPrices(prev => ({ ...prev, [index]: false }));
  };

  const handleQuantityChange = (index: number, val: string) => {
    onChange(index, "quantity", val === "" ? 0 : Number(val));
  };

  const handleQuantityBlur = (index: number, quantity: number | undefined) => {
    if (!quantity || quantity <= 0) {
      onChange(index, "quantity", 1);
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">Plats</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={items.length > 0 && (!items[items.length - 1].idMenu || !items[items.length - 1].quantity)}
        >
          <Plus size={16} className="mr-2" /> Ajouter
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const selectedMenu = menuItems.find(m => m.idMenu === item.idMenu);
          const needsConfirmation = unconfirmedPrices[index];

          return (
            <SaleItemRow
              key={index}
              item={item}
              index={index}
              availableMenus={menuItems
                .filter(menu => menu.idMenu === item.idMenu || !items.some(i => i.idMenu === menu.idMenu))
                .map(menu => ({
                  value: menu.idMenu,
                  label: `${menu.name} (${menu.salePrice} Ar)`
                }))}
              selectedMenu={selectedMenu}
              needsConfirmation={needsConfirmation}
              onMenuChange={handleMenuChange}
              onQuantityChange={handleQuantityChange}
              onQuantityBlur={handleQuantityBlur}
              onPriceChange={handlePriceChange}
              onRequestRemove={requestRemove}
              onConfirmPrice={confirmPrice}
            />
          );
        })}
        {items.length === 0 && (
          <div className="text-center text-muted-foreground p-4">
            Aucun plat ajouté.
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-border/30">
        <div className="flex items-center gap-4 bg-secondary/10 p-3 rounded-lg border border-border/30 w-full md:w-auto">
          <span className="font-semibold text-muted-foreground uppercase tracking-wider text-sm">Total Général :</span>
          <div className="relative">
            <Input 
              type="number"
              value={totalAmount}
              onChange={(e) => onTotalChange?.(Number(e.target.value))}
              className="text-xl font-bold w-40 text-right pr-8 bg-background"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Ar</span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
        title={confirmDialog.title}
        description={confirmDialog.desc}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
};
