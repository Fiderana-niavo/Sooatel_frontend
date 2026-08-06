import type { InvoiceRecord } from "../../payments/types";

export interface SaleItem {
  idSaleItem?: string;
  idMenu: string;
  quantity: number;
  unitPrice: number;
}

export interface SaleFilters {
  page: number;
  limit: number;
  status?: number[];
  paymentStatus?: "UNPAID" | "PARTIAL" | "PAID";
}


export interface SalePayment {
  paymentDate: string;
  amount: number;
  idPaymentMethod: string;
  paymentCode?: string;
}

export interface SaleRefund {
  amount: number;
  idPaymentMethod: string;
  paymentDate?: string;
}

export interface SalePayload {
  saleDate: string;
  idSaler: string;
  tableNumber?: number;
  chargeToRoom?: boolean;
  idRoom?: string;
  invoiceNumber: string;
  items: SaleItem[];
  payment?: SalePayment;
  overpaymentAction?: "REFUND" | "ADJUST";
  idPaymentMethodRefund?: string;
  idPaymentToAdjust?: string;
  comment?: string;
  deliveryDate?: string;
}

export interface MenuItemRef {
  idMenu: string;
  name: string;
  salePrice: number;
}

export interface PaymentMethodRef {
  idPaymentMethod: string;
  methodName: string;
}


export interface SaleItemRecord {
  idSaleItem: string;
  idMenu: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  menu: {
    idMenu: string;
    salePrice: number;
    item?: { label: string };
  };
}

export interface SaleRecord {
  idSale: string;
  ref: string;
  saleDate: string;
  totalAmount: number;
  status: number;
  tableNumber: number | null;
  chargeToRoom: boolean | null;
  idRoom: string | null;
  saler: { idEmployee: string; name: string; lastname: string } | null;
  room: { idRoom: string; roomNumber: string } | null;
  comment: string | null;
  deliveryDate: string | null;
  saleItems: SaleItemRecord[];
  invoice?: InvoiceRecord;
  createdAt: string;
}
