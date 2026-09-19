export interface GeneratedScheduleRow {
  idEmployee: string;
  employeeName: string | null;
  idJobTitle: string | null;
  jobTitle: string | null;
  scheduleDate: string; // YYYY-MM-DD
  idShiftType: string | null;
  shiftLabel: string | null;
  customStartTime: string | null;
  customEndTime: string | null;
  isOnLeave: boolean;
}

export interface ScheduleResponse {
  idSchedule: string;
  scheduleDate: string;
  idEmployee: string;
  employeeName: string | null;
  idJobTitle: string | null;
  jobTitle: string | null;
  idShiftType: string | null;
  shiftLabel: string | null;
  customStartTime: string | null;
  customEndTime: string | null;
}

export interface AvailableEmployee {
  idEmployee: string;
  employeeName: string | null;
  idJobTitle: string | null;
  jobTitle: string | null;
  availabilities: Array<{
    dayOfWeek: number;
    idShiftType: string | null;
    shiftLabel: string | null;
    customStartTime: string | null;
    customEndTime: string | null;
  }>;
}

export interface TeamShiftAssignment {
  idTeam: string;
  idShiftType: string;
}

export interface GenerateByTeamDto {
  startDate: string;
  endDate: string;
  idRotationShift: string;
  teamIds: string[];
  shiftIds: string[];
}


export interface SaveScheduleDto {
  idEmployee: string;
  scheduleDate: string;
  idShiftType?: string | null;
  customStartTime?: string | null;
  customEndTime?: string | null;
}

export interface SaveSchedulesPayload {
  rows: SaveScheduleDto[];
  overwrite: boolean;
  startDate: string;
  endDate: string;
}

export interface CheckExistingResult {
  hasExisting: boolean;
  count: number;
  dates: string[];
}

export interface RequirementSlot {
  idJobTitle: string | null;
  jobTitle: string | null;
  idShiftType: string | null;
  shiftLabel: string | null;
  requiredCount: number;
}
