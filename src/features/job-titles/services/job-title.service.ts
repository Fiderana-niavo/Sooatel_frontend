import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type { JobTitle } from "../types/type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const JobTitleService = {
  getAll: async (): Promise<JobTitle[]> => {
    const res = await axios.get<ApiResponse<{ records: JobTitle[] } | JobTitle[]>>(`${BASE}/job-titles`);
    if (!res.data.ok) throw new Error(res.data.error);
    if (Array.isArray(res.data.payload)) {
      return res.data.payload;
    }
    return (res.data.payload as { records: JobTitle[] }).records || [];
  },

  create: async (title: string): Promise<JobTitle> => {
    const res = await axios.post<ApiResponse<JobTitle>>(`${BASE}/job-titles`, { title });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  update: async (id: string, title: string): Promise<JobTitle> => {
    const res = await axios.put<ApiResponse<JobTitle>>(`${BASE}/job-titles/${id}`, { title });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  delete: async (id: string): Promise<void> => {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/job-titles/${id}`);
    if (!res.data.ok) throw new Error(res.data.error);
  },
};
