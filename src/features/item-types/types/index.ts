export interface ItemType {
  idProductType: string;
  label: string;
  description?: string;
}

export interface CreateItemTypeDto {
  label: string;
  description?: string;
}
