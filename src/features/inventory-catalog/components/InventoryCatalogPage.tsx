import { useState } from "react";

import {
  ItemsModal,
  ItemUnitsModal,
  ItemService,
  itemUnitService,
} from "@/features/items";
import {
  ItemTypesModal,
  ItemTypeService,
} from "@/features/item-types";
import {
  UnitOfMeasuresModal,
  UnitOfMeasureService,
} from "@/features/unit-of-measures";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { Snackbar, type SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { INVENTORY_MODULES } from "@/constants/app.constants";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function InventoryCatalogPage() {
  const queryClient = useQueryClient();

  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: SnackbarType;
    isOpen: boolean;
  }>({
    message: "",
    type: "info",
    isOpen: false,
  });

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type, isOpen: true });
  };

  const [isItemsOpen, setIsItemsOpen] = useState(false);
  const [isItemTypesOpen, setIsItemTypesOpen] = useState(false);
  const [isUnitsOpen, setIsUnitsOpen] = useState(false);
  const [isItemUnitsOpen, setIsItemUnitsOpen] = useState(false);

  const [itemsConfirm, setItemsConfirm] = useState({ isOpen: false, id: "" });
  const [itemTypesConfirm, setItemTypesConfirm] = useState({
    isOpen: false,
    id: "",
  });
  const [unitsConfirm, setUnitsConfirm] = useState({ isOpen: false, id: "" });
  const [itemUnitsConfirm, setItemUnitsConfirm] = useState({
    isOpen: false,
    id: "",
  });

  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: () => ItemService.getAll(),
  });
  const { data: itemTypes = [] } = useQuery({
    queryKey: ["itemTypes"],
    queryFn: () => ItemTypeService.getAll(),
  });
  const { data: unitOfMeasures = [] } = useQuery({
    queryKey: ["unitOfMeasures"],
    queryFn: () => UnitOfMeasureService.getAll(),
  });
  const { data: itemUnits = [] } = useQuery({
    queryKey: ["itemUnits"],
    queryFn: () => itemUnitService.getAll(),
  });

  const createItem = useMutation({
    mutationFn: ItemService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      showSnackbar("Article ajouté", "success");
      setIsItemsOpen(false);
    },
    onError: () => showSnackbar("Erreur lors de l'ajout", "error"),
  });
  const updateItem = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ItemService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      showSnackbar("Article modifié", "success");
      setIsItemsOpen(false);
    },
    onError: () => showSnackbar("Erreur lors de la modification", "error"),
  });
  const deleteItem = useMutation({
    mutationFn: ItemService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      showSnackbar("Article supprimé", "success");
      setItemsConfirm({ isOpen: false, id: "" });
    },
    onError: () => showSnackbar("Erreur lors de la suppression", "error"),
  });

  const createItemType = useMutation({
    mutationFn: ItemTypeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itemTypes"] });
      showSnackbar("Type d'article ajouté", "success");
      setIsItemTypesOpen(false);
    },
    onError: () => showSnackbar("Erreur", "error"),
  });
  const updateItemType = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ItemTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itemTypes"] });
      showSnackbar("Type d'article modifié", "success");
      setIsItemTypesOpen(false);
    },
    onError: () => showSnackbar("Erreur", "error"),
  });
  const deleteItemType = useMutation({
    mutationFn: ItemTypeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itemTypes"] });
      showSnackbar("Type d'article supprimé", "success");
      setItemTypesConfirm({ isOpen: false, id: "" });
    },
    onError: () => showSnackbar("Erreur", "error"),
  });

  const createUnit = useMutation({
    mutationFn: UnitOfMeasureService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unitOfMeasures"] });
      showSnackbar("Unité ajoutée", "success");
      setIsUnitsOpen(false);
    },
    onError: () => showSnackbar("Erreur", "error"),
  });
  const updateUnit = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      UnitOfMeasureService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unitOfMeasures"] });
      showSnackbar("Unité modifiée", "success");
      setIsUnitsOpen(false);
    },
    onError: () => showSnackbar("Erreur", "error"),
  });
  const deleteUnit = useMutation({
    mutationFn: UnitOfMeasureService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unitOfMeasures"] });
      showSnackbar("Unité supprimée", "success");
      setUnitsConfirm({ isOpen: false, id: "" });
    },
    onError: () => showSnackbar("Erreur", "error"),
  });

  const createItemUnit = useMutation({
    mutationFn: itemUnitService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itemUnits"] });
      showSnackbar("Unité alternative ajoutée", "success");
      setIsItemUnitsOpen(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.response?.data?.message || "Erreur lors de l'ajout";
      showSnackbar(msg, "error");
    },
  });
  const updateItemUnit = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => itemUnitService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itemUnits"] });
      showSnackbar("Unité alternative modifiée", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.response?.data?.message || "Erreur lors de la modification";
      showSnackbar(msg, "error");
    },
  });
  const deleteItemUnit = useMutation({
    mutationFn: itemUnitService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itemUnits"] });
      showSnackbar("Unité alternative supprimée", "success");
      setItemUnitsConfirm({ isOpen: false, id: "" });
    },
    onError: () => showSnackbar("Erreur", "error"),
  });

  const modalActions: Record<string, () => void> = {
    items: () => setIsItemsOpen(true),
    itemTypes: () => setIsItemTypesOpen(true),
    units: () => setIsUnitsOpen(true),
    itemUnits: () => setIsItemUnitsOpen(true),
  };

  return (
    <div className="w-full h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      {INVENTORY_MODULES.map((section, idx) => (
        <div key={idx} className="space-y-4">
          <h2 className="text-xl font-bold text-secondary">{section.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.items.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={modalActions[card.id]}
                  className="bg-card border border-border/50 rounded-[2rem] p-6 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div
                    className={`p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-all duration-300 ${card.colorClass} ${card.hoverClass}`}
                  >
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
          {idx < INVENTORY_MODULES.length - 1 && (
            <div className="h-px w-full bg-border/50 my-8"></div>
          )}
        </div>
      ))}

      <ItemsModal
        isOpen={isItemsOpen}
        onClose={() => setIsItemsOpen(false)}
        data={items}
        itemTypes={itemTypes}
        unitOfMeasures={unitOfMeasures}
        onAdd={(data) => createItem.mutate(data)}
        onEdit={(id, data) => updateItem.mutate({ id, data })}
        onDelete={(id) => setItemsConfirm({ isOpen: true, id })}
      />
      <ConfirmDialog
        open={itemsConfirm.isOpen}
        onOpenChange={(open) =>
          setItemsConfirm({ ...itemsConfirm, isOpen: open })
        }
        title="Confirmation"
        description="Voulez-vous vraiment supprimer cet article ?"
        onConfirm={() => deleteItem.mutate(itemsConfirm.id)}
        loading={deleteItem.isPending}
      />

      <ItemTypesModal
        isOpen={isItemTypesOpen}
        onClose={() => setIsItemTypesOpen(false)}
        data={itemTypes}
        onAdd={(data) => createItemType.mutate(data as any)}
        onEdit={(id, data) => updateItemType.mutate({ id, data })}
        onDelete={(id) => setItemTypesConfirm({ isOpen: true, id })}
      />
      <ConfirmDialog
        open={itemTypesConfirm.isOpen}
        onOpenChange={(open) =>
          setItemTypesConfirm({ ...itemTypesConfirm, isOpen: open })
        }
        title="Confirmation"
        description="Voulez-vous vraiment supprimer ce type d'article ?"
        onConfirm={() => deleteItemType.mutate(itemTypesConfirm.id)}
        loading={deleteItemType.isPending}
      />

      <UnitOfMeasuresModal
        isOpen={isUnitsOpen}
        onClose={() => setIsUnitsOpen(false)}
        data={unitOfMeasures}
        onAdd={(data) => createUnit.mutate(data as any)}
        onEdit={(id, data) => updateUnit.mutate({ id, data })}
        onDelete={(id) => setUnitsConfirm({ isOpen: true, id })}
      />
      <ConfirmDialog
        open={unitsConfirm.isOpen}
        onOpenChange={(open) =>
          setUnitsConfirm({ ...unitsConfirm, isOpen: open })
        }
        title="Confirmation"
        description="Voulez-vous vraiment supprimer cette unité de mesure ?"
        onConfirm={() => deleteUnit.mutate(unitsConfirm.id)}
        loading={deleteUnit.isPending}
      />

      <ItemUnitsModal
        isOpen={isItemUnitsOpen}
        onClose={() => setIsItemUnitsOpen(false)}
        data={itemUnits}
        items={items}
        units={unitOfMeasures}
        onAdd={(data) => createItemUnit.mutate(data)}
        onEdit={(id, data) => updateItemUnit.mutate({ id, data })}
        onDelete={(id) => setItemUnitsConfirm({ isOpen: true, id })}
      />
      <ConfirmDialog
        open={itemUnitsConfirm.isOpen}
        onOpenChange={(open) =>
          setItemUnitsConfirm({ ...itemUnitsConfirm, isOpen: open })
        }
        title="Confirmation"
        description="Voulez-vous vraiment supprimer cette unité alternative ?"
        onConfirm={() => deleteItemUnit.mutate(itemUnitsConfirm.id)}
        loading={deleteItemUnit.isPending}
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
