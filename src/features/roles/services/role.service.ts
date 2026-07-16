import axios from "axios";
import type { Role } from "../types/type";
import type { ApiResponse, PaginatedResponse } from "@/types/api.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const RoleService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ records: Role[], first: Role | null, total: number }> => {
    const res = await axios.get<ApiResponse<PaginatedResponse<Role> & { first: Role | null }>>(`${BASE}/roles`, { params });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  getOne: async (id: string): Promise<Role> => {
    const res = await axios.get<ApiResponse<Role>>(`${BASE}/roles/${id}`);
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  create: async (data: { label: string; description?: string; permissionIds: string[] }): Promise<Role> => {
    const res = await axios.post<ApiResponse<Role>>(`${BASE}/roles`, data);
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  update: async (id: string, data: { label: string; description?: string; permissionIds: string[] }): Promise<void> => {
    const res = await axios.put<ApiResponse<void>>(`${BASE}/roles/${id}`, data);
    if (!res.data.ok) throw new Error(res.data.error);
  },

  delete: async (id: string): Promise<void> => {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/roles/${id}`);
    if (!res.data.ok) throw new Error(res.data.error);
  },
};
