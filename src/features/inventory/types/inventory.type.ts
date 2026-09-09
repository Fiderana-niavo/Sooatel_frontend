export interface LossDto {
  idItem: string;
  quantity: number;
  reason: string;
  movementDate?: string;
}

export interface InventoryLineDto {
  idItem: string;
  physicalQty: number;
}

// Local UI row for InventorySheet
export interface InventoryRow {
  idItem: string;
  label: string;
  unit: string;
  theoretical: number;
  physical: number | "";
  weightedAverageCost: number;
}
