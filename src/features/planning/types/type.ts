export interface Team {
  idTeam: string;
  teamName: string;
  description: string | null;
}

export interface ShiftType {
  idShiftType: string;
  label: string;
  customStartTime: string; // e.g. "08:00"
  customEndTime: string; // e.g. "16:00"
  description: string | null;
}
