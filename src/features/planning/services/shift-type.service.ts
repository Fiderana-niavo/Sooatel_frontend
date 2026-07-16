import axios from "axios";
import type { ShiftType } from "../types/type";
import type { ApiResponse } from "@/types/api.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const ShiftTypeService = {
  getAll: async (): Promise<ShiftType[]> => {
    const res = await axios.get<ApiResponse<{ records: ShiftType[] }>>(`${BASE}/shift-types?limit=100`);
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload.records || [];
  },

  create: async (data: Partial<ShiftType>): Promise<ShiftType> => {
    const res = await axios.post<ApiResponse<ShiftType>>(`${BASE}/shift-types`, data);
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  update: async (id: string, data: Partial<ShiftType>): Promise<ShiftType> => {
    const res = await axios.put<ApiResponse<ShiftType>>(`${BASE}/shift-types/${id}`, data);
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  delete: async (id: string): Promise<void> => {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/shift-types/${id}`);
    if (!res.data.ok) throw new Error(res.data.error);
  },
};
