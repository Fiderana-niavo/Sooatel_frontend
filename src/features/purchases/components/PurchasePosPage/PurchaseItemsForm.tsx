import React from "react";
import { Input } from "@/components/ui/Inputs/input";
import { Button } from "@/components/ui/Button/button";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";
import type { SuppliedItem } from "../../types/purchase.type";
import { formatCurrency } from "../../../../utils/formatters";

interface PurchaseItemsFormProps {
  items: { idSuppliedItem: string; quantity: number; unitPrice: number }[];
  suppliedItems: SuppliedItem[];
  totalAmount: number;
  onChange: (index: number, field: string, value: any) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onAddNewProduct: () => void;
}

export const PurchaseItemsForm: React.FC<PurchaseItemsFormProps> = ({
  items, suppliedItems, totalAmount, onChange, onAdd, onRemove, onAddNewProduct
}) => {
  const suppliedItemOptions = suppliedItems.map(si => ({
    value: si.idSuppliedItem,
    label: `${si.item?.label || "Inconnu"} (${formatCurrency(si.supplierProduct?.actualPrice || 0)})`
  }));

  const handleProductChange = (index: number, idSuppliedItem: string) => {
    onChange(index, "idSuppliedItem", idSuppliedItem);
    const selected = suppliedItems.find(si => si.idSuppliedItem === idSuppliedItem);
    if (selected && selected.supplierProduct) {
      onChange(index, "unitPrice", selected.supplierProduct.actualPrice);
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">Détails de la Commande</h3>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onAddNewProduct} className="text-primary border-primary/50 hover:bg-primary/10">
            <LinkIcon size={16} className="mr-2" /> Lier un nouveau produit
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onAdd}>
            <Plus size={16} className="mr-2" /> Ajouter une ligne
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const lineTotal = item.quantity * item.unitPrice;
          return (
            <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 bg-muted/20 rounded-lg border border-border/30">
              <div className="flex-1 w-full">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Produit du Fournisseur</label>
                <SearchableSelect
                  value={item.idSuppliedItem}
                  onChange={(val) => handleProductChange(index, val.toString())}
                  options={suppliedItemOptions.filter(opt => 
                    opt.value === item.idSuppliedItem || !items.some(i => i.idSuppliedItem === opt.value)
                  )}
                  placeholder="Sélectionner un produit..."
                />
              </div>
              <div className="w-full md:w-24">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Qté</label>
                <Input 
                  type="number"
                  min="1"
                  value={item.quantity || ""}
                  onChange={(e) => onChange(index, "quantity", e.target.value ? Number(e.target.value) : 0)}
                  onBlur={(e) => {
                    if (!e.target.value || Number(e.target.value) < 1) {
                      onChange(index, "quantity", 1);
                    }
                  }}
                  className="text-center"
                />
              </div>
              <div className="w-full md:w-36">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Prix Unitaire (Ar)</label>
                <Input 
                  type="number"
                  readOnly
                  value={item.unitPrice}
                  className="text-right bg-muted text-muted-foreground"
                />
              </div>
              <div className="w-full md:w-36">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Total (Ar)</label>
                <Input 
                  type="text"
                  readOnly
                  value={formatCurrency(lineTotal)}
                  className="text-right font-semibold bg-muted"
                />
              </div>
              <div className="pt-5">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onRemove(index)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="text-center text-muted-foreground p-8 bg-muted/10 rounded-lg border border-dashed border-border/50">
            Aucun produit ajouté à la commande. Cliquez sur "Ajouter une ligne".
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-border/30">
        <div className="flex items-center gap-4 bg-secondary/10 p-4 rounded-lg border border-border/30">
          <span className="font-semibold text-muted-foreground uppercase tracking-wider text-sm">Total Général :</span>
          <span className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};
