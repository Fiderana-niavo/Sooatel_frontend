import axios from "axios";
import type { CashOutflow, CashOutflowDto } from "../../types";
import type { ApiResponse, PaginatedResponse } from "@/types/api.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const CashOutflowService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ records: CashOutflow[], total: number }> => {
    const res = await axios.get<ApiResponse<PaginatedResponse<CashOutflow>>>(`${BASE}/cash-outflows`, { params, headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  getOne: async (id: string): Promise<CashOutflow> => {
    const res = await axios.get<ApiResponse<CashOutflow>>(`${BASE}/cash-outflows/${id}`, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  create: async (data: CashOutflowDto): Promise<CashOutflow> => {
    const res = await axios.post<ApiResponse<CashOutflow>>(`${BASE}/cash-outflows`, data, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  update: async (id: string, data: CashOutflowDto): Promise<void> => {
    const res = await axios.put<ApiResponse<void>>(`${BASE}/cash-outflows/${id}`, data, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
  },

  delete: async (id: string): Promise<void> => {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/cash-outflows/${id}`, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
  },
};
