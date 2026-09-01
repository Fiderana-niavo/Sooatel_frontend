import { Building2, Mail, MapPin, Package, Plus, Link2, DollarSign, AlertCircle, RefreshCw, Edit2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Badge } from "@/components/ui/Badge/badge";
import type { Supplier, SupplierProduct } from "../../types/supplier.type";
import { SupplierBalancePanel } from "../SuppliersPage/SupplierBalancePanel";
import Pagination from "@/components/ui/Pagination/pagination";
import { useQuery } from "@tanstack/react-query";
import { supplierPaymentService } from "../../../purchases/services/supplier-payment.service";

interface SupplierProductsListProps {
  selectedSupplier: Supplier | null;
  products: SupplierProduct[];
  loadingProducts: boolean;
  totalProducts: number;
  productPage: number;
  onPageChange: (page: number) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onNewProduct: () => void;
  onEditProduct: (product: SupplierProduct) => void;
  onPriceProduct: (product: SupplierProduct, actionType: "change" | "fix") => void;
  onLinkProduct: (product: SupplierProduct) => void;
  onPaySupplier: (supplier: Supplier) => void;
  onBack: () => void;
}

export function SupplierProductsList({
  selectedSupplier,
  products,
  loadingProducts,
  totalProducts,
  productPage,
  onPageChange,
  onEditSupplier,
  onNewProduct,
  onEditProduct,
  onPriceProduct,
  onLinkProduct,
  onPaySupplier,
  onBack,
}: SupplierProductsListProps) {
  const balanceQuery = useQuery({
    queryKey: ["supplierBalance", selectedSupplier?.idSupplier],
    queryFn: async () => {
      if (!selectedSupplier) return null;
      const res = await supplierPaymentService.getSupplierBalance(selectedSupplier.idSupplier);
      return res.data.payload as { credit: number; debit: number; balance: number };
    },
    enabled: !!selectedSupplier
  });

  const hasDebt = (balanceQuery.data?.balance ?? 0) < 0;

  if (!selectedSupplier) {
    return (
      <div className="w-full md:w-2/3 flex-col bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm relative hidden md:flex">
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
    <div className={`w-full md:w-2/3 flex-col bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm relative ${!selectedSupplier ? 'hidden md:flex' : 'flex'}`}>
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border/50 bg-muted/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden -ml-2 text-muted-foreground">
                <ChevronRight size={24} className="rotate-180" />
              </Button>
              <h1 className="text-xl md:text-2xl font-bold">{selectedSupplier.name}</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 md:ml-0 ml-10">
              {selectedSupplier.email && <span className="flex items-center gap-1"><Mail size={14} /> {selectedSupplier.email}</span>}
              {selectedSupplier.address && <span className="flex items-center gap-1"><MapPin size={14} /> {selectedSupplier.address}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto mt-2 md:mt-0">
            <Button variant="default" size="sm" onClick={() => onPaySupplier(selectedSupplier)} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700">
              <DollarSign size={16} className="mr-1.5" /> {hasDebt ? "Payer" : "Acompte"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEditSupplier(selectedSupplier)} className="flex-1 md:flex-none">
              Modifier
            </Button>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="p-6 flex-1 overflow-y-auto">
        <SupplierBalancePanel idSupplier={selectedSupplier.idSupplier} />

        <div className="flex items-center justify-between mb-4 mt-8">
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
              <div key={p.idSupplierProduct} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background hover:border-primary/30 transition-colors group gap-4">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-base truncate">{p.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-sm mt-1.5 text-muted-foreground">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-2.5 py-0.5">
                      {p.actualPrice.toLocaleString()} Ar
                    </Badge>
                    <span className="text-xs bg-muted/50 px-2 py-1 rounded-md border border-border/50">Min: {p.minPurchaseNumber}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:flex md:opacity-0 md:group-hover:opacity-100 transition-opacity gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="h-8 border-purple-200 text-purple-600 bg-purple-50 justify-start px-2.5" onClick={() => onLinkProduct(p)} title="Liaison article">
                    <Link2 size={14} className="mr-1.5" /> Liaison
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-600 bg-blue-50 justify-start px-2.5" onClick={() => onPriceProduct(p, "change")} title="Nouveau prix">
                    <DollarSign size={14} className="mr-1.5" /> Prix
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 border-orange-200 text-orange-600 bg-orange-50 justify-start px-2.5" onClick={() => onPriceProduct(p, "fix")} title="Corriger erreur">
                    <AlertCircle size={14} className="mr-1.5" /> Erreur
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 justify-start px-2.5" onClick={() => onEditProduct(p)} title="Modifier">
                    <Edit2 size={14} className="mr-1.5" /> Modifier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loadingProducts && products.length > 0 && totalProducts > 10 && (
          <div className="mt-4 border-t border-border/50 pt-4">
            <Pagination
              currentPage={productPage}
              totalPages={Math.ceil(totalProducts / 10)}
              onPageChange={onPageChange}
            />
          </div>
        )}

        <SupplierBalancePanel idSupplier={selectedSupplier.idSupplier} />
      </div>
    </div>
  );
}
