import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type { EmployeeRequirement, CreateRequirementDto, BulkCreateRequirementDto } from "../types/type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const EmployeeRequirementService = {
  getAll: async (): Promise<EmployeeRequirement[]> => {
    const res = await axios.get<ApiResponse<{ records: EmployeeRequirement[] }>>(
      `${BASE}/employee-requirements`,
      { params: { limit: 200 } },
    );
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload.records;
  },

  getByJobTitle: async (idJobTitle: string): Promise<EmployeeRequirement[]> => {
    const res = await axios.get<ApiResponse<{ records: EmployeeRequirement[] }>>(
      `${BASE}/employee-requirements`,
      { params: { idJobTitle } },
    );
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload.records;
  },

  create: async (data: CreateRequirementDto): Promise<EmployeeRequirement> => {
    const res = await axios.post<ApiResponse<EmployeeRequirement>>(
      `${BASE}/employee-requirements`,
      data,
    );
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  update: async (id: string, data: CreateRequirementDto): Promise<void> => {
    const res = await axios.put<ApiResponse<void>>(
      `${BASE}/employee-requirements/${id}`,
      data,
    );
    if (!res.data.ok) throw new Error(res.data.error);
  },

  delete: async (id: string): Promise<void> => {
    const res = await axios.delete<ApiResponse<void>>(
      `${BASE}/employee-requirements/${id}`,
    );
    if (!res.data.ok) throw new Error(res.data.error);
  },

  bulkCreate: async (data: BulkCreateRequirementDto[]): Promise<{ created: number; skipped: number }> => {
    const res = await axios.post<ApiResponse<{ created: number; skipped: number }>>(
      `${BASE}/employee-requirements/bulk`,
      data,
    );
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },
};
