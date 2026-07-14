import type { Role } from "@/features/roles/types";

export interface UserAccount {
  idUser?: string;
  username: string;
  password?: string;
  roles: Role[];
  permissionsOverrides?: {
    idPermission: string;
    overrideType: "grant" | "deny" | "default";
  }[];
}

export interface JobTitle {
  idJobTitle: string;
  title: string;
}

export interface Employee {
  idEmployee?: string;
  employeeCode?: string;
  name: string;
  lastname: string;
  birthdate?: string;
  address?: string;
  emailContact?: string;
  phoneNumber?: string;
  notes?: string;
  idJobTitle?: string;
  assignmentDate?: string;
  endDate?: string;
  hasFixedSchedule?: boolean;
  idEmploymentType?: string;
  isInternship?: boolean;
  hasUserAccount: boolean;
  userAccount?: UserAccount;
}

export interface EmployeeListItem {
  idEmployee: string;
  employeeCode: string;
  name: string | null;
  lastname: string | null;
  jobTitle: string | null;
  isInternship: boolean;
  hasAccount: boolean;
}

export interface EmployeeJobInfo {
  idEmpJob: string;
  assignmentDate: string | null;
  endDate: string | null;
  hasFixedSchedule: boolean | null;
  jobTitle: string | null;
}

export interface InternshipInfo {
  idInternship: string;
  schoolName: string | null;
  academicSupervisorName: string | null;
  professionnalSupervisorName: string | null;
}

export interface EmployeeDetail {
  idEmployee: string;
  employeeCode: string;
  name: string | null;
  lastname: string | null;
  birthdate: string | null;
  address: string | null;
  emailContact: string | null;
  phoneNumber: string | null;
  notes: string | null;
  job: EmployeeJobInfo | null;
  internship: InternshipInfo | null;
  // compatibility with form account stuff if needed
  hasUserAccount?: boolean;
  userAccount?: UserAccount;
}

export interface EmployeeAvailability {
  idAvailability: string;
  idShiftType: string | null;
  dayOfWeek: number | null; // 0=Sunday, 1=Monday...
  customStartTime: string | null;
  customEndTime: string | null;
}

