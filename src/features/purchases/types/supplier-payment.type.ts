export interface AllocationDto {
  allocationType: "DELIVERY" | "SUPPLIER_CREDIT";
  idDelivery?: string;
  amount: number;
}

export interface CreateSupplierPaymentDto {
  idSupplier: string;
  amount: number;
  idPaymentMethod: string;
  paymentDate?: string;
  notes?: string;
  allocations: AllocationDto[];
}

export interface PaymentSummaryItem {
  idPayment: string;
  ref: string;
  date: string;
  amount: number;
  method: string;
  methodBalance?: number;
}

export interface DeliveryPaymentSummary {
  idDelivery: string;
  ref: string;
  totalAmount: number;
  totalPaid: number;
  balanceDue: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  idSupplier: string;
  supplierCredit: number;
  payments?: PaymentSummaryItem[];
}

export interface PurchasePaymentSummary {
  idPurchase: string;
  ref: string;
  totalAmount: number;
  idSupplier: string;
  supplierName: string;
  payments?: PaymentSummaryItem[];
}

export interface DeliveryDestination {
  idDelivery: string;
  ref: string;
  deliveryDate: string;
  balanceDue: number;
  purchaseRef?: string;
}

export interface AvailableDestinations {
  deliveries: DeliveryDestination[];
  unvalidatedDeliveriesCount?: number;
}
