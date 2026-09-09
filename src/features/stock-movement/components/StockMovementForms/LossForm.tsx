import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Flame, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import { ItemService } from "@/features/items/services/item.service";
import { inventoryService } from "@/features/inventory/services/inventory.service";
import type { LossDto } from "@/features/inventory/types/inventory.type";

import { LOSS_REASONS } from "../../constants/stock-movement.constant";

interface Props {
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const emptyForm = (): LossDto => ({
  idItem: "",
  quantity: "" as unknown as number,
  reason: "",
  movementDate: new Date().toISOString().slice(0, 16),
});

export function LossForm({ onClose, onSuccess, onError }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState<LossDto>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");

  const itemsResult = useQuery({
    queryKey: ["items", "loss-form"],
    queryFn: () => ItemService.getAll({ limit: 500 }),
  });

  const items = itemsResult.data ?? [];

  const setField = <K extends keyof LossDto>(key: K, val: LossDto[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const selectedItem = items.find((it) => it.idItem === form.idItem);

  const mutation = useMutation({
    mutationFn: () => {
      const finalReason = form.reason === "Autre" ? customReason : form.reason;
      return inventoryService.recordLoss({
        ...form,
        quantity: Number(form.quantity),
        reason: `Perte : ${finalReason}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["stock-movements"] });
      onSuccess("Perte enregistrée. Stock mis à jour.");
      onClose();
    },
    onError: (err: Error) => onError(err.message),
  });

  const handleSubmit = () => {
    if (!form.idItem || !form.quantity || !form.reason || !form.movementDate) {
      setFormError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (form.reason === "Autre" && !customReason.trim()) {
      setFormError("Veuillez préciser le motif de perte.");
      return;
    }
    
    if (Number(form.quantity) <= 0) {
        setFormError("La quantité doit être supérieure à 0.");
        return;
    }

    setFormError(null);
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[480px] bg-background border-l border-border/50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Flame className="size-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Enregistrer une perte</h3>
              <p className="text-xs text-muted-foreground">La perte sera validée immédiatement</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Article *</label>
            <SearchableSelect
              options={items.map((it) => ({
                value: it.idItem,
                label: `${it.label} — Stock : ${Number(it.quantity ?? 0).toLocaleString()} ${it.unit?.symbol ?? ""}`,
              }))}
              value={form.idItem}
              onChange={(val) => setField("idItem", String(val))}
              placeholder="Sélectionner un article"
            />
            {selectedItem && (
              <p className="text-xs text-muted-foreground">
                Stock disponible :{" "}
                <span className="font-semibold text-foreground">
                  {Number(selectedItem.quantity ?? 0).toLocaleString()} {selectedItem.unit?.symbol ?? ""}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Quantité perdue *</label>
            <Input
              type="number"
              min={1}
              placeholder="0"
              value={form.quantity === ("" as unknown as number) ? "" : form.quantity}
              onChange={(e) =>
                setField("quantity", e.target.value === "" ? ("" as unknown as number) : Number(e.target.value))
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Motif de perte *</label>
            <SearchableSelect
              options={LOSS_REASONS.map((r) => ({ value: r, label: r }))}
              value={form.reason}
              onChange={(val) => setField("reason", String(val))}
              placeholder="Sélectionner un motif"
            />
            {form.reason === "Autre" && (
              <Input
                placeholder="Précisez le motif..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="mt-1"
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Date & Heure</label>
            <Input
              type="datetime-local"
              value={form.movementDate}
              onChange={(e) => setField("movementDate", e.target.value)}
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm text-orange-700">
            <AlertTriangle className="size-4 mt-0.5 shrink-0" />
            <span>La perte est enregistrée et validée immédiatement. Cette action ne peut pas être annulée.</span>
          </div>

          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600">
              {formError}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-border/50 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
            Annuler
          </Button>
          <Button
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
            Enregistrer la perte
          </Button>
        </div>
      </div>
    </div>
  );
}
