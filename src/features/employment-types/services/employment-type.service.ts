import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type { EmploymentType } from "../types/type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const EmploymentTypeService = {
  getAll: async (): Promise<EmploymentType[]> => {
    const res = await axios.get<ApiResponse<EmploymentType[]>>(`${BASE}/employment-types`);
    if (!res.data.ok) throw new Error(res.data.error);
    return Array.isArray(res.data.payload) ? res.data.payload : [];
  },
};
