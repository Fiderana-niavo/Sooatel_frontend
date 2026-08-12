import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { RefreshCw, AlertCircle } from "lucide-react";
import type { SupplierProduct } from "../../types/supplier.type";

interface SupplierProductPriceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceProduct: SupplierProduct | null;
  priceActionType: "change" | "fix";
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function SupplierProductPriceForm({
  open,
  onOpenChange,
  priceProduct,
  priceActionType,
  onSave
}: SupplierProductPriceFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className={priceActionType === 'fix' ? 'text-orange-600' : 'text-blue-600'}>
            {priceActionType === 'fix' ? "Corriger une erreur de prix" : "Changer le prix"}
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-4">
          Produit : <strong className="text-foreground">{priceProduct?.name}</strong><br/>
          Prix actuel : <strong className="text-foreground">{priceProduct?.actualPrice?.toLocaleString()} Ar</strong>
        </div>
        {priceActionType === 'change' ? (
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs mb-4 flex gap-2">
            <RefreshCw size={14} className="shrink-0 mt-0.5" />
            Cette action ajoutera une nouvelle ligne dans l'historique des prix du produit.
          </div>
        ) : (
          <div className="bg-orange-50 text-orange-800 p-3 rounded-lg text-xs mb-4 flex gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            Cette action remplacera le dernier prix enregistré pour corriger une erreur de saisie, sans créer d'historique supplémentaire.
          </div>
        )}
        <form onSubmit={onSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nouveau Prix (Ar) *</label>
            <Input name="price" type="number" step="0.01" required autoFocus />
          </div>
          {priceActionType === 'change' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Date d'application *</label>
              <Input name="changeDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" className={priceActionType === 'fix' ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}>
              {priceActionType === 'fix' ? "Corriger" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
