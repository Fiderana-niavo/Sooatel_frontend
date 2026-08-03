import axios from "axios";
import type { CashMovementCategory, CashMovementCategoryDto } from "../../types";
import type { ApiResponse, PaginatedResponse } from "@/types/api.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const CashMovementCategoryService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ records: CashMovementCategory[], total: number }> => {
    const res = await axios.get<ApiResponse<PaginatedResponse<CashMovementCategory>>>(`${BASE}/cash-movement-categories`, { params, headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  getOne: async (id: string): Promise<CashMovementCategory> => {
    const res = await axios.get<ApiResponse<CashMovementCategory>>(`${BASE}/cash-movement-categories/${id}`, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  create: async (data: CashMovementCategoryDto): Promise<CashMovementCategory> => {
    const res = await axios.post<ApiResponse<CashMovementCategory>>(`${BASE}/cash-movement-categories`, data, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  update: async (id: string, data: CashMovementCategoryDto): Promise<void> => {
    const res = await axios.put<ApiResponse<void>>(`${BASE}/cash-movement-categories/${id}`, data, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
  },

  delete: async (id: string): Promise<void> => {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/cash-movement-categories/${id}`, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
  },
};
