export interface Item {
  idItem: string;
  ref: string;
  label: string;
  isProduced?: boolean;
  quantity?: number;
  minimumStockLevel: number;
  reorderQuantity?: number;
  isPerishable: boolean;
  status: number;
  idProductType: string;
  idUnit: string;
  description?: string;
}

export interface CreateItemDto {
  ref: string;
  label: string;
  isProduced?: boolean;
  minimumStockLevel: number;
  reorderQuantity?: number;
  isPerishable: boolean;
  status: number;
  idProductType: string;
  idUnit: string;
  description?: string;
}
