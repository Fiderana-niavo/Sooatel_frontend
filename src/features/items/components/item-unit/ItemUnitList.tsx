import { Button } from "@/components/ui/Button/button";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/Inputs/input";
import { ItemUnitFormDialog } from "./ItemUnitFormDialog";
import type { Item } from "../../types/item.type";
import type {
  ItemUnit,
  CreateItemUnitDto,
  UpdateItemUnitDto,
} from "../../types/item-unit.type";
import type { UnitOfMeasure } from "../../../unit-of-measures/types";

interface ItemUnitListProps {
  data: ItemUnit[];
  items: Item[];
  units: UnitOfMeasure[];
  onAdd: (data: CreateItemUnitDto) => void;
  onEdit: (id: string, data: UpdateItemUnitDto) => void;
  onDelete: (id: string) => void;
}

export function ItemUnitList({
  data: itemUnits,
  items,
  units,
  onAdd,
  onEdit,
  onDelete,
}: ItemUnitListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRatio, setEditRatio] = useState<string>("");

  const handleSaveEdit = (id: string) => {
    if (!editRatio || isNaN(Number(editRatio))) return;
    onEdit(id, { toStockRatio: Number(editRatio) });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 shrink-0 rounded-xl bg-primary/90 hover:bg-primary"
          >
            <Plus className="size-4" />
            Nouvelle Unité
          </Button>
        </div>
      </div>

      {itemUnits.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-dashed text-center">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <Plus className="size-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            Aucune unité alternative
          </h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Vous n'avez pas encore défini de ratios de conversion pour vos
            articles.
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            className="rounded-xl"
          >
            Ajouter une unité
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed text-xs md:text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-[11px] md:text-xs uppercase font-semibold">
                <tr>
                  <th className="px-3 md:px-4 py-3 rounded-tl-2xl w-[38%]">Article</th>
                  <th className="px-3 md:px-4 py-3 w-[28%]">Unité alternative</th>
                  <th className="px-3 md:px-4 py-3 w-[22%]">Ratio (vers stock)</th>
                  <th className="px-2 md:px-3 py-3 text-right rounded-tr-2xl w-[12%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {itemUnits.map((iu) => (
                  <tr
                    key={iu.idItemUnit}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 md:px-4 py-2.5 md:py-3 font-medium text-foreground truncate" title={iu.item?.label}>
                      {iu.item?.label || "Article inconnu"}
                    </td>
                    <td className="px-3 md:px-4 py-2.5 md:py-3 truncate">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20 truncate max-w-full">
                        {iu.alternativeUnit?.label}{" "}
                        {iu.alternativeUnit?.symbol &&
                          `(${iu.alternativeUnit.symbol})`}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 md:py-3 font-mono font-semibold text-primary truncate">
                      {editingId === iu.idItemUnit ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground text-xs">x</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-20 h-7 text-xs"
                            value={editRatio}
                            onChange={(e) => setEditRatio(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleSaveEdit(iu.idItemUnit);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        `x ${Number(iu.toStockRatio)}`
                      )}
                    </td>
                    <td className="px-2 md:px-3 py-2.5 md:py-3 text-right">
                      {editingId === iu.idItemUnit ? (
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-600 hover:bg-green-600/10 rounded-full size-7 md:size-8"
                            onClick={() => handleSaveEdit(iu.idItemUnit)}
                            title="Enregistrer"
                          >
                            <Check className="size-3.5 md:size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full size-7 md:size-8"
                            onClick={() => setEditingId(null)}
                            title="Annuler"
                          >
                            <X className="size-3.5 md:size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-70 group-hover:opacity-100 hover:opacity-100 text-primary hover:text-primary hover:bg-primary/10 rounded-full transition-opacity size-7 md:size-8"
                            onClick={() => {
                              setEditingId(iu.idItemUnit);
                              setEditRatio(Number(iu.toStockRatio).toString());
                            }}
                            title="Modifier"
                          >
                            <Pencil className="size-3.5 md:size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-70 group-hover:opacity-100 hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full transition-opacity size-7 md:size-8"
                            onClick={() => onDelete(iu.idItemUnit)}
                            title="Supprimer"
                          >
                            <Trash2 className="size-3.5 md:size-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ItemUnitFormDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        items={items}
        units={units}
        onAdd={(data) => {
          onAdd(data);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
