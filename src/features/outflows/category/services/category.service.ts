import axios from "axios";
import type { OutflowCategory, OutflowCategoryDto } from "../../types";
import type { ApiResponse, PaginatedResponse } from "@/types/api.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const OutflowCategoryService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ records: OutflowCategory[], total: number }> => {
    const res = await axios.get<ApiResponse<PaginatedResponse<OutflowCategory>>>(`${BASE}/outflow-categories`, { params, headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  getOne: async (id: string): Promise<OutflowCategory> => {
    const res = await axios.get<ApiResponse<OutflowCategory>>(`${BASE}/outflow-categories/${id}`, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  create: async (data: OutflowCategoryDto): Promise<OutflowCategory> => {
    const res = await axios.post<ApiResponse<OutflowCategory>>(`${BASE}/outflow-categories`, data, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  update: async (id: string, data: OutflowCategoryDto): Promise<void> => {
    const res = await axios.put<ApiResponse<void>>(`${BASE}/outflow-categories/${id}`, data, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
  },

  delete: async (id: string): Promise<void> => {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/outflow-categories/${id}`, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
  },
};
