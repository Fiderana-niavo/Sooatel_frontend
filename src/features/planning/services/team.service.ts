import axios from "axios";
import type { Team } from "../types/type";
import type { ApiResponse } from "@/types/api.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const TeamService = {
  getAll: async (): Promise<Team[]> => {
    const res = await axios.get<ApiResponse<{ records: Team[] }>>(`${BASE}/teams?limit=100`);
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload.records || [];
  },

  create: async (data: Partial<Team>): Promise<Team> => {
    const res = await axios.post<ApiResponse<Team>>(`${BASE}/teams`, data);
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  update: async (id: string, data: Partial<Team>): Promise<Team> => {
    const res = await axios.put<ApiResponse<Team>>(`${BASE}/teams/${id}`, data);
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  getMembers: async (idTeam: string): Promise<any[]> => {
    const res = await axios.get<ApiResponse<any[]>>(`${BASE}/teams/${idTeam}/members`);
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  getAvailableEmployees: async (): Promise<any[]> => {
    const res = await axios.get<ApiResponse<any[]>>(`${BASE}/teams/available-members`);
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  addMembers: async (idTeam: string, employeeIds: string[]): Promise<void> => {
    const res = await axios.post<ApiResponse<void>>(`${BASE}/teams/${idTeam}/members`, { employeeIds });
    if (!res.data.ok) throw new Error(res.data.error);
  },

  removeMember: async (idTeam: string, idEmployee: string): Promise<void> => {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/teams/${idTeam}/members/${idEmployee}`);
    if (!res.data.ok) throw new Error(res.data.error);
  },

  delete: async (id: string): Promise<void> => {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/teams/${id}`);
    if (!res.data.ok) throw new Error(res.data.error);
  },
};
