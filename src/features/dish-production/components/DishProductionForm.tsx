import { toIsoDateTime } from "@/utils/date";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, ChefHat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import { ItemService } from "@/features/items/services/item.service";
import type { DishProductionDto } from "../types";



interface Props {
  initial?: Partial<DishProductionDto> & { idDishProduction?: string };
  onClose: () => void;
  onSave: (dto: DishProductionDto) => Promise<void>;
}

const emptyForm = (): DishProductionDto => ({
  idItem: "",
  quantity: "" as unknown as number,
  notes: "",
  productionDate: toIsoDateTime(new Date()),
});

export function DishProductionForm({ initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<DishProductionDto>(
    initial
      ? {
          idItem: initial.idItem ?? "",
          quantity: initial.quantity ?? ("" as unknown as number),
          notes: initial.notes ?? "",
          productionDate: initial.productionDate
            ? toIsoDateTime(new Date(initial.productionDate))
            : toIsoDateTime(new Date()),
        }
      : emptyForm()
  );

  const { data: allItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["items", "dish-production-form"],
    queryFn: () => ItemService.getAll({ limit: 500 }),
  });
  const items = allItems.filter(it => it.isProduced !== false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initial?.idDishProduction;

  const setField = <K extends keyof DishProductionDto>(key: K, val: DishProductionDto[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.idItem) { setError("Veuillez sélectionner un article à produire."); return; }
    if (!form.quantity || Number(form.quantity) <= 0) { setError("La quantité doit être supérieure à 0."); return; }
    setError(null);
    setIsSaving(true);
    try {
      await onSave({ ...form, quantity: Number(form.quantity) });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'enregistrement";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[480px] bg-background border-l border-border/50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ChefHat className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {isEditing ? "Modifier la production" : "Saisir une production"}
              </h3>
              <p className="text-xs text-muted-foreground">Enregistrée d'abord en brouillon</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Item */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Plat / Article produit *</label>
            <SearchableSelect
              options={itemsLoading ? [{ value: "", label: "Chargement..." }] : items.map((it) => ({
                value: it.idItem,
                label: `${it.label} ${it.unit?.symbol ? `(${it.unit.symbol})` : ""}`,
              }))}
              value={form.idItem}
              onChange={(val) => setField("idItem", String(val))}
              placeholder="Sélectionner un article"
              disabled={isEditing}
            />
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Quantité produite *</label>
            <Input
              type="number"
              min={0.1}
              step="any"
              placeholder="0"
              value={form.quantity === ("" as unknown as number) ? "" : form.quantity}
              onChange={(e) =>
                setField(
                  "quantity",
                  e.target.value === "" ? ("" as unknown as number) : Number(e.target.value)
                )
              }
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Date & Heure de production</label>
            <Input
              type="datetime-local"
              value={form.productionDate}
              onChange={(e) => setField("productionDate", e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Notes (Optionnel)</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Remarque éventuelle sur cette production..."
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border/50 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
            {isEditing ? "Modifier" : "Enregistrer (Brouillon)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
