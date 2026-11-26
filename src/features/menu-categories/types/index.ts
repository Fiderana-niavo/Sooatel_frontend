export interface MenuCategory {
  idCategory: string;
  label: string;
  description?: string;
}

export interface CreateMenuCategoryDto {
  label: string;
  description?: string;
}
