import React, { useState, useEffect } from "react";
import { Plus, Pencil, CopyPlus } from "lucide-react";
import { cn } from "@/utils/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import { RecipeFormRow } from "./RecipeFormRow";
import type { RecipeRow } from "./RecipeFormRow";
import type { Item } from "@/features/items";
import type { ItemUnit } from "@/features/items/types/item-unit.type";
import type { Recipe, RecipeDetail } from "../types/recipe.type";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (idItem: string, details: RecipeRow[], yieldQuantity: number, createNewVersion?: boolean) => Promise<void>;
  items: Item[];
  itemUnits: ItemUnit[];
  editingRecipe?: Recipe | null;
  editingDetails?: RecipeDetail[];
  isSubmitting: boolean;
  onError: (msg: string) => void;
  onAddAlternativeUnit?: (idIngredient: string) => void;
}

const emptyRow = (): RecipeRow => ({ idIngredient: "", quantity: "", idItemUnit: null });

export const RecipeFormDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  items,
  itemUnits,
  editingRecipe,
  editingDetails,
  isSubmitting,
  onError,
  onAddAlternativeUnit,
}) => {
  const [selectedItem, setSelectedItem] = useState<string>(editingRecipe?.idItem ?? "");
  const [editMode, setEditMode] = useState<"update" | "new_version">("update");
  const [yieldQty, setYieldQty] = useState<string>(editingRecipe?.yieldQuantity ? String(Number(editingRecipe.yieldQuantity)) : "1");
  const [rows, setRows] = useState<RecipeRow[]>(
    editingDetails && editingDetails.length > 0
      ? editingDetails.map((d) => ({
          idIngredient: d.idIngredient,
          quantity: String(d.quantity),
          idItemUnit: d.idItemUnit ?? null,
        }))
      : [emptyRow()]
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedItem(editingRecipe?.idItem ?? "");
      setEditMode("update");
      setYieldQty(editingRecipe?.yieldQuantity ? String(Number(editingRecipe.yieldQuantity)) : "1");
      setRows(
        editingDetails && editingDetails.length > 0
          ? editingDetails.map((d) => ({
              idIngredient: d.idIngredient,
              quantity: String(d.quantity),
              idItemUnit: d.idItemUnit ?? null,
            }))
          : [emptyRow()]
      );
    }
  }, [isOpen, editingRecipe, editingDetails]);

  const isEditing = !!editingRecipe;

  const producedItems = items.filter((i) => i.isProduced);
  const ingredientItems = items.filter((i) => i.idItem !== selectedItem);

  const producedOptions = producedItems.map((i) => ({
    value: i.idItem,
    label: i.label,
  }));

  const handleRowChange = (index: number, field: keyof RecipeRow, value: string | null) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const validRows = rows.filter((r) => r.idIngredient);
    if (validRows.length === 0) return;

    const hasInvalidQuantity = validRows.some((r) => !r.quantity || Number(r.quantity) <= 0);
    if (hasInvalidQuantity) {
      onError("Erreur : La quantité d'un ingrédient doit être supérieure à 0 (elle ne peut pas être négative ou nulle).");
      return;
    }
    
    const ingredientIds = validRows.map((r) => r.idIngredient);
    if (new Set(ingredientIds).size !== ingredientIds.length) {
      onError("Erreur : Vous ne pouvez pas ajouter deux fois le même ingrédient.");
      return;
    }

    const parsedYield = parseFloat(yieldQty);
    if (!yieldQty || isNaN(parsedYield) || parsedYield <= 0) {
      onError("Erreur : Le rendement doit être supérieur à 0.");
      return;
    }
    
    await onSubmit(selectedItem, validRows, parsedYield, editMode === "new_version");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier la recette" : "Nouvelle recette"}</DialogTitle>
          <DialogDescription className="italic">
            {!isEditing && "Créez une fiche technique pour un article produit."}
            {isEditing && editMode === "update" && 
              `Correction de la Version ${editingRecipe?.version}. Aucune nouvelle version ne sera créée (idéal pour corriger une erreur de saisie).`}
            {isEditing && editMode === "new_version" && 
              `Création d'une Nouvelle Version. L'actuelle Version ${editingRecipe?.version} sera archivée (idéal pour un changement de composition).`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-hidden flex-1">
          {isEditing && (
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div 
                className={cn("p-3 rounded-xl border cursor-pointer transition-colors text-sm", editMode === "update" ? "bg-primary/5 border-primary" : "bg-card border-border hover:bg-accent")}
                onClick={() => setEditMode("update")}
              >
                <div className="font-medium flex items-center gap-2">
                  <Pencil className="size-3.5" />
                  Corriger la recette
                </div>
                <p className="text-xs text-muted-foreground mt-1">Garder la même version (correction d'erreurs).</p>
              </div>
              <div 
                className={cn("p-3 rounded-xl border cursor-pointer transition-colors text-sm", editMode === "new_version" ? "bg-primary/5 border-primary" : "bg-card border-border hover:bg-accent")}
                onClick={() => setEditMode("new_version")}
              >
                <div className="font-medium flex items-center gap-2">
                  <CopyPlus className="size-3.5" />
                  Nouvelle version
                </div>
                <p className="text-xs text-muted-foreground mt-1">Créer une nouvelle version et archiver l'actuelle.</p>
              </div>
            </div>
          )}

          <div className="space-y-1.5 shrink-0">
            <label className="text-sm font-medium">Article produit <span className="text-destructive">*</span></label>
            <SearchableSelect
              value={selectedItem}
              onChange={(val) => setSelectedItem(val.toString())}
              options={producedOptions}
              placeholder="Sélectionner le plat / produit fabriqué..."
              disabled={isEditing}
            />
          </div>

          <div className="space-y-1.5 shrink-0">
            <label className="text-sm font-medium">
              Rendement <span className="text-destructive">*</span>
              <span className="ml-2 text-xs font-normal text-muted-foreground">Quantité obtenue par cette recette</span>
            </label>
            <input
              type="number"
              min="0.0001"
              step="any"
              value={yieldQty}
              onChange={(e) => setYieldQty(e.target.value)}
              className="w-40 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              placeholder="Ex: 10 (portions)"
            />
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            <div className="grid grid-cols-[1fr_180px_140px_36px] gap-2 text-xs font-medium text-muted-foreground px-0.5 mb-1">
              <span>Ingrédient</span>
              <span>Unité</span>
              <span>Quantité</span>
              <span />
            </div>

            <div className="space-y-2">
              {rows.map((row, i) => {
                const selectedInOtherRows = rows
                  .filter((r, idx) => idx !== i && r.idIngredient)
                  .map((r) => r.idIngredient);
                const availableItems = ingredientItems.filter(
                  (item) => !selectedInOtherRows.includes(item.idItem)
                );

                return (
                  <RecipeFormRow
                    key={i}
                    row={row}
                    index={i}
                    items={availableItems}
                    itemUnits={itemUnits}
                    onChange={handleRowChange}
                    onRemove={handleRemoveRow}
                    onAddAlternativeUnit={onAddAlternativeUnit}
                  />
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="mt-2 gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
            >
              <Plus className="size-4" />
              Ajouter un ingrédient
            </Button>
          </div>

          <DialogFooter className="pt-2 border-t border-border/50">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedItem || rows.filter((r) => r.idIngredient && Number(r.quantity) > 0).length === 0}
            >
              {isSubmitting ? "Enregistrement..." : isEditing ? "Enregistrer les modifications" : "Créer la recette"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
