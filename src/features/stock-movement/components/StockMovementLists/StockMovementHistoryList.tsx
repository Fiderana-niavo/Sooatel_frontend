import { useState, useEffect } from "react";
import { Loader2, ArrowDownCircle, ArrowUpCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import { ItemService } from "@/features/items/services/item.service";
import type { Item } from "@/features/items/types/item.type";
import type { StockMovement, StockMovementFilters } from "../../types/stock-movement.type";
import Pagination from "@/components/ui/Pagination/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/dialog";

const selectClass =
  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const directionBadge = (isOut: boolean) =>
  `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
    isOut
      ? "bg-red-500/10 text-red-600"
      : "bg-green-500/10 text-green-600"
  }`;

interface Props {
  records: StockMovement[];
  total: number;
  isLoading: boolean;
  filters: StockMovementFilters;
  onFiltersChange: (f: Partial<StockMovementFilters>) => void;
}

export function StockMovementHistoryList({ records, total, isLoading, filters, onFiltersChange }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  useEffect(() => {
    ItemService.getAll({ limit: 500 }).then(setItems).catch(() => {});
  }, []);

  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="flex flex-col gap-4">
      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-end p-4 bg-muted/30 rounded-xl border border-border/50">
        <Filter className="size-4 text-muted-foreground mt-auto mb-2.5" />

        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-xs text-muted-foreground font-medium">Article</label>
          <SearchableSelect
            options={[{ value: "", label: "Tous les articles" }, ...items.map(it => ({ value: it.idItem, label: it.label }))]}
            value={filters.idItem ?? ""}
            onChange={(val) => onFiltersChange({ idItem: val ? String(val) : undefined, page: 1 })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">Sens</label>
          <select
            className={selectClass + " min-w-[130px]"}
            value={filters.direction ?? ""}
            onChange={(e) => onFiltersChange({ direction: e.target.value !== "" ? Number(e.target.value) : undefined, page: 1 })}
          >
            <option value="">Tous</option>
            <option value="5">Entrée</option>
            <option value="-5">Sortie</option>
          </select>
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
          onClick={() => onFiltersChange({ idItem: undefined, direction: undefined, startDate: undefined, endDate: undefined, page: 1 })}
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
              <th className="px-4 py-3 font-medium">Sens</th>
              <th className="px-4 py-3 font-medium">Article</th>
              <th className="px-4 py-3 font-medium text-right">Quantité</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Opérateur</th>
              <th className="px-4 py-3 font-medium">Raison</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun mouvement dans l&apos;historique
                </td>
              </tr>
            ) : (
              records.map((m) => {
                const isOut = m.direction === -5;
                return (
                  <tr key={m.idStockMovement} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.ref}</td>
                    <td className="px-4 py-3">
                      <span className={directionBadge(isOut)}>
                        {isOut ? <ArrowDownCircle className="size-3" /> : <ArrowUpCircle className="size-3" />}
                        {isOut ? "Sortie" : "Entrée"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{m.item?.label ?? "-"}</span>
                      {m.item?.ref && <span className="text-xs text-muted-foreground ml-1">({m.item.ref})</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {Number(m.quantity).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {m.movementDate ? new Date(m.movementDate).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {m.operator ? `${m.operator.name} ${m.operator.lastname}` : "-"}
                    </td>
                    <td className="px-4 py-3 max-w-[250px] text-muted-foreground">
                      {m.reason ? (
                        m.reason.length > 30 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="truncate" title={m.reason}>
                              {m.reason.substring(0, 30)}...
                            </span>
                            <button
                              onClick={() => setSelectedReason(m.reason)}
                              className="text-xs text-primary hover:underline whitespace-nowrap"
                            >
                              Voir plus
                            </button>
                          </div>
                        ) : (
                          m.reason
                        )
                      ) : (
                        "-"
                      )}
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
          totalPages={totalPages}
          onPageChange={(p) => onFiltersChange({ page: p })}
        />
      </div>

      <Dialog open={!!selectedReason} onOpenChange={(open) => !open && setSelectedReason(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motif du mouvement</DialogTitle>
          </DialogHeader>
          <div className="mt-2 text-sm text-foreground bg-muted/30 p-4 rounded-lg border border-border/50 whitespace-pre-wrap leading-relaxed">
            {selectedReason}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
