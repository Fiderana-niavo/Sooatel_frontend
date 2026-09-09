import { useState, useEffect } from "react";
import { Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import { ItemService } from "@/features/items/services/item.service";
import type { Item } from "@/features/items/types/item.type";
import type { DishProduction, DishProductionFilters } from "../types";



interface Props {
  records: DishProduction[];
  total: number;
  isLoading: boolean;
  filters: DishProductionFilters;
  onFiltersChange: (f: Partial<DishProductionFilters>) => void;
}

export function DishProductionHistoryList({ records, total, isLoading, filters, onFiltersChange }: Props) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    ItemService.getAll({ limit: 500 }).then((data) => {
      setItems(data.filter(it => it.isProduced !== false));
    }).catch(() => {});
  }, []);

  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="flex flex-col gap-4">
      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-end p-4 bg-muted/30 rounded-xl border border-border/50">
        <Filter className="size-4 text-muted-foreground mt-auto mb-2.5" />

        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-xs text-muted-foreground font-medium">Plat / Article</label>
          <SearchableSelect
            options={[{ value: "", label: "Tous les articles" }, ...items.map(it => ({ value: it.idItem, label: it.label }))]}
            value={filters.idItem ?? ""}
            onChange={(val) => onFiltersChange({ idItem: val ? String(val) : undefined, page: 1 })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">Date début</label>
          <Input
            type="date"
            className="w-36"
            value={filters.startDate ?? ""}
            onChange={(e) => onFiltersChange({ startDate: e.target.value || undefined, page: 1 })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">Date fin</label>
          <Input
            type="date"
            className="w-36"
            value={filters.endDate ?? ""}
            onChange={(e) => onFiltersChange({ endDate: e.target.value || undefined, page: 1 })}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onFiltersChange({ idItem: undefined, startDate: undefined, endDate: undefined, page: 1 })}
        >
          Réinitialiser
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Réf</th>
              <th className="px-4 py-3 font-medium">Article Produit</th>
              <th className="px-4 py-3 font-medium text-right">Quantité</th>
              <th className="px-4 py-3 font-medium">Date de prod.</th>
              <th className="px-4 py-3 font-medium">Opérateur</th>
              <th className="px-4 py-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucune production dans l'historique
                </td>
              </tr>
            ) : (
              records.map((m) => (
                <tr key={m.idDishProduction} className="border-t hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.ref}</td>
                  <td className="px-4 py-3 font-medium">{m.item?.label ?? "-"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">
                    {Number(m.quantity).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {m.productionDate ? new Date(m.productionDate).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {m.operator ? `${m.operator.name} ${m.operator.lastname}` : "-"}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground" title={m.notes ?? ""}>
                    {m.notes || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {total === 0 ? "0 résultat" : `${Math.min((filters.page - 1) * filters.limit + 1, total)}–${Math.min(filters.page * filters.limit, total)} sur ${total}`}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={filters.page <= 1} onClick={() => onFiltersChange({ page: filters.page - 1 })}>
            Précédent
          </Button>
          <Button variant="outline" size="sm" disabled={filters.page >= totalPages} onClick={() => onFiltersChange({ page: filters.page + 1 })}>
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
