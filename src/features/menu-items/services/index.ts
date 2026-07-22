import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type { MenuItem, CreateMenuItemDto } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export class MenuItemService {
  static async getAll(params?: Record<string, any>): Promise<MenuItem[]> {
    const res = await axios.get<ApiResponse<{ records: MenuItem[] } | MenuItem[]>>(`${BASE}/menu-items`, { params });
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    if (Array.isArray(res.data.payload)) {
      return res.data.payload;
    }
    return (res.data.payload as { records: MenuItem[] }).records || [];
  }

  static async getById(id: string): Promise<MenuItem> {
    const res = await axios.get<ApiResponse<MenuItem>>(`${BASE}/menu-items/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async create(data: CreateMenuItemDto): Promise<MenuItem> {
    const res = await axios.post<ApiResponse<MenuItem>>(`${BASE}/menu-items`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async update(id: string, data: Partial<CreateMenuItemDto>): Promise<MenuItem> {
    const res = await axios.put<ApiResponse<MenuItem>>(`${BASE}/menu-items/${id}`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async delete(id: string): Promise<void> {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/menu-items/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
  }
}
