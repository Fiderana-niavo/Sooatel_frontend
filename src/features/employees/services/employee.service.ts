import axios from "axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api.type";
import type { EmployeeListItem, EmployeeDetail, EmployeeSearchParams, CreateEmployeeDto, ChangeJobDto, SetAvailabilityDto } from "../types/type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const EmployeeService = {
  getAll: async (params?: EmployeeSearchParams): Promise<PaginatedResponse<EmployeeListItem>> => {
    const res = await axios.get<ApiResponse<PaginatedResponse<EmployeeListItem>>>(`${BASE}/employees`, {
      params: { ...params, _t: Date.now() } //date.now : system has to get fresh data not cached, util for data that always need immediatly refreshed data
    });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  getById: async (id: string): Promise<EmployeeDetail> => {
    const res = await axios.get<ApiResponse<EmployeeDetail>>(`${BASE}/employees/${id}`, {
      params: { _t: Date.now() }
    });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  create: async (data: CreateEmployeeDto): Promise<EmployeeDetail> => {
    const res = await axios.post<ApiResponse<EmployeeDetail>>(`${BASE}/employees`, data);
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  update: async (id: string, data: Partial<CreateEmployeeDto>): Promise<void> => {
    const res = await axios.put<ApiResponse<void>>(`${BASE}/employees/${id}`, data);
    if (!res.data.ok) throw new Error(res.data.error);
  },

  delete: async (id: string): Promise<void> => {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/employees/${id}`);
    if (!res.data.ok) throw new Error(res.data.error);
  },

  changeJob: async (id: string, data: ChangeJobDto): Promise<void> => {
    const res = await axios.post<ApiResponse<void>>(`${BASE}/employees/${id}/change-job`, data);
    if (!res.data.ok) throw new Error(res.data.error);
  },

  endJob: async (id: string, endDate: string): Promise<void> => {
    const res = await axios.post<ApiResponse<void>>(`${BASE}/employees/${id}/end-job`, { endDate });
    if (!res.data.ok) throw new Error(res.data.error);
  },

  renewContract: async (id: string, data: ChangeJobDto): Promise<void> => {
    const res = await axios.post<ApiResponse<void>>(`${BASE}/employees/${id}/renew-contract`, data);
    if (!res.data.ok) throw new Error(res.data.error);
  },

  setTeam: async (id: string, idTeam: string | null): Promise<void> => {
    const res = await axios.post<ApiResponse<void>>(`${BASE}/employees/${id}/team`, { idTeam });
    if (!res.data.ok) throw new Error(res.data.error);
  },

  setAvailabilities: async (id: string, availabilities: SetAvailabilityDto[]): Promise<void> => {
    const res = await axios.post<ApiResponse<void>>(`${BASE}/employees/${id}/availabilities`, availabilities);
    if (!res.data.ok) throw new Error(res.data.error);
  },

  generateAccessToken: async (userId: string): Promise<{ token: string; expiresAt: string }> => {
    const res = await axios.post<ApiResponse<{ token: string; expiresAt: string }>>(`${BASE}/auth/users/${userId}/token`, { type: "PWD_RESET" });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },
};
