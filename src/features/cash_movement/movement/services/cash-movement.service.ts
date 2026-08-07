import axios from "axios";
import type { CashMovement, CashMovementDto } from "../../types";
import type { ApiResponse, PaginatedResponse } from "@/types/api.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const CashMovementService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; direction?: number }): Promise<{ records: CashMovement[], total: number }> => {
    const res = await axios.get<ApiResponse<PaginatedResponse<CashMovement>>>(`${BASE}/cash-movements`, { params, headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  getOne: async (id: string): Promise<CashMovement> => {
    const res = await axios.get<ApiResponse<CashMovement>>(`${BASE}/cash-movements/${id}`, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  create: async (data: CashMovementDto): Promise<CashMovement> => {
    const res = await axios.post<ApiResponse<CashMovement>>(`${BASE}/cash-movements`, data, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  update: async (id: string, data: CashMovementDto): Promise<void> => {
    const res = await axios.put<ApiResponse<void>>(`${BASE}/cash-movements/${id}`, data, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
  },

  delete: async (id: string): Promise<void> => {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/cash-movements/${id}`, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
  },
};
