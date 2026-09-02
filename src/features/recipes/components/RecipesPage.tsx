import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { ItemService, itemUnitService } from "@/features/items";
import { UnitOfMeasureService } from "@/features/unit-of-measures";
import type { CreateItemUnitDto } from "@/features/items/types/item-unit.type";
import { ItemUnitFormDialog } from "@/features/items";
import { Snackbar, type SnackbarType } from "@/components/ui/Snackbar/snackbar";

export function RecipesPage() {
  const queryClient = useQueryClient();
  const [isItemUnitModalOpen, setIsItemUnitModalOpen] = useState(false);

  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; isOpen: boolean }>({
    message: "",
    type: "info",
    isOpen: false,
  });

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type, isOpen: true });
  };

  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: () => ItemService.getAll()
  });

  const { data: units = [] } = useQuery({
    queryKey: ["unitsOfMeasure"],
    queryFn: () => UnitOfMeasureService.getAll()
  });



  const createItemUnitMutation = useMutation({
    mutationFn: (data: CreateItemUnitDto) => itemUnitService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itemUnits"] });
      setIsItemUnitModalOpen(false);
      showSnackbar("Unité alternative ajoutée avec succès", "success");
    },
    onError: (err: any) => {
      console.error(err);
      const msg = err.response?.data?.error || err.response?.data?.message || "Erreur lors de l'ajout";
      showSnackbar(msg, "error");
    }
  });

  const handleAddItemUnit = (data: CreateItemUnitDto) => {
    createItemUnitMutation.mutate(data);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Recettes de cuisine</h2>
          <p className="text-muted-foreground">Gérez vos fiches techniques et recettes.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsItemUnitModalOpen(true)} variant="outline" className="gap-2">
            <Plus className="size-4" />
            Ajouter une unité alternative
          </Button>
          <Button disabled className="gap-2 bg-primary/90">
            <Plus className="size-4" />
            Nouvelle recette
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-muted/30 rounded-2xl p-6 border border-border/50 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-primary/10 mb-4">
          <BookOpen className="size-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Module en cours de développement</h3>
        <p className="text-muted-foreground max-w-md">
          La gestion complète des fiches techniques, des étapes de préparation et de la valorisation des recettes sera bientôt disponible.
          Pour l'instant, vous pouvez définir les unités alternatives via le bouton en haut à droite.
        </p>
      </div>

      <ItemUnitFormDialog
        isOpen={isItemUnitModalOpen}
        onClose={() => setIsItemUnitModalOpen(false)}
        items={items}
        units={units}
        onAdd={(data) => handleAddItemUnit(data)}
      />

      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
        />
      )}
    </div>
  );
}
