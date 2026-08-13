import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import { ItemService } from "@/features/items/services";
import { createSupplierProduct, createSuppliedItem, getSupplierProducts } from "@/features/suppliers/services/supplier.service";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { Link, PlusCircle } from "lucide-react";

interface AddSuppliedItemModalProps {
  idSupplier: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  showSnackbar?: (message: string, type: SnackbarType) => void;
}

export const AddSuppliedItemModal: React.FC<AddSuppliedItemModalProps> = ({ idSupplier, isOpen, onClose, onSuccess, showSnackbar }) => {
  const [mode, setMode] = useState<"create" | "link">("create");
  
  const [formData, setFormData] = useState({
    name: "",
    actualPrice: "",
    minPurchaseNumber: 1,
    notes: "",
    idItem: "",
    idSupplierProduct: "", // Used when mode is "link"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: items } = useQuery({
    queryKey: ["items", "not-produced", "unlinked", idSupplier],
    queryFn: () => ItemService.getAll({ isProduced: false, unlinkedSupplierId: idSupplier, limit: 1000 })
  });

  const { data: existingProducts } = useQuery({
    queryKey: ["supplierProducts", idSupplier, "unlinked"],
    queryFn: () => getSupplierProducts({ idSupplier, limit: 100, unlinkedOnly: true }),
    enabled: isOpen && mode === "link",
  });

  const itemOptions = items?.map(item => ({
    value: item.idItem,
    label: item.label
  })) || [];

  const supplierProductOptions = existingProducts?.records?.map(p => ({
    value: p.idSupplierProduct,
    label: `${p.name} (${p.actualPrice} Ar)`
  })) || [];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "create") {
      if (!formData.name || !formData.actualPrice || !formData.idItem) {
        if (showSnackbar) showSnackbar("Veuillez remplir tous les champs obligatoires.", "error");
        return;
      }
    } else {
      if (!formData.idSupplierProduct || !formData.idItem) {
        if (showSnackbar) showSnackbar("Veuillez remplir tous les champs obligatoires.", "error");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let product;
      
      if (mode === "create") {
        // 1. Create SupplierProduct
        product = await createSupplierProduct({
          idSupplier,
          name: formData.name,
          actualPrice: Number(formData.actualPrice),
          minPurchaseNumber: Number(formData.minPurchaseNumber),
          notes: formData.notes
        });
      } else {
        product = existingProducts?.records?.find(p => p.idSupplierProduct === formData.idSupplierProduct);
        if (!product) throw new Error("Produit introuvable.");
      }

      // 2. Link it to Item via SuppliedItem
      const suppliedItem = await createSuppliedItem({
        idSupplierProduct: product.idSupplierProduct,
        idItem: formData.idItem
      });

      // Pass the product info inside suppliedItem for immediate UI update
      onSuccess({ ...suppliedItem, supplierProduct: product, item: items?.find(i => i.idItem === formData.idItem) });
      if (showSnackbar) showSnackbar("Produit lié avec succès !", "success");
    } catch (error: any) {
      if (showSnackbar) showSnackbar(error.response?.data?.message || error.message || "Erreur lors de l'ajout du produit", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Produit fournisseur</DialogTitle>
          <DialogDescription>
            Ajoutez ou liez un produit de ce fournisseur à votre catalogue interne.
          </DialogDescription>
        </DialogHeader>

        <div className="flex bg-muted/50 p-1 rounded-lg mb-4">
          <button
            type="button"
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === "create" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-muted"}`}
            onClick={() => setMode("create")}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Nouveau Produit
          </button>
          <button
            type="button"
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === "link" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-muted"}`}
            onClick={() => setMode("link")}
          >
            <Link className="w-4 h-4 mr-2" />
            Lier Existant
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "create" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Désignation (Nom chez le fournisseur) <span className="text-red-500">*</span></label>
                <Input 
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ex: Coca-Cola 1.5L"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prix d'achat (Ar) <span className="text-red-500">*</span></label>
                  <Input 
                    type="number" 
                    min="0"
                    value={formData.actualPrice}
                    onChange={(e) => handleChange("actualPrice", e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Qté Minimum</label>
                  <Input 
                    type="number" 
                    min="1"
                    value={formData.minPurchaseNumber}
                    onChange={(e) => handleChange("minPurchaseNumber", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes / Remarques</label>
                <Input 
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Informations supplémentaires (ex: délai, condition...)"
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Sélectionner un produit du fournisseur <span className="text-red-500">*</span></label>
              <SearchableSelect
                value={formData.idSupplierProduct}
                onChange={(val) => handleChange("idSupplierProduct", val.toString())}
                options={supplierProductOptions}
                placeholder="Produit fournisseur existant..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Choisissez parmi les produits déjà enregistrés pour ce fournisseur.
              </p>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="text-sm font-medium">Lier à l'article interne <span className="text-red-500">*</span></label>
            <SearchableSelect
              value={formData.idItem}
              onChange={(val) => handleChange("idItem", val.toString())}
              options={itemOptions}
              placeholder="Sélectionner un article de votre base..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              C'est ce nom qui s'affichera dans vos commandes.
            </p>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.idItem || (mode === "create" ? !formData.name : !formData.idSupplierProduct)}>
              {isSubmitting ? "Enregistrement..." : (mode === "create" ? "Créer et Lier" : "Lier le produit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
