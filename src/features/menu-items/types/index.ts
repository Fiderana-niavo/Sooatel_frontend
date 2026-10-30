import type { Item } from "@/features/items";
import type { MenuCategory } from "@/features/menu-categories";

export interface MenuItem {
  idMenu: string;
  ref: string;
  idItem: string;
  salePrice: number;
  unitCost?: number;
  idCategory: string;
  item?: Item;
  category?: MenuCategory;
}

export interface CreateMenuItemDto {
  ref?: string;
  idItem: string;
  salePrice: number;
  unitCost?: number;
  idCategory: string;
}

