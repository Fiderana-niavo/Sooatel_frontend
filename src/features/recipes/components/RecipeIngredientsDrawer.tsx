import React, { useState } from "react";
import { X, Layers, FlaskConical, Pencil, ChevronRight, ChevronDown, ListTree, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { RecipeService } from "../services/recipe.service";
import type { Recipe } from "../types/recipe.type";
import type { RecipeTreeNode, RecipeAnalysis } from "../types/recipe.type";
import { cn } from "@/utils/ui";

interface Props {
  recipe: Recipe | null;
  onClose: () => void;
  onEditSubRecipe?: (idRecipe: string) => void;
}

const formatNumber = (num: number) => num.toLocaleString("fr-FR", { maximumFractionDigits: 6 });
const formatCurrency = (num: number) => num.toLocaleString("fr-FR", { style: "currency", currency: "MGA" });

const RecipeTreeNodeView: React.FC<{ node: RecipeTreeNode; depth?: number; onEditSubRecipe?: (idRecipe: string) => void }> = ({ node, depth = 0, onEditSubRecipe }) => {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="space-y-1">
      <div 
        className={cn(
          "flex items-center justify-between transition-colors group",
          hasChildren 
            ? "px-3 py-2.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/50" 
            : "px-3 py-1.5 hover:bg-accent/50 rounded-md"
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {hasChildren ? (
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="p-1 -ml-1 rounded hover:bg-muted text-muted-foreground transition-colors shrink-0"
            >
              {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </button>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-border shrink-0 ml-1.5 mr-1" />
          )}
          
          <div className="truncate">
            <span className={cn(
              "text-sm", 
              hasChildren ? "font-semibold" : "font-medium text-muted-foreground group-hover:text-foreground"
            )}>
              {node.label}
            </span>
            {node.subRecipeVersion && (
              <span className="ml-2 text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                v{node.subRecipeVersion}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className={cn("tabular-nums text-foreground", hasChildren ? "text-sm font-semibold" : "text-[13px] font-medium")}>
              {formatNumber(node.qty)} <span className="text-xs text-muted-foreground font-normal">{node.unit}</span>
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              {formatCurrency(node.cost)}
            </div>
          </div>
          
          {node.isProduced && node.subRecipeId && onEditSubRecipe && (
            <button
              onClick={() => onEditSubRecipe(node.subRecipeId!)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Modifier cette sous-recette"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
        </div>
      </div>
      
      {isExpanded && hasChildren && (
        <div className="space-y-1 border-l-2 border-border/40 ml-[11px] pl-2 py-1 relative">
          {node.children!.map((child) => (
            <RecipeTreeNodeView 
              key={`${child.idIngredient}-${child.subRecipeId || 'raw'}`} 
              node={child} 
              depth={depth + 1} 
              onEditSubRecipe={onEditSubRecipe} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const RecipeIngredientsDrawer: React.FC<Props> = ({ recipe, onClose, onEditSubRecipe }) => {
  const [activeTab, setActiveTab] = useState<"tree" | "flat">("tree");

  const ingredientsResult = useQuery({
    queryKey: ["recipe-ingredients", recipe?.idRecipe],
    queryFn: () => RecipeService.getIngredients(recipe!.idRecipe),
    enabled: !!recipe,
  });

  const analysis: RecipeAnalysis | undefined = ingredientsResult.data;
  const isLoading = ingredientsResult.isLoading;

  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[500px] bg-background border-l border-border/50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FlaskConical className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{recipe.item?.label ?? "Recette"}</h3>
              <p className="text-xs text-muted-foreground">Version {recipe.version} — Analyse des coûts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm animate-pulse">
              Analyse de la recette...
            </div>
          ) : !analysis ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
              <Layers className="size-8 opacity-40" />
              Impossible de charger l'analyse
            </div>
          ) : (
            <>
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
                  <div>
                    <div className="text-xs font-medium text-primary uppercase tracking-wider mb-0.5">Coût de revient total</div>
                    <div className="text-2xl font-bold text-foreground tabular-nums">
                      {formatCurrency(analysis.totalCost)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Rendement</div>
                    <div className="text-xl font-bold text-foreground">
                      {Number(recipe.yieldQuantity) || 1} <span className="text-sm font-medium text-muted-foreground">{recipe.item?.unit?.symbol ?? ""}</span>
                    </div>
                  </div>
                </div>

                <div className="flex bg-muted p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab("tree")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
                      activeTab === "tree" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ListTree className="size-4" />
                    Arborescence
                  </button>
                  <button
                    onClick={() => setActiveTab("flat")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
                      activeTab === "flat" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <List className="size-4" />
                    Liste des courses
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-5">
                {activeTab === "tree" ? (
                  <div className="pt-2">
                    <RecipeTreeNodeView 
                      node={analysis.tree} 
                      onEditSubRecipe={(id) => {
                        onClose();
                        onEditSubRecipe && onEditSubRecipe(id);
                      }} 
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-2">
                    {analysis.flatIngredients.length === 0 ? (
                      <div className="text-center text-sm text-muted-foreground py-8">Aucune matière première.</div>
                    ) : (
                      analysis.flatIngredients.map((ing) => (
                        <div
                          key={ing.idIngredient}
                          className="flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-border/40 hover:border-border transition-colors"
                        >
                          <span className="text-sm font-medium text-foreground">{ing.label}</span>
                          <div className="text-right">
                            <span className="text-sm font-semibold tabular-nums">
                              {formatNumber(ing.totalQty)}
                              <span className="text-xs text-muted-foreground font-normal ml-1">{ing.unit}</span>
                            </span>
                            <div className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
                              {formatCurrency(ing.totalCost)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
