import { useState } from "react";

import { ItemsModal, ItemService, type Item } from "@/features/items";
import { ItemTypesModal, ItemTypeService, type ItemType } from "@/features/item-types";
import { UnitOfMeasuresModal, UnitOfMeasureService, type UnitOfMeasure } from "@/features/unit-of-measures";
import { MenuItemsModal, MenuItemService, type MenuItem } from "@/features/menu-items";
import { MenuCategorysModal, MenuCategoryService, type MenuCategory } from "@/features/menu-categories";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { Snackbar, type SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { RESTAURANT_MODULES } from "@/constants/app.constants";

import { useCrud } from "@/hooks/useCrud";

export function RestaurantCatalogPage() {
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; isOpen: boolean }>({
    message: "",
    type: "info",
    isOpen: false,
  });

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type, isOpen: true });
  };

  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>("");

  const items = useCrud<Item>(ItemService.getAll, ItemService.create, ItemService.update, ItemService.delete, "idItem" as keyof Item);
  const itemTypes = useCrud<ItemType>(ItemTypeService.getAll, ItemTypeService.create, ItemTypeService.update, ItemTypeService.delete, "idProductType" as keyof ItemType);
  const unitOfMeasures = useCrud<UnitOfMeasure>(UnitOfMeasureService.getAll, UnitOfMeasureService.create, UnitOfMeasureService.update, UnitOfMeasureService.delete, "idUnit" as keyof UnitOfMeasure);

  const menuItems = useCrud<MenuItem>(MenuItemService.getAll, MenuItemService.create, MenuItemService.update, MenuItemService.delete, "idMenu" as keyof MenuItem);
  const menuCategories = useCrud<MenuCategory>(MenuCategoryService.getAll, MenuCategoryService.create, MenuCategoryService.update, MenuCategoryService.delete, "idCategory" as keyof MenuCategory);

  const modalActions: Record<string, () => void> = {
    items: () => items.setIsOpen(true),
    itemTypes: () => itemTypes.setIsOpen(true),
    units: () => unitOfMeasures.setIsOpen(true),
    menuItems: () => menuItems.setIsOpen(true),
    menuCategories: () => menuCategories.setIsOpen(true),
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

      {RESTAURANT_MODULES.map((section, idx) => (
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
                  <div className={`p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-all duration-300 ${card.colorClass} ${card.hoverClass}`}>
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                  <p className="text-muted-foreground text-sm">{card.description}</p>
                </div>
              );
            })}
          </div>
          {idx < RESTAURANT_MODULES.length - 1 && <div className="h-px w-full bg-border/50 my-8"></div>}
        </div>
      ))}


      <ItemsModal
        isOpen={items.isOpen} onClose={() => items.setIsOpen(false)} data={items.data}
        itemTypes={itemTypes.data} unitOfMeasures={unitOfMeasures.data}
        onAdd={(data) => items.handleAdd(data, showSnackbar)} onEdit={(id, data) => items.handleEdit(id, data, showSnackbar)} onDelete={items.promptDelete}
      />
      <ConfirmDialog open={items.confirmOpen} onOpenChange={items.setConfirmOpen} title="Confirmation" description="Voulez-vous vraiment supprimer cet article ?" onConfirm={() => items.executeDelete(showSnackbar)} loading={items.isDeleting} />

      <ItemTypesModal
        isOpen={itemTypes.isOpen} onClose={() => itemTypes.setIsOpen(false)} data={itemTypes.data}
        onAdd={(data) => itemTypes.handleAdd(data, showSnackbar)} onEdit={(id, data) => itemTypes.handleEdit(id, data, showSnackbar)} onDelete={itemTypes.promptDelete}
      />
      <ConfirmDialog open={itemTypes.confirmOpen} onOpenChange={itemTypes.setConfirmOpen} title="Confirmation" description="Voulez-vous vraiment supprimer ce type d'article ?" onConfirm={() => itemTypes.executeDelete(showSnackbar)} loading={itemTypes.isDeleting} />

      <UnitOfMeasuresModal
        isOpen={unitOfMeasures.isOpen} onClose={() => unitOfMeasures.setIsOpen(false)} data={unitOfMeasures.data}
        onAdd={(data) => unitOfMeasures.handleAdd(data, showSnackbar)} onEdit={(id, data) => unitOfMeasures.handleEdit(id, data, showSnackbar)} onDelete={unitOfMeasures.promptDelete}
      />
      <ConfirmDialog open={unitOfMeasures.confirmOpen} onOpenChange={unitOfMeasures.setConfirmOpen} title="Confirmation" description="Voulez-vous vraiment supprimer cette unité de mesure ?" onConfirm={() => unitOfMeasures.executeDelete(showSnackbar)} loading={unitOfMeasures.isDeleting} />

      <MenuItemsModal
        isOpen={menuItems.isOpen} onClose={() => menuItems.setIsOpen(false)} data={menuItems.data}
        items={items.data}
        categories={menuCategories.data} selectedCategory={selectedMenuCategory} onCategoryChange={setSelectedMenuCategory}
        onAdd={(data) => menuItems.handleAdd(data, showSnackbar)} onEdit={(id, data) => menuItems.handleEdit(id, data, showSnackbar)} onDelete={menuItems.promptDelete}
      />
      <ConfirmDialog open={menuItems.confirmOpen} onOpenChange={menuItems.setConfirmOpen} title="Confirmation" description="Voulez-vous vraiment supprimer ce plat ?" onConfirm={() => menuItems.executeDelete(showSnackbar)} loading={menuItems.isDeleting} />

      <MenuCategorysModal
        isOpen={menuCategories.isOpen} onClose={() => menuCategories.setIsOpen(false)} data={menuCategories.data}
        onAdd={(data) => menuCategories.handleAdd(data, showSnackbar)} onEdit={(id, data) => menuCategories.handleEdit(id, data, showSnackbar)} onDelete={menuCategories.promptDelete}
      />
      <ConfirmDialog open={menuCategories.confirmOpen} onOpenChange={menuCategories.setConfirmOpen} title="Confirmation" description="Voulez-vous vraiment supprimer cette catégorie de menu ?" onConfirm={() => menuCategories.executeDelete(showSnackbar)} loading={menuCategories.isDeleting} />


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
