export interface OutflowCategory {
  idOutflowCategory: string;
  label: string;
  code?: string | null;
}

export interface OutflowCategoryDto {
  label: string;
  code?: string | null;
}

export interface CashOutflow {
  idCashOutflows: string;
  ref: string;
  amount: number;
  outflowDate?: number | string;
  reason?: string | null;
  invoiceReference?: string | null;
  idProcessedBy: string;
  idJournal: string;
  status?: number;
  idOutflowCategory?: string | null;
  outflowCategory?: OutflowCategory;
}

export interface CashOutflowDto {
  ref: string;
  amount: number;
  outflowDate?: number | string;
  reason?: string | null;
  invoiceReference?: string | null;
  idProcessedBy: string;
  idJournal: string;
  status?: number;
  idOutflowCategory?: string | null;
}
export interface CashJournal { idJournal: string; ref: string; journalOpening: string; journalClosing?: string | null; expectedClosingBalance: number; actualClosingBalance?: number | null; cashDiscrepancy?: number | null; idCashier: string; }
