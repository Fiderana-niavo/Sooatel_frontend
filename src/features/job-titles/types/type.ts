export interface JobTitle {
  idJobTitle: string;
  title: string;
}

export interface EmployeeRequirement {
  idRequirement: string;
  dayOfWeek: number;
  requiredCount: number;
  idShiftType: string;
  shiftLabel: string | null;
  idJobTitle: string;
  jobTitle?: string | null;
}

export interface CreateRequirementDto {
  dayOfWeek: number;
  requiredCount: number;
  idShiftType: string;
  idJobTitle: string;
}

export interface BulkCreateRequirementDto {
  dayOfWeeks: number[];
  idShiftTypes: string[];
  idJobTitle: string;
  requiredCount: number;
}
