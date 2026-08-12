import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import type { Supplier } from "../../types/supplier.type";

interface SupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSupplier: Supplier | null;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function SupplierForm({
  open,
  onOpenChange,
  editingSupplier,
  onSave
}: SupplierFormProps) {
  const [providesDelivery, setProvidesDelivery] = useState(false);

  useEffect(() => {
    if (open) {
      setProvidesDelivery(!!editingSupplier?.providesDelivery);
    }
  }, [open, editingSupplier]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingSupplier ? "Modifier le fournisseur" : "Nouveau fournisseur"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom de l'entreprise <span className="text-red-500">*</span></label>
            <Input name="name" defaultValue={editingSupplier?.name} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input name="description" defaultValue={editingSupplier?.description} placeholder="Ex: Fournisseur de légumes..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Téléphone</label>
              <Input name="phoneNumber" defaultValue={editingSupplier?.phoneNumber} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" defaultValue={editingSupplier?.email} />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Adresse</label>
            <Input name="address" defaultValue={editingSupplier?.address} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea 
              name="notes" 
              defaultValue={editingSupplier?.notes} 
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Informations supplémentaires..."
            />
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="providesDelivery" 
              name="providesDelivery" 
              value="true" 
              checked={providesDelivery}
              onChange={(e) => setProvidesDelivery(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" 
            />
            <label htmlFor="providesDelivery" className="text-sm font-medium">Propose la livraison</label>
          </div>

          {providesDelivery && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-medium">Délai de livraison (en jours)</label>
              <Input name="deliveryDelay" type="number" min="0" defaultValue={editingSupplier?.deliveryDelay} />
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
