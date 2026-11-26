export interface UnitOfMeasure {
  idUnit: string;
  label: string;
  symbol: string;
}

export interface CreateUnitOfMeasureDto {
  label: string;
  symbol: string;
}
