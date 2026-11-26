export interface PaymentRecord {
  idPayment: string;
  ref: string;
  amount: number;
  paymentDate: string;
  paymentCode?: string;
  paymentMethod?: { methodName: string; label?: string };
  idCashMovement?: string | null;
  cashMovement?: {
    idCashMovement: string;
    reason: string | null;
    amount: number;
  } | null;
}

export interface InvoiceRecord {
  idInvoice: string;
  invoiceNumberSystem: string;
  invoiceNumber: string | null;
  invoiceDate: string;
  totalAmount: number;
  balanceDue: number;
  status: number;
  payments?: PaymentRecord[];
}

export interface CreatePaymentDto {
  amount: number;
  idPaymentMethod: string;
  paymentDate?: string;
  paymentCode?: string;
}
