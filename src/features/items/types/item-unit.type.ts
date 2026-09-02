import type { Item } from "./item.type";
import type { UnitOfMeasure } from "../../unit-of-measures/types";

export interface ItemUnit {
  idItemUnit: string;
  toStockRatio: number;
  alternativeUnitId: string;
  idItem: string;
  item?: Item;
  alternativeUnit?: UnitOfMeasure;
}

export interface CreateItemUnitDto {
  idItem: string;
  alternativeUnitId: string;
  toStockRatio: number;
}

export interface UpdateItemUnitDto {
  toStockRatio?: number;
}
