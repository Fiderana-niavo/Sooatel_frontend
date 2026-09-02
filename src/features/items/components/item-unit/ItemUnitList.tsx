import { Button } from "@/components/ui/Button/button";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/Inputs/input";
import { ItemUnitFormDialog } from "./ItemUnitFormDialog";
import type { Item } from "../../types/item.type";
import type { ItemUnit, CreateItemUnitDto, UpdateItemUnitDto } from "../../types/item-unit.type";
import type { UnitOfMeasure } from "../../../unit-of-measures/types";

interface ItemUnitListProps {
  data: ItemUnit[];
  items: Item[];
  units: UnitOfMeasure[];
  onAdd: (data: CreateItemUnitDto) => void;
  onEdit: (id: string, data: UpdateItemUnitDto) => void;
  onDelete: (id: string) => void;
}

export function ItemUnitList({ data: itemUnits, items, units, onAdd, onEdit, onDelete }: ItemUnitListProps) {
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

          <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0 rounded-xl bg-primary/90 hover:bg-primary">
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
          <h3 className="text-lg font-semibold mb-1">Aucune unité alternative</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Vous n'avez pas encore défini de ratios de conversion pour vos articles.
          </p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline" className="rounded-xl">
            Ajouter une unité
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Article</th>
                  <th className="px-6 py-4">Unité alternative</th>
                  <th className="px-6 py-4">Ratio (vers stock)</th>
                  <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {itemUnits.map((iu) => (
                  <tr key={iu.idItemUnit} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {iu.item?.label || "Article inconnu"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                        {iu.alternativeUnit?.label} {iu.alternativeUnit?.symbol && `(${iu.alternativeUnit.symbol})`}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-primary">
                      {editingId === iu.idItemUnit ? (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">x</span>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-24 h-8"
                            value={editRatio}
                            onChange={(e) => setEditRatio(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(iu.idItemUnit);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        `x ${Number(iu.toStockRatio)}`
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {editingId === iu.idItemUnit ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-600 hover:bg-green-600/10 rounded-full"
                            onClick={() => handleSaveEdit(iu.idItemUnit)}
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="size-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary hover:text-primary hover:bg-primary/10 rounded-full"
                            onClick={() => {
                              setEditingId(iu.idItemUnit);
                              setEditRatio(Number(iu.toStockRatio).toString());
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                            onClick={() => onDelete(iu.idItemUnit)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </>
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
