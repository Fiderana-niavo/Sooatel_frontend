import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import type { SupplierProduct } from "../../types/supplier.type";

interface SupplierProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: SupplierProduct | null;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function SupplierProductForm({
  open,
  onOpenChange,
  editingProduct,
  onSave
}: SupplierProductFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingProduct ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Désignation *</label>
            <Input name="name" defaultValue={editingProduct?.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prix Actuel (Ar) *</label>
              <Input 
                name="actualPrice" 
                type="number" 
                step="0.01" 
                defaultValue={editingProduct?.actualPrice} 
                required 
                disabled={!!editingProduct} 
                title={editingProduct ? "Le prix se modifie via l'action Prix" : ""} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Qté Minimum</label>
              <Input name="minPurchaseNumber" type="number" defaultValue={editingProduct?.minPurchaseNumber || 1} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes / Remarques</label>
            <Input name="notes" defaultValue={editingProduct?.notes || ""} placeholder="Informations supplémentaires (ex: délai, condition...)" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
