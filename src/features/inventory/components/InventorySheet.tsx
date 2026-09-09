import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, TrendingDown, TrendingUp, Minus, Loader2, CheckCircle, Package, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import { ItemService } from "@/features/items/services/item.service";
import { ItemTypeService } from "@/features/item-types/services";
import { inventoryService } from "../services/inventory.service";
import type { InventoryRow } from "../types/inventory.type";
import type { Item } from "@/features/items/types/item.type";
import Pagination from "@/components/ui/Pagination/pagination";

interface Props {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const gapClass = (gap: number | null) => {
  if (gap === null) return "";
  if (gap > 0) return "text-green-600 font-semibold";
  if (gap < 0) return "text-red-600 font-semibold";
  return "text-muted-foreground";
};

const GapIcon = ({ gap }: { gap: number | null }) => {
  if (gap === null || gap === 0) return <Minus className="size-3.5" />;
  return gap > 0
    ? <TrendingUp className="size-3.5 text-green-600" />
    : <TrendingDown className="size-3.5 text-red-600" />;
};

export function InventorySheet({ onSuccess, onError }: Props) {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "drafts">("all");
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: "", idProductType: "" });

  const [drafts, setDrafts] = useState<Record<string, InventoryRow>>({});
  const [submitted, setSubmitted] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(handler);
  }, [filters.search]);

  const itemsResult = useQuery({
    queryKey: ["items", "inventory-sheet", filters.page, filters.limit, debouncedSearch, filters.idProductType],
    queryFn: () => ItemService.getAllPaginated({
      page: filters.page,
      limit: filters.limit,
      search: debouncedSearch || undefined,
      idProductType: filters.idProductType || undefined,
    }),
    enabled: activeTab === "all",
  });

  const itemTypesResult = useQuery({
    queryKey: ["item-types"],
    queryFn: () => ItemTypeService.getAll(),
  });

  const itemTypeOptions = [
    { value: "", label: "Tous les types" },
    ...(itemTypesResult.data?.map(t => ({ value: t.idProductType, label: t.label })) ?? [])
  ];

  const setPhysical = (item: Item | InventoryRow, val: string) => {
    setDrafts((prev) => {
      const next = { ...prev };
      if (val === "") {
        delete next[item.idItem];
      } else {
        next[item.idItem] = {
          idItem: item.idItem,
          label: item.label,
          unit: "unit" in item && typeof item.unit === "object" && item.unit !== null ? (item.unit as any).symbol : (item as any).unit ?? "",
          theoretical: Number((item as any).quantity ?? (item as any).theoretical ?? 0),
          physical: Number(val),
          weightedAverageCost: Number((item as any).weightedAverageCost ?? 0),
        };
      }
      return next;
    });
  };

  const mutation = useMutation({
    mutationFn: () => {
      const lines = Object.values(drafts).map((r) => ({ idItem: r.idItem, physicalQty: Number(r.physical) }));
      return inventoryService.submitInventory(lines);
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["stock-movements"] });
      setSubmitted(true);
      onSuccess(`Inventaire soumis — ${result.adjusted} article(s) ajusté(s).`);
    },
    onError: (err: Error) => onError(err.message),
  });

  const dirtyCount = Object.keys(drafts).length;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <CheckCircle className="size-14 text-green-500" />
        <h3 className="text-xl font-semibold">Inventaire soumis avec succès</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Les ajustements de stock ont été créés automatiquement pour chaque article modifié.
        </p>
        <Button onClick={() => { setSubmitted(false); setDrafts({}); setActiveTab("all"); }}>
          Faire un nouvel inventaire
        </Button>
      </div>
    );
  }

  const renderRow = (row: InventoryRow | Item, isDraftRow: boolean) => {
    const theoretical = isDraftRow ? (row as InventoryRow).theoretical : Number((row as Item).quantity ?? 0);
    const draftValue = drafts[row.idItem]?.physical;
    const physicalStr = draftValue !== undefined ? String(draftValue) : "";
    const isModified = physicalStr !== "";

    const gap = physicalStr !== "" ? Number(physicalStr) - theoretical : null;
    const cmup = isDraftRow ? (row as InventoryRow).weightedAverageCost : Number((row as Item & { weightedAverageCost?: number }).weightedAverageCost ?? 0);

    let gapValue = gap !== null ? gap * cmup : null;
    if (gapValue === -0) gapValue = 0;

    const unitStr = isDraftRow ? (row as InventoryRow).unit : (row as Item).unit?.symbol ?? "";

    return (
      <tr
        key={row.idItem}
        className={`border-b border-border/30 transition-colors ${isModified ? "bg-blue-500/5" : "hover:bg-muted/30"
          }`}
      >
        <td className="px-4 py-3 font-medium">{row.label}</td>
        <td className="px-4 py-3 text-right text-muted-foreground">{unitStr}</td>
        <td className="px-4 py-3 text-right tabular-nums">
          {theoretical.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
        </td>
        <td className="px-4 py-3 text-right">
          <Input
            type="number"
            min={0}
            className="h-8 w-28 text-right tabular-nums ml-auto"
            placeholder={String(theoretical)}
            value={physicalStr}
            onChange={(e) => setPhysical(row, e.target.value)}
          />
        </td>
        <td className={`px-4 py-3 text-right tabular-nums ${gapClass(gap)}`}>
          <span className="flex items-center justify-end gap-1">
            <GapIcon gap={gap} />
            {gap !== null ? (gap > 0 ? "+" : "") + gap.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : "—"}
          </span>
        </td>
        <td className={`px-4 py-3 text-right tabular-nums ${gapClass(gap)}`}>
          {gapValue !== null
            ? (gapValue > 0 ? "+" : "") + gapValue.toLocaleString("fr-FR", { maximumFractionDigits: 0 })
            : "—"}
        </td>
      </tr>
    );
  };

  const records = itemsResult.data?.records ?? [];
  const total = itemsResult.data?.total ?? 0;
  const draftRows = Object.values(drafts);
  const filteredDrafts = draftRows.filter(r => r.label.toLowerCase().includes(filters.search.toLowerCase()));

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Package className="size-4" />
            Tous les articles
          </button>
          <button
            onClick={() => setActiveTab("drafts")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "drafts" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <ListChecks className="size-4" />
            Articles saisis
            {dirtyCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-700 text-xs font-semibold">
                {dirtyCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9 w-64 h-9"
              placeholder="Rechercher un article..."
              value={filters.search}
              onChange={(e) => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))}
            />
          </div>
          <div className="w-48">
            <SearchableSelect
              options={itemTypeOptions}
              value={filters.idProductType}
              onChange={(val) => setFilters(p => ({ ...p, idProductType: String(val), page: 1 }))}
              placeholder="Tous les types"
            />
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || dirtyCount === 0}
          >
            {mutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
            Soumettre l'inventaire
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Article</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Unité</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Stock théorique</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground w-36">Qté physique</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Écart</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valeur écart (MGA)</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === "all" ? (
              itemsResult.isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Aucun article trouvé.
                  </td>
                </tr>
              ) : (
                records.map((item) => renderRow(item, false))
              )
            ) : (
              filteredDrafts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Aucun article saisi.
                  </td>
                </tr>
              ) : (
                filteredDrafts.map((row) => renderRow(row, true))
              )
            )}
          </tbody>
        </table>
      </div>

      {activeTab === "all" && total > filters.limit && (
        <div className="mt-2 flex justify-center">
          <Pagination
            currentPage={filters.page}
            totalPages={Math.ceil(total / filters.limit)}
            onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))}
          />
        </div>
      )}
    </div>
  );
}
