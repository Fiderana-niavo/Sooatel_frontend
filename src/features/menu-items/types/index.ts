export interface MenuItem {
  idMenu: string;
  ref: string;
  idItem: string;
  salePrice: number;
  unitCost?: number;
  idCategory: string;
}

export interface CreateMenuItemDto {
  ref: string;
  idItem: string;
  salePrice: number;
  unitCost?: number;
  idCategory: string;
}
