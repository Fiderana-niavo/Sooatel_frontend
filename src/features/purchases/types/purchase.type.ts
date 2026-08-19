export interface EmployeeRef {
  idUser?: string;
  idEmployee?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  lastname?: string;
}
import type { Supplier } from "@/features/suppliers/types/supplier.type";
import type { Item } from "@/features/items/types";
import type { SupplierProduct } from "@/features/suppliers/types/supplier.type";

export interface SuppliedItem {
  idSuppliedItem: string;
  idItem: string;
  idSupplierProduct: string;
  item?: Item;
  supplierProduct?: SupplierProduct;
}

export interface PurchaseDetail {
  idPurchaseDetail?: string;
  idPurchase?: string;
  idSuppliedItem: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  suppliedItem?: SuppliedItem;
}

export interface Purchase {
  idPurchase: string;
  ref: string;
  purchaseDate: string;
  totalAmount: number;
  balanceDue: number;
  status: string | number;
  lifecycleStatus?: string | number;
  idSupplier: string;
  idPurchaser: string;
  supplier?: Supplier;
  purchaser?: EmployeeRef;
  details?: PurchaseDetail[];
}

export interface CreatePurchaseDto {
  purchaseDate: string;
  idSupplier: string;
  idPurchaser: string;
  details: {
    idSuppliedItem: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export const PURCHASE_STATUS_LABELS: Record<number, string> = {
  6: "Créé",
  3: "Partiellement Livré",
  0: "Livré",
};


