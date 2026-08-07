export interface CashMovementCategory {
  idCashMovementCategory: string;
  label: string;
  allowedDirection: number;
}

export interface CashMovementCategoryDto {
  label: string;
  allowedDirection: number;
}

export interface PaymentMethod {
  idPaymentMethod: string;
  label: string;
}

export interface PaymentMethodBalance {
  idPaymentMethodBalance: string;
  idJournal: string;
  idPaymentMethod: string;
  amount: number;
  paymentMethod?: PaymentMethod;
}

export interface CashMovement {
  idCashMovement: string;
  ref: string;
  amount: number;
  movementDate?: number | string;
  reason?: string | null;
  invoiceReference?: string | null;
  direction: number;
  idProcessedBy: string;
  idJournal: string;
  status?: number;
  idCashMovementCategory?: string | null;
  cashMovementCategory?: CashMovementCategory;
  idPaymentMethod: string;
  paymentMethod?: PaymentMethod;
}

export interface CashMovementDto {
  ref: string;
  amount: number;
  movementDate?: number | string;
  reason?: string | null;
  invoiceReference?: string | null;
  direction: number;
  idProcessedBy: string;
  idJournal: string;
  status?: number;
  idCashMovementCategory?: string | null;
  idPaymentMethod: string;
}

export interface CashJournal {
  idJournal: string;
  ref: string;
  journalOpening: string;
  journalClosing?: string | null;
  expectedClosingBalance: number;
  actualClosingBalance?: number | null;
  cashDiscrepancy?: number | null;
  idCashier: string;
  cashier?: { idEmployee: string; firstName: string; lastName: string };
  paymentMethodBalances?: PaymentMethodBalance[];
}
