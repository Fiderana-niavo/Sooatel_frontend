export interface MenuItem {
  idMenu: string;
  ref: string;
  idItem: string;
  salePrice: number;
  recipeCost?: number;
  idCategory: string;
}

export interface CreateMenuItemDto {
  ref: string;
  idItem: string;
  salePrice: number;
  recipeCost?: number;
  idCategory: string;
}
