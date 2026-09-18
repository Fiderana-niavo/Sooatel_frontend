export interface LeaveTransaction {
  idTransaction: string;
  transactionType: "ALLOCATION" | "USAGE" | "ADVANCE" | "SALARY_DEDUCTION";
  amount: number;
  createdAt: string;
  idLeave: string | null;
  idLeaveType: string;
  leaveTypeLabel: string | null;
  idEmployee: string;
}

export interface LeaveBalance {
  idEmployeeLeaveBalance: string;
  idEmployee: string;
  idLeaveType: string;
  leaveTypeLabel: string | null;
  allocatedDays: number;
  usedDays: number;
  advanceDays: number;
  availableDays: number;
}

export interface CreateLeaveDto {
  idEmployee: string;
  idLeaveType: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  leaveUnit?: string;
  deductFromAnnual?: boolean;
}

export interface OverflowResolutionDto {
  idEmployee: string;
  idLeaveType: string;
  startDate: string;
  endDate: string;
  leaveUnit?: string;
  capDays: number;
  overflowDays: number;
  resolution: "ANNUAL" | "UNPAID";
  idAnnualLeaveType?: string;
  idUnpaidLeaveType?: string;
}

export interface OverflowCheckResponse {
  needsOverflowResolution: true;
  capDays: number;
  overflowDays: number;
  leaveTypeLabel: string;
}

export interface LeaveResponse {
  idLeave: string;
  ref: string;
  startDate: string;
  endDate: string;
  leaveUnit: string;
  status: number;
  statusLabel: string;
  idEmployee: string;
  employeeName: string | null;
  idLeaveType: string;
  leaveTypeLabel: string | null;
  isAdvance: boolean;
}

export interface LeaveType {
  idLeaveType: string;
  label: string;
  isPaid: boolean;
  isActive: boolean;
  deductionMode: "ALWAYS" | "NEVER" | "OPTIONAL";
  cap: number | null;
  capPeriod: "ANNUAL" | "LIFETIME" | null;
  requiresProof: boolean;
}
