import { Building2, Mail, MapPin, Package, Plus, Link2, DollarSign, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Badge } from "@/components/ui/Badge/badge";
import type { Supplier, SupplierProduct } from "../../types/supplier.type";

interface SupplierProductsListProps {
  selectedSupplier: Supplier | null;
  products: SupplierProduct[];
  loadingProducts: boolean;
  onEditSupplier: (supplier: Supplier) => void;
  onNewProduct: () => void;
  onEditProduct: (product: SupplierProduct) => void;
  onPriceProduct: (product: SupplierProduct, actionType: "change" | "fix") => void;
  onLinkProduct: (product: SupplierProduct) => void;
}

export function SupplierProductsList({
  selectedSupplier,
  products,
  loadingProducts,
  onEditSupplier,
  onNewProduct,
  onEditProduct,
  onPriceProduct,
  onLinkProduct,
}: SupplierProductsListProps) {
  if (!selectedSupplier) {
    return (
      <div className="w-2/3 flex flex-col bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm relative">
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <Building2 size={32} className="text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium">Sélectionnez un fournisseur</p>
          <p className="text-sm">Pour voir ses produits et détails</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-2/3 flex flex-col bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm relative">
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-muted/10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{selectedSupplier.name}</h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
              {selectedSupplier.email && <span className="flex items-center gap-1"><Mail size={14}/> {selectedSupplier.email}</span>}
              {selectedSupplier.address && <span className="flex items-center gap-1"><MapPin size={14}/> {selectedSupplier.address}</span>}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEditSupplier(selectedSupplier)}>
            Modifier
          </Button>
        </div>
      </div>

      {/* Products List */}
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="text-primary" size={20} /> 
            Produits fournis
          </h3>
          <Button size="sm" onClick={onNewProduct}>
            <Plus size={16} className="mr-1" /> Ajouter Produit
          </Button>
        </div>

        {loadingProducts ? (
          <div className="flex justify-center p-8"><RefreshCw className="animate-spin text-muted-foreground" size={24} /></div>
        ) : products.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-border/50 rounded-xl text-muted-foreground">
            Ce fournisseur n'a pas encore de produits.
          </div>
        ) : (
          <div className="grid gap-3">
            {products.map(p => (
              <div key={p.idSupplierProduct} className="flex flex-col p-4 rounded-xl border border-border/50 bg-background hover:border-primary/30 transition-colors group">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-base">{p.name}</h4>
                    <div className="flex items-center gap-3 text-sm mt-1 text-muted-foreground">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        {p.actualPrice.toLocaleString()} Ar
                      </Badge>
                      <span>Min: {p.minPurchaseNumber}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline" className="h-8 border-purple-200 text-purple-600 bg-purple-50" onClick={() => onLinkProduct(p)}>
                      <Link2 size={14} className="mr-1" /> Liaison
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-600 bg-blue-50" onClick={() => onPriceProduct(p, "change")}>
                      <DollarSign size={14} className="mr-1" /> Prix
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 border-orange-200 text-orange-600 bg-orange-50" onClick={() => onPriceProduct(p, "fix")}>
                      <AlertCircle size={14} className="mr-1" /> Erreur
                    </Button>
                    <Button size="sm" variant="outline" className="h-8" onClick={() => onEditProduct(p)}>
                      Modifier
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
