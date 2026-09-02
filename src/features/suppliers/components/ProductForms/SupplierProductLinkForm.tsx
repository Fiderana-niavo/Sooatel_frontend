import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Trash2 } from "lucide-react";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import type { SupplierProduct, SuppliedItem } from "../../types/supplier.type";
import type { Item } from "@/features/items/types/item.type";

interface SupplierProductLinkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkProduct: SupplierProduct | null;
  linkedItems: SuppliedItem[];
  allItems: Item[];
  onAddLink: (e: React.FormEvent<HTMLFormElement>) => void;
  onDeleteLink: (id: string) => void;
}

export function SupplierProductLinkForm({
  open,
  onOpenChange,
  linkProduct,
  linkedItems,
  allItems,
  onAddLink,
  onDeleteLink
}: SupplierProductLinkFormProps) {
  const [selectedItemId, setSelectedItemId] = useState("");

  useEffect(() => {
    if (!open) setSelectedItemId("");
  }, [open]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    onAddLink(e);
    // Clear selection so user can immediately link another item
    setSelectedItemId("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Liaisons pour {linkProduct?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border border-border/50 rounded-xl p-4 bg-muted/10">
            <h4 className="font-medium text-sm mb-3">Articles internes actuellement liés</h4>
            {linkedItems.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Aucun article n'est lié à ce produit fournisseur.</p>
            ) : (
              <div className="space-y-2">
                {linkedItems.map(link => (
                  <div key={link.idSuppliedItem} className="flex items-center justify-between bg-background p-2 rounded border border-border/50 text-sm">
                    <span className="font-medium">{link.item?.label || link.idItem}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDeleteLink(link.idSuppliedItem)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {linkedItems.length === 0 ? (
            <form onSubmit={handleFormSubmit} className="space-y-3 pt-2 border-t border-border/50">
              <h4 className="font-medium text-sm">Ajouter une liaison</h4>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <input type="hidden" name="idItem" value={selectedItemId} />
                  <SearchableSelect
                    options={allItems.map(item => ({ value: item.idItem, label: item.label + (item.unit?.symbol ? ` (${item.unit.symbol})` : "") }))}
                    value={selectedItemId}
                    onChange={(val) => setSelectedItemId(val as string)}
                    placeholder="Sélectionner un article interne..."
                  />
                </div>
                <Button type="submit" disabled={!selectedItemId}>Lier</Button>
              </div>
            </form>
          ) : (
            <div className="pt-2 border-t border-border/50 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              <p>Ce produit fournisseur est déjà lié à un article interne. Vous devez supprimer la liaison actuelle pour pouvoir en ajouter une nouvelle.</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
