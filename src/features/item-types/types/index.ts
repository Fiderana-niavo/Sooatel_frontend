export interface ItemType {
  idProductType: string;
  label?: string; description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateItemTypeDto {
  label?: string; description?: string;
}
