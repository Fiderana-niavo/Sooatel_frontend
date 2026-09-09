export interface StockMovement {
  idStockMovement: string;
  ref: string;
  movementDate: string;
  quantity: number;
  direction: number;
  status: number;
  reason?: string | null;
  idItem: string;
  item?: { idItem: string; label: string; ref: string };
  operator?: { idEmployee: string; name: string; lastname: string };
}

export interface StockMovementDto {
  idItem: string;
  quantity: number;
  direction: number;
  reason: string;
  movementDate?: string;
}

export interface StockMovementFilters {
  page: number;
  limit: number;
  idItem?: string;
  startDate?: string;
  endDate?: string;
  direction?: number;
  status?: number;
}

export type StockMovementTab = "overview" | "drafts" | "history" | "loss";
