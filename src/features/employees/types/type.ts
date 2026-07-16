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
  team?: { idTeam: string; teamName: string } | null;
  availabilities?: any[];
  internship?: {
    idInternship?: string;
    schoolName: string | null;
    academicSupervisorName: string | null;
    professionnalSupervisorName: string | null;
  } | null;
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
  idJobTitle: string | null;
  idEmploymentType: string | null;
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
  team: { idTeam: string; teamName: string } | null;
  availabilities: any[];
  // compatibility with form account stuff if needed
  hasUserAccount?: boolean;
  userAccount?: UserAccount;
}

export interface EmployeeAvailability {
  idAvailability: string;
  idShiftType: string | null;
  shiftLabel?: string;
  dayOfWeek: number | null; // 0=Sunday, 1=Monday...
  customStartTime: string | null;
  customEndTime: string | null;
}

export interface EmployeeSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  idJobTitle?: string;
  hasUserAccount?: "yes" | "no";
  isInternship?: "yes" | "no";
  sortBy?: "name" | "lastname" | "employeeCode";
  sortOrder?: "ASC" | "DESC";
}

export interface CreateEmployeeDto {
  name: string;
  lastname: string;
  birthdate?: string;
  address?: string;
  emailContact?: string;
  phoneNumber?: string;
  notes?: string;
  job?: {
    idJobTitle: string;
    idEmploymentType: string;
    assignmentDate: string;
    endDate: string | null;
    hasFixedSchedule: boolean;
  } | null;
  internship?: {
    schoolName: string | null;
    academicSupervisorName: string | null;
    professionnalSupervisorName: string | null;
  } | null;
  userAccount?: {
    username: string;
    password?: string;
    roles: string[];
    permissionsOverrides: Array<{
      idPermission: string;
      overrideType: "grant" | "deny" | "default";
    }>;
  } | null;
}

export interface ChangeJobDto {
  idJobTitle: string;
  idEmploymentType: string;
  assignmentDate: string;
  endDate: string | null;
  hasFixedSchedule: boolean;
}

export interface SetAvailabilityDto {
  dayOfWeek: number;
  customStartTime: string | null;
  customEndTime: string | null;
  idShiftType: string | null;
}


