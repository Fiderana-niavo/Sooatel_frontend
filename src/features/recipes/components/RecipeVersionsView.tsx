import React, { useState } from "react";
import { CheckCircle2, History, FlaskConical, Pencil, Trash2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import type { Recipe } from "../types/recipe.type";
import { cn } from "@/utils/ui";

const ITEMS_PER_PAGE = 10;

interface Props {
  recipes: Recipe[];
  onBack: () => void;
  onSetActive: (idRecipe: string) => void;
  onViewIngredients: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (idRecipe: string) => void;
  isSettingActive: boolean;
}

export const RecipeVersionsView: React.FC<Props> = ({
  recipes,
  onBack,
  onSetActive,
  onViewIngredients,
  onEdit,
  onDelete,
  isSettingActive,
}) => {
  const [page, setPage] = useState(1);

  if (!recipes.length) return null;
  const itemName = recipes[0].item?.label ?? "Article inconnu";

  const totalPages = Math.ceil(recipes.length / ITEMS_PER_PAGE);
  const sorted = [...recipes].sort((a, b) => b.version - a.version);
  const paginatedRecipes = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <History className="size-6" />
            Historique des versions
          </h2>
          <p className="text-muted-foreground">
            {itemName} - {recipes.length} version(s)
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedRecipes.map((recipe) => (
            <div
              key={recipe.idRecipe}
              className={cn(
                "p-5 rounded-2xl border flex flex-col gap-4 transition-colors",
                recipe.isActive ? "bg-primary/5 border-primary/40 shadow-sm" : "bg-card border-border hover:shadow-md"
              )}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 font-medium text-lg">
                    Version {recipe.version}
                    {recipe.isActive && (
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="size-3" /> Actif
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1.5 space-y-1">
                    <p>Créé le {new Date(recipe.createdAt).toLocaleDateString("fr-FR")}</p>
                    <p>Rendement : {Number(recipe.yieldQuantity) || 1} {recipe.item?.unit?.symbol ?? ""}</p>
                    <p className={cn(
                      "font-semibold text-sm mt-2",
                      recipe.isActive ? "text-primary" : "text-foreground"
                    )}>
                      {recipe.recipeCost != null
                        ? (() => {
                            const yieldQty = Number(recipe.yieldQuantity) || 1;
                            const batchCost = Number(recipe.recipeCost) * yieldQty;
                            const perUnit = `${Number(recipe.recipeCost).toLocaleString("fr-FR", { style: "currency", currency: "MGA" })} / ${recipe.item?.unit?.symbol ?? ""}`;
                            return yieldQty > 1
                              ? <>{batchCost.toLocaleString("fr-FR", { style: "currency", currency: "MGA" })} <span className="text-muted-foreground font-normal text-xs">({perUnit})</span></>
                              : perUnit;
                          })()
                        : <span className="text-muted-foreground italic text-xs">Coût non calculé</span>
                      }
                    </p>
                  </div>
                </div>

                {!recipe.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs shrink-0"
                    disabled={isSettingActive}
                    onClick={() => onSetActive(recipe.idRecipe)}
                  >
                    Définir comme actif
                  </Button>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-border/40 mt-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs gap-1.5"
                  onClick={() => onViewIngredients(recipe)}
                >
                  <FlaskConical className="size-3.5" /> Ingrédients
                </Button>
                {recipe.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs gap-1.5"
                    onClick={() => onEdit(recipe)}
                  >
                    <Pencil className="size-3.5" /> Modifier
                  </Button>
                )}
                <button
                  onClick={() => onDelete(recipe.idRecipe)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
                  title="Supprimer"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50 shrink-0">
          <span className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="gap-2"
            >
              <ChevronLeft className="size-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="gap-2"
            >
              Suivant
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
