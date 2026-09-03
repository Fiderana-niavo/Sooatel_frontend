import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChefHat, FlaskConical, Pencil, Trash2, History } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { ItemService, itemUnitService } from "@/features/items";
import { UnitOfMeasureService } from "@/features/unit-of-measures/services";
import { Snackbar, type SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { RecipeService } from "../services/recipe.service";
import { RecipeFormDialog } from "./RecipeFormDialog";
import { RecipeIngredientsDrawer } from "./RecipeIngredientsDrawer";
import { RecipeVersionsView } from "./RecipeVersionsView";
import { ItemUnitFormDialog } from "@/features/items/components/item-unit/ItemUnitFormDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import type { Recipe, RecipeDetail } from "../types/recipe.type";
import type { RecipeRow } from "./RecipeFormRow";

export function RecipesPage() {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editingDetails, setEditingDetails] = useState<RecipeDetail[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedVersionsItem, setSelectedVersionsItem] = useState<string | null>(null);
  const [confirmActiveRecipeId, setConfirmActiveRecipeId] = useState<string | null>(null);
  const [addingUnitForIngredient, setAddingUnitForIngredient] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; isOpen: boolean; duration?: number }>({
    message: "",
    type: "info",
    isOpen: false,
  });

  const showSnackbar = (message: string, type: SnackbarType = "info", duration?: number) => {
    setSnackbar({ message, type, isOpen: true, duration });
  };

  const itemsResult = useQuery({
    queryKey: ["items", "all"],
    queryFn: () => ItemService.getAll({ limit: 1000 }),
  });

  const itemUnitsResult = useQuery({
    queryKey: ["itemUnits", "all"],
    queryFn: () => itemUnitService.getAll({ limit: 1000 } as any),
  });

  const unitsResult = useQuery({
    queryKey: ["units"],
    queryFn: () => UnitOfMeasureService.getAll(),
  });

  const recipesResult = useQuery({
    queryKey: ["recipes"],
    queryFn: () => RecipeService.getAll(),
  });

  const items = itemsResult.data ?? [];
  const itemUnits = itemUnitsResult.data ?? [];
  const units = unitsResult.data ?? [];
  const recipes = recipesResult.data ?? [];

  const createMutation = useMutation({
    mutationFn: ({ idItem, rows, yieldQuantity }: { idItem: string; rows: RecipeRow[]; yieldQuantity: number }) =>
      RecipeService.create({
        idItem,
        yieldQuantity,
        details: rows.map((r) => ({
          idIngredient: r.idIngredient,
          quantity: Number(r.quantity),
          idItemUnit: r.idItemUnit,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      setIsFormOpen(false);
      showSnackbar("Recette créée avec succès !", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Erreur lors de la création";
      showSnackbar(msg, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ idRecipe, rows, yieldQuantity }: { idRecipe: string; rows: RecipeRow[]; yieldQuantity: number }) =>
      RecipeService.update(idRecipe, {
        yieldQuantity,
        details: rows.map((r) => ({
          idIngredient: r.idIngredient,
          quantity: Number(r.quantity),
          idItemUnit: r.idItemUnit,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      setIsFormOpen(false);
      setEditingRecipe(null);
      showSnackbar("Recette modifiée avec succès !", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Erreur lors de la modification";
      showSnackbar(msg, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (idRecipe: string) => RecipeService.remove(idRecipe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      showSnackbar("Recette supprimée.", "info");

      // If the deleted recipe was active in the dialog, close it or it might break
      // But it's handled by queries invalidating and re-rendering, so it should be fine.
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Erreur lors de la suppression";
      showSnackbar(msg, "error");
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: (idRecipe: string) => RecipeService.setActive(idRecipe),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      if (result.createdNewVersion) {
        showSnackbar(`Nouveau coût détecté — Version ${result.newVersion} créée et définie comme active.`, "success");
      } else if (result.activatedExistingVersion) {
        showSnackbar(
          `⚠️ Version ${result.activatedExistingVersion} activée à la place de celle demandée. Au prix actuel des ingrédients, ces deux versions ont exactement le même coût — inutile de créer un doublon dans l'historique.`,
          "warning"
        );
      } else {
        showSnackbar("Version définie comme active avec succès.", "success");
      }
      setConfirmActiveRecipeId(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Erreur lors de l'activation";
      showSnackbar(msg, "error");
      setConfirmActiveRecipeId(null);
    },
  });

  const addItemUnitMutation = useMutation({
    mutationFn: itemUnitService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itemUnits"] });
      showSnackbar("Unité alternative ajoutée avec succès", "success");
      setAddingUnitForIngredient(null);
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : "Erreur lors de l'ajout", "error");
    },
  });

  const handleEdit = async (recipe: Recipe) => {
    const details = await RecipeService.getDetails(recipe.idRecipe);
    setEditingRecipe(recipe);
    setEditingDetails(details);
    setIsFormOpen(true);
  };

  const handleSubmit = async (idItem: string, rows: RecipeRow[], yieldQuantity: number, createNewVersion = false) => {
    if (editingRecipe && !createNewVersion) {
      updateMutation.mutate({ idRecipe: editingRecipe.idRecipe, rows, yieldQuantity });
    } else {
      createMutation.mutate({ idItem, rows, yieldQuantity });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingRecipe(null);
    setEditingDetails([]);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const versionsQuery = useQuery({
    queryKey: ["recipes", "versions", selectedVersionsItem],
    queryFn: () => RecipeService.getVersions(selectedVersionsItem!),
    enabled: !!selectedVersionsItem,
  });

  if (selectedVersionsItem) {
    const versions = versionsQuery.data ?? [];
    return (
      <div className="h-full">
        {versionsQuery.isLoading && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground animate-pulse text-sm py-10">
            Chargement de l'historique...
          </div>
        )}
        {!versionsQuery.isLoading && (
          <RecipeVersionsView
            recipes={versions}
            onBack={() => setSelectedVersionsItem(null)}
            onSetActive={(id) => setConfirmActiveRecipeId(id)}
            onViewIngredients={setSelectedRecipe}
            onEdit={handleEdit}
            onDelete={(id) => {
              if (window.confirm("Êtes-vous sûr de vouloir supprimer cette version de recette ?")) {
                deleteMutation.mutate(id);
              }
            }}
            isSettingActive={setActiveMutation.isPending}
          />
        )}

        <RecipeFormDialog
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          items={items}
          itemUnits={itemUnits}
          editingRecipe={editingRecipe}
          editingDetails={editingDetails}
          isSubmitting={isSubmitting}
          onError={(msg) => showSnackbar(msg, "error")}
          onAddAlternativeUnit={(id) => setAddingUnitForIngredient(id)}
        />

        <RecipeIngredientsDrawer
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onEditSubRecipe={(_idRecipe) => {
            // Fetch full recipe for edit in a real app, currently just ignored.
          }}
        />

        {addingUnitForIngredient && (
          <ItemUnitFormDialog
            isOpen={true}
            onClose={() => setAddingUnitForIngredient(null)}
            items={items.filter(i => i.idItem === addingUnitForIngredient)}
            units={units}
            onAdd={(data) => {
              addItemUnitMutation.mutate({
                ...data,
                idItem: addingUnitForIngredient,
              });
            }}
          />
        )}

        <ConfirmDialog
          open={!!confirmActiveRecipeId}
          onOpenChange={(open) => !open && setConfirmActiveRecipeId(null)}
          title="Activer cette version"
          description="Êtes-vous sûr de vouloir activer cette version ? La version actuellement active ne le sera plus."
          onConfirm={() => {
            if (confirmActiveRecipeId) {
              setActiveMutation.mutate(confirmActiveRecipeId);
            }
          }}
          loading={setActiveMutation.isPending}
          confirmText="Activer"
          confirmButtonClassName="bg-primary hover:bg-primary/90 text-primary-foreground"
        />

        {snackbar.isOpen && (
          <Snackbar
            message={snackbar.message}
            type={snackbar.type}
            onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
            duration={snackbar.duration}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fiches Techniques</h2>
          <p className="text-muted-foreground">Gérez vos recettes et la composition de vos plats.</p>
        </div>
        <Button onClick={() => { setEditingRecipe(null); setIsFormOpen(true); }} className="gap-2">
          <Plus className="size-4" />
          Nouvelle recette
        </Button>
      </div>

      {recipesResult.isLoading ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground animate-pulse text-sm">
          Chargement des recettes...
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex-1 bg-muted/30 rounded-2xl p-6 border border-border/50 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <ChefHat className="size-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Aucune recette</h3>
          <p className="text-muted-foreground max-w-md">
            Commencez par créer une recette pour un article produit.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recipes.map((active) => {
              return (
                <div
                  key={active.idItem}
                  className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-md transition-shadow space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ChefHat className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{active.item?.label ?? active.idItem}</p>
                        <p className="text-xs text-muted-foreground">Version {active.version} • Actif</p>
                      </div>
                    </div>
                    {active.versionsCount > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVersionsItem(active.idItem)}
                        className="h-7 text-xs rounded-full gap-1.5 px-3 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary hover:text-primary"
                        title="Voir l'historique des versions"
                      >
                        <History className="size-3.5" />
                        {active.versionsCount} versions
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-medium text-primary">
                      Rendement : {Number(active.yieldQuantity) || 1} {active.item?.unit?.symbol ?? ""}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-border/40">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => setSelectedRecipe(active as unknown as Recipe)}
                    >
                      <FlaskConical className="size-3.5" />
                      Ingrédients
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() => handleEdit(active as unknown as Recipe)}
                    >
                      <Pencil className="size-3.5" />
                      Modifier
                    </Button>
                    <button
                      onClick={() => deleteMutation.mutate(active.idRecipe)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <RecipeFormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        items={items}
        itemUnits={itemUnits}
        editingRecipe={editingRecipe}
        editingDetails={editingDetails}
        isSubmitting={isSubmitting}
        onError={(msg) => showSnackbar(msg, "error")}
        onAddAlternativeUnit={(id) => setAddingUnitForIngredient(id)}
      />

      <RecipeIngredientsDrawer
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onEditSubRecipe={(_idRecipe) => {
          // Fetch full recipe for edit in a real app, currently just ignored.
        }}
      />

      {addingUnitForIngredient && (
        <ItemUnitFormDialog
          isOpen={true}
          onClose={() => setAddingUnitForIngredient(null)}
          items={items.filter((i) => i.idItem === addingUnitForIngredient)} // Pre-filter to only show the selected ingredient
          units={units}
          onAdd={(data) => addItemUnitMutation.mutate(data)}
        />
      )}

      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
          duration={snackbar.duration}
        />
      )}
    </div>
  );
}
