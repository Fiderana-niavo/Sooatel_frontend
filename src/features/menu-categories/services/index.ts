import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type { MenuCategory, CreateMenuCategoryDto } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export class MenuCategoryService {
  static async getAll(params?: Record<string, any>): Promise<MenuCategory[]> {
    const res = await axios.get<ApiResponse<{ records: MenuCategory[] } | MenuCategory[]>>(`${BASE}/menu-categories`, { params });
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    if (Array.isArray(res.data.payload)) {
      return res.data.payload;
    }
    return (res.data.payload as { records: MenuCategory[] }).records || [];
  }

  static async getById(id: string): Promise<MenuCategory> {
    const res = await axios.get<ApiResponse<MenuCategory>>(`${BASE}/menu-categories/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async create(data: CreateMenuCategoryDto): Promise<MenuCategory> {
    const res = await axios.post<ApiResponse<MenuCategory>>(`${BASE}/menu-categories`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async update(id: string, data: Partial<CreateMenuCategoryDto>): Promise<MenuCategory> {
    const res = await axios.put<ApiResponse<MenuCategory>>(`${BASE}/menu-categories/${id}`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async delete(id: string): Promise<void> {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/menu-categories/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
  }
}
