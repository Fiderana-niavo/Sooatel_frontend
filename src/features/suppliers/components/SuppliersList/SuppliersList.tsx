import { Building2, Search, Phone, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import Pagination from "@/components/ui/Pagination/pagination";
import type { Supplier } from "../../types/supplier.type";

interface SuppliersListProps {
  suppliers: Supplier[];
  loadingSuppliers: boolean;
  totalSuppliers: number;
  supplierPage: number;
  supplierSearch: string;
  onSearchChange: (val: string) => void;
  onPageChange: (val: number) => void;
  selectedSupplier: Supplier | null;
  onSelectSupplier: (supplier: Supplier) => void;
  onNewSupplier: () => void;
}

export function SuppliersList({
  suppliers,
  loadingSuppliers,
  totalSuppliers,
  supplierPage,
  supplierSearch,
  onSearchChange,
  onPageChange,
  selectedSupplier,
  onSelectSupplier,
  onNewSupplier,
}: SuppliersListProps) {
  return (
    <div className="w-1/3 flex flex-col bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Building2 className="text-primary" size={20} /> Fournisseurs
          </h2>
          <Button size="sm" onClick={onNewSupplier}>
            <Plus size={16} className="mr-1" /> Nouveau
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Rechercher..." 
            className="pl-9 h-9" 
            value={supplierSearch}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loadingSuppliers ? (
          <div className="flex justify-center p-8"><RefreshCw className="animate-spin text-muted-foreground" size={24} /></div>
        ) : suppliers.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">Aucun fournisseur trouvé</div>
        ) : (
          suppliers.map(s => (
            <div 
              key={s.idSupplier}
              onClick={() => onSelectSupplier(s)}
              className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${selectedSupplier?.idSupplier === s.idSupplier ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted/50'}`}
            >
              <div>
                <h3 className="font-semibold text-sm">{s.name}</h3>
                <div className={`text-xs flex items-center gap-2 mt-1 ${selectedSupplier?.idSupplier === s.idSupplier ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  <span className="flex items-center gap-1"><Phone size={12}/> {s.phoneNumber || '-'}</span>
                </div>
              </div>
              <ChevronRight size={18} className={selectedSupplier?.idSupplier === s.idSupplier ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground transition-colors'} />
            </div>
          ))
        )}
      </div>
      
      {totalSuppliers > 10 && (
        <div className="p-2 border-t border-border/50 bg-muted/10">
           <Pagination 
              currentPage={supplierPage} 
              totalPages={Math.ceil(totalSuppliers / 10)} 
              onPageChange={onPageChange} 
           />
        </div>
      )}
    </div>
  );
}
