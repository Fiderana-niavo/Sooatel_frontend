import { toIsoDateTime } from "@/utils/date";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import { ItemService } from "@/features/items/services/item.service";
import type { StockMovementDto } from "../../types/stock-movement.type";

const DIRECTION_IN = 5;
const DIRECTION_OUT = -5;



const headerIconClass = (isOut: boolean) =>
  `p-2 rounded-lg ${isOut ? "bg-red-500/10" : "bg-green-500/10"}`;

const toggleClass = (active: boolean, isOut: boolean) =>
  `flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
    active
      ? isOut
        ? "border-red-500 bg-red-500/5 text-red-600"
        : "border-green-500 bg-green-500/5 text-green-600"
      : "border-border hover:bg-muted"
  }`;

const submitBtnClass = (isOut: boolean) =>
  `flex-1 text-white ${isOut ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`;

interface Props {
  initial?: Partial<StockMovementDto> & { idStockMovement?: string };
  onClose: () => void;
  onSave: (dto: StockMovementDto) => Promise<void>;
}

const emptyForm = (direction: number): StockMovementDto => ({
  idItem: "",
  quantity: "" as unknown as number,
  direction,
  reason: "",
  movementDate: toIsoDateTime(new Date()),
});

export function StockMovementForm({ initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<StockMovementDto>(
    initial
      ? {
          idItem: initial.idItem ?? "",
          quantity: initial.quantity ?? ("" as unknown as number),
          direction: initial.direction ?? DIRECTION_OUT,
          reason: initial.reason ?? "",
          movementDate: initial.movementDate
            ? toIsoDateTime(new Date(initial.movementDate))
            : toIsoDateTime(new Date()),
        }
      : emptyForm(DIRECTION_OUT)
  );

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["items", "stock-movement-form"],
    queryFn: () => ItemService.getAll({ limit: 500 }),
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedItem = items.find((it) => it.idItem === form.idItem);
  const isEditing = !!initial?.idStockMovement;
  const isOut = form.direction === DIRECTION_OUT;

  const setField = <K extends keyof StockMovementDto>(key: K, val: StockMovementDto[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.idItem) { setError("Veuillez sélectionner un article."); return; }
    if (!form.quantity || Number(form.quantity) <= 0) { setError("La quantité doit être supérieure à 0."); return; }
    if (!form.reason.trim()) { setError("La raison est obligatoire."); return; }
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
            <div className={headerIconClass(isOut)}>
              {isOut
                ? <ArrowDownCircle className="size-5 text-red-500" />
                : <ArrowUpCircle className="size-5 text-green-500" />}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {isEditing ? "Modifier le mouvement" : "Nouveau mouvement de stock"}
              </h3>
              <p className="text-xs text-muted-foreground">Les mouvements sont créés en brouillon</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Direction toggle */}
          {!isEditing && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setField("direction", DIRECTION_OUT)}
                className={toggleClass(form.direction === DIRECTION_OUT, true)}
              >
                <ArrowDownCircle className="size-4" />
                Sortie
              </button>
              <button
                type="button"
                onClick={() => setField("direction", DIRECTION_IN)}
                className={toggleClass(form.direction === DIRECTION_IN, false)}
              >
                <ArrowUpCircle className="size-4" />
                Entrée
              </button>
            </div>
          )}

          {/* Item */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Article *</label>
            <SearchableSelect
              options={itemsLoading ? [{ value: "", label: "Chargement..." }] : items.map((it) => ({
                value: it.idItem,
                label: `${it.label} — Stock actuel : ${Number(it.quantity ?? 0).toLocaleString()} ${it.unit?.symbol ?? ""}`,
              }))}
              value={form.idItem}
              onChange={(val) => setField("idItem", String(val))}
              placeholder="Sélectionner un article"
              disabled={isEditing}
            />
            {selectedItem && (
              <p className="text-xs text-muted-foreground">
                Stock disponible : <span className="font-semibold text-foreground">
                  {Number(selectedItem.quantity ?? 0).toLocaleString()} {selectedItem.unit?.symbol ?? ""}
                </span>
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Quantité *</label>
            <Input
              type="number"
              min={1}
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

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Raison *</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder={isOut ? "Ex: Consommation interne, casse, correction..." : "Ex: Stock initial, entrée exceptionnelle..."}
              value={form.reason}
              onChange={(e) => setField("reason", e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Date & Heure</label>
            <Input
              type="datetime-local"
              value={form.movementDate}
              onChange={(e) => setField("movementDate", e.target.value)}
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
            className={submitBtnClass(isOut)}
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
            {isEditing ? "Modifier" : "Enregistrer en brouillon"}
          </Button>
        </div>
      </div>
    </div>
  );
}
