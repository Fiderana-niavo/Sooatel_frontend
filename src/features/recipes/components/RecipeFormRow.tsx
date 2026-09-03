import React from "react";
import { Trash2, Plus } from "lucide-react";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import { Input } from "@/components/ui/Inputs/input";
import type { Item } from "@/features/items";
import type { ItemUnit } from "@/features/items/types/item-unit.type";

export interface RecipeRow {
  idIngredient: string;
  quantity: string;
  idItemUnit: string | null;
}

interface Props {
  row: RecipeRow;
  index: number;
  items: Item[];
  itemUnits: ItemUnit[];
  onChange: (index: number, field: keyof RecipeRow, value: string | null) => void;
  onRemove: (index: number) => void;
  onAddAlternativeUnit?: (idIngredient: string) => void;
}

export const RecipeFormRow: React.FC<Props> = ({ row, index, items, itemUnits, onChange, onRemove, onAddAlternativeUnit }) => {
  const selectedItem = items.find((i) => i.idItem === row.idIngredient);

  const unitOptions = [
    ...(selectedItem
      ? [{ value: "", label: `${selectedItem.unit?.symbol ?? "unité par défaut"} (stock)` }]
      : []),
    ...itemUnits
      .filter((u) => u.idItem === row.idIngredient)
      .map((u) => ({
        value: u.idItemUnit,
        label: u.alternativeUnit?.symbol ?? u.idItemUnit,
      })),
  ];

  const ingredientOptions = items.map((i) => ({
    value: i.idItem,
    label: `${i.label}${i.unit ? ` (${i.unit.symbol})` : ""}`,
  }));

  return (
    <div className="grid grid-cols-[1fr_180px_140px_36px] gap-2 items-start">
      <div>
        <SearchableSelect
          value={row.idIngredient}
          onChange={(val) => {
            onChange(index, "idIngredient", val.toString());
            onChange(index, "idItemUnit", null);
          }}
          options={ingredientOptions}
          placeholder="Ingrédient..."
        />
      </div>
      <div className="flex gap-1 items-center">
        <SearchableSelect
          value={row.idItemUnit ?? ""}
          onChange={(val) => onChange(index, "idItemUnit", val === "" ? null : val.toString())}
          options={unitOptions}
          placeholder="Unité..."
          disabled={!row.idIngredient}
          className="flex-1"
        />
        <button
          type="button"
          disabled={!row.idIngredient}
          onClick={() => onAddAlternativeUnit && onAddAlternativeUnit(row.idIngredient)}
          className="p-1.5 shrink-0 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Ajouter une unité alternative"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <div>
        <Input
          type="number"
          min="0"
          step="any"
          value={row.quantity}
          onChange={(e) => onChange(index, "quantity", e.target.value)}
          placeholder="Quantité"
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="mt-1 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
};
