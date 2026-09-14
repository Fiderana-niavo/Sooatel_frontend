import axios from "axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api.type";
import type { School } from "../types/type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const schoolService = {
  getAll: async () => {
    const { data } = await axios.get<ApiResponse<PaginatedResponse<School>>>(`${BASE}/schools`);
    return data.payload?.records || [];
  },
  
  create: async (school: Partial<School>) => {
    const { data } = await axios.post<ApiResponse<School>>(`${BASE}/schools`, school);
    return data.payload;
  },
  
  update: async (id: string, school: Partial<School>) => {
    const { data } = await axios.put<ApiResponse<School>>(`${BASE}/schools/${id}`, school);
    return data.payload;
  },
  
  delete: async (id: string) => {
    await axios.delete(`${BASE}/schools/${id}`);
  }
};
