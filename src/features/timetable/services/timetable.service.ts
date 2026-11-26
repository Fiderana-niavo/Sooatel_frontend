import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type {
  GenerateByTeamDto,
  GeneratedScheduleRow,
  SaveSchedulesPayload,
  ScheduleResponse,
  AvailableEmployee,
  CheckExistingResult,
  LastRotationInfo,
} from "../types/timetable.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const TimetableService = {
  generateByTeam: async (
    dto: GenerateByTeamDto,
  ): Promise<GeneratedScheduleRow[]> => {
    const res = await axios.post<ApiResponse<GeneratedScheduleRow[]>>(
      `${BASE}/schedules/generate/by-team`,
      dto,
    );
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  saveSchedules: async (
    payload: SaveSchedulesPayload,
  ): Promise<ScheduleResponse[]> => {
    const res = await axios.post<ApiResponse<ScheduleResponse[]>>(
      `${BASE}/schedules`,
      payload,
    );
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  getByRange: async (
    startDate: string,
    endDate: string,
  ): Promise<ScheduleResponse[]> => {
    const res = await axios.get<ApiResponse<ScheduleResponse[]>>(
      `${BASE}/schedules?startDate=${startDate}&endDate=${endDate}`,
    );
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  checkExisting: async (
    startDate: string,
    endDate: string,
  ): Promise<CheckExistingResult> => {
    const res = await axios.get<ApiResponse<CheckExistingResult>>(
      `${BASE}/schedules/check-existing?startDate=${startDate}&endDate=${endDate}`,
    );
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  getAvailableEmployees: async (params: {
    date?: string;
    idJobTitle?: string;
  }): Promise<AvailableEmployee[]> => {
    const query = new URLSearchParams();
    if (params.date) query.set("date", params.date);
    if (params.idJobTitle) query.set("idJobTitle", params.idJobTitle);
    const res = await axios.get<ApiResponse<AvailableEmployee[]>>(
      `${BASE}/schedules/available-employees?${query.toString()}`,
    );
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  getLastRotationInfo: async (
    startDate: string,
    idRotationShift: string,
    teamIds: string[]
  ): Promise<LastRotationInfo> => {
    const params = new URLSearchParams();
    params.append("startDate", startDate);
    params.append("idShiftType", idRotationShift);
    teamIds.forEach(id => params.append("teamIds", id));
    
    const res = await axios.get<ApiResponse<LastRotationInfo>>(
      `${BASE}/schedules/last-rotation?${params.toString()}`
    );
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },
};
