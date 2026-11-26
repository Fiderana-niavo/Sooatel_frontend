export interface DishProduction {
  idDishProduction: string;
  ref: string;
  productionDate: string;
  quantity: number;
  status: number;
  notes?: string | null;
  idItem: string;
  item?: { idItem: string; label: string; ref: string; quantity: number };
  operator?: { idEmployee: string; name: string; lastname: string };
}

export interface DishProductionDto {
  idItem: string;
  quantity: number;
  notes: string;
  productionDate?: string;
}

export interface DishProductionFilters {
  page: number;
  limit: number;
  idItem?: string;
  startDate?: string;
  endDate?: string;
  status?: number;
}
