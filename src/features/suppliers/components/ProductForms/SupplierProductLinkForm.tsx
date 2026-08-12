import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Trash2 } from "lucide-react";
import type { SupplierProduct, SuppliedItem } from "../../types/supplier.type";

interface SupplierProductLinkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkProduct: SupplierProduct | null;
  linkedItems: SuppliedItem[];
  allItems: any[];
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

          <form onSubmit={onAddLink} className="space-y-3 pt-2 border-t border-border/50">
            <h4 className="font-medium text-sm">Ajouter une liaison</h4>
            <div className="flex gap-2">
              <select name="idItem" className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" required>
                <option value="">Sélectionner un article interne...</option>
                {allItems.map(item => (
                  <option key={item.idItem} value={item.idItem}>{item.label}</option>
                ))}
              </select>
              <Button type="submit">Lier</Button>
            </div>
          </form>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
