import axios from "axios";
import type { PermissionItem, PermissionCategory } from "../types/index";
import type { ApiResponse, PaginatedResponse } from "@/types/api.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const PermissionService = {
  getAllGrouped: async (): Promise<PermissionCategory[]> => {
    // Fetch all permissions with a large limit to get everything
    const res = await axios.get<ApiResponse<PaginatedResponse<any>>>(`${BASE}/permissions`, {
      params: { limit: 1000 },
    });
    
    if (!res.data.ok) throw new Error(res.data.error);
    
    const records = res.data.payload.records;
    
    // Group by category name
    const groups: Record<string, { category: any, permissions: PermissionItem[] }> = {};
    
    for (const record of records) {
      const catName = record.category?.name || "Autres";
      if (!groups[catName]) {
        groups[catName] = { category: record.category, permissions: [] };
      }
      
      groups[catName].permissions.push({
        idPermission: record.idPermission,
        name: record.name,
        code: record.code,
        description: record.description,
        categoryLabel: catName,
      } as PermissionItem);
    }
    
    // Convert to array
    return Object.entries(groups).map(([category, data]) => ({
      category,
      permissions: data.permissions,
      categoryData: data.category,
    }));
  },

  getAll: async (params?: { page?: number; limit?: number; search?: string; idCategory?: string }) => {
    const res = await axios.get<ApiResponse<PaginatedResponse<any>>>(`${BASE}/permissions`, { params });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  create: async (data: { name: string; code: string; description?: string; idCategory: string }) => {
    const res = await axios.post<ApiResponse<any>>(`${BASE}/permissions`, data);
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  update: async (id: string, data: { name: string; code: string; description?: string; idCategory: string }) => {
    const res = await axios.put<ApiResponse<void>>(`${BASE}/permissions/${id}`, data);
    if (!res.data.ok) throw new Error(res.data.error);
  },

  delete: async (id: string) => {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/permissions/${id}`);
    if (!res.data.ok) throw new Error(res.data.error);
  },

  getCategories: async (params?: { page?: number; limit?: number; search?: string }) => {
    const res = await axios.get<ApiResponse<PaginatedResponse<any>>>(`${BASE}/permission-categories`, { params });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  }
};
