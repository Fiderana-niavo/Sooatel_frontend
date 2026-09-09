import { useQuery } from "@tanstack/react-query";
import { Loader2, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/Inputs/input";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import type { Item } from "@/features/items/types/item.type";
import { ItemTypeService } from "@/features/item-types/services";
import Pagination from "@/components/ui/Pagination/pagination";

export interface StockOverviewFilters {
  page: number;
  limit: number;
  search?: string;
  idProductType?: string;
}

interface Props {
  records: Item[];
  total: number;
  isLoading: boolean;
  filters: StockOverviewFilters;
  onFiltersChange: (filters: Partial<StockOverviewFilters>) => void;
}

export function StockOverviewList({
  records,
  total,
  isLoading,
  filters,
  onFiltersChange,
}: Props) {
  const typesResult = useQuery({
    queryKey: ["item-types"],
    queryFn: () => ItemTypeService.getAll(),
  });

  const types = typesResult.data ?? [];

  const typeOptions = [
    { value: "", label: "Tous les types" },
    ...types.map((t) => ({ value: t.idProductType, label: t.label })),
  ];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-3 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par référence ou nom d'article..."
            value={filters.search ?? ""}
            onChange={(e) =>
              onFiltersChange({ search: e.target.value || undefined, page: 1 })
            }
            className="pl-9"
          />
        </div>
        <div className="w-56">
          <SearchableSelect
            options={typeOptions}
            value={filters.idProductType ?? ""}
            onChange={(val) =>
              onFiltersChange({ idProductType: val ? String(val) : undefined, page: 1 })
            }
            placeholder="Type d'article"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium w-12"></th>
              <th className="px-4 py-3 font-medium">Référence</th>
              <th className="px-4 py-3 font-medium">Article</th>
              <th className="px-4 py-3 font-medium text-right">Quantité en Stock</th>
              <th className="px-4 py-3 font-medium text-right">Seuil d'alerte</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <Loader2 className="size-6 animate-spin mx-auto text-primary" />
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  Aucun article trouvé.
                </td>
              </tr>
            ) : (
              records.map((item) => {
                const stock = Number(item.quantity ?? 0);
                const threshold = Number(item.minimumStockLevel ?? 0);
                const isLowStock = stock <= threshold;

                return (
                  <tr
                    key={item.idItem}
                    className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className={`p-2 rounded-lg w-fit ${isLowStock ? 'bg-red-500/10 text-red-600' : 'bg-primary/10 text-primary'}`}>
                        <Package className="size-4" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{item.ref}</td>
                    <td className="px-4 py-3">{item.label}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                        {stock.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground text-xs ml-1">
                        {item.unit?.symbol ?? ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {threshold.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        <Pagination
          currentPage={filters.page}
          totalPages={Math.ceil(total / filters.limit)}
          onPageChange={(p) => onFiltersChange({ page: p })}
        />
      </div>
    </div>
  );
}


