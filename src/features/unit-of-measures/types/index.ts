export interface UnitOfMeasure {
  idUnit: string;
  label?: string; symbol?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUnitOfMeasureDto {
  label?: string; symbol?: string;
}
