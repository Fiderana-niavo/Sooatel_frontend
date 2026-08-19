import type { EmployeeRef, SuppliedItem } from "../../purchases/types/purchase.type";

export const DELIVERY_STATUS_LABELS: Record<number, string> = {
  0: "Validé",
  5: "Ouvert",
};

export interface PendingDetail {
  idPurchaseDetail: string;
  idSuppliedItem: string;
  quantity: number;
  unitPrice: number;
  alreadyDelivered: number;
  remaining: number;
  suppliedItem?: SuppliedItem;
}

export interface PurchaseDeliveryHistory {
  idDelivery: string;
  ref: string;
  deliveryDate: string;
  totalAmount: number;
  status: string;
  details: {
    idDeliveryDetail: string;
    idSuppliedItem: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    itemLabel?: string;
    itemRef?: string;
  }[];
}

export interface DeliveryListRecord {
  idDelivery: string;
  ref: string;
  deliveryDate: string;
  totalAmount: number;
  status: string;
  purchaseRef?: string;
  idSupplier?: string;
  supplierName?: string;
}

export interface DeliveryDetails {
  idDelivery: string;
  ref: string;
  deliveryDate: string;
  totalAmount: number;
  status: string;
  purchases: {
    idPurchase: string;
    ref: string;
    idSupplier?: string;
    supplierName?: string;
  }[];
  details: {
    idDetail: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    itemLabel?: string;
    idSuppliedItem?: string;
  }[];
}

export interface PendingPurchase {
  idPurchase: string;
  ref: string;
  purchaseDate: string;
  totalAmount: number;
  status: string;
  lifecycleStatus: string | number;
  purchaser?: EmployeeRef;
  details: PendingDetail[];
}

export interface DeliveryLineDto {
  idSuppliedItem: string;
  quantity: number;
}

export interface CreateDeliveryDto {
  idPurchases: string[];
  lines: DeliveryLineDto[];
}
