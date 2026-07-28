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

export interface SalePaymentRecord {
  idSalePayment: string;
  amount: number;
  type: "PAYMENT" | "REFUND" | "ADJUSTMENT";
  paymentDate: string;
  paymentMethod?: { methodName: string };
}

export interface SaleRecord {
  idSale: string;
  ref: string;
  saleDate: string;
  invoiceNumber: string;
  totalAmount: number;
  balanceDue: number;
  status: number;
  tableNumber: number | null;
  chargeToRoom: boolean | null;
  idRoom: string | null;
  saler: { idEmployee: string; name: string; lastname: string } | null;
  room: { idRoom: string; roomNumber: string } | null;
  saleItems: SaleItemRecord[];
  payments?: SalePaymentRecord[];
  createdAt: string;
}
