import api from "@/services/api";
import type { MenuItem, CreateMenuItemDto } from "../types";

export class MenuItemService {
  static async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<MenuItem[]> {
    const response = await api.get("/menu-items", { params });
    // Handle paginated response if backend returns it
    return response.data.data?.data || response.data.data || [];
  }

  static async getById(id: string): Promise<MenuItem> {
    const response = await api.get(`/menu-items/${id}`);
    return response.data.data;
  }

  static async create(data: CreateMenuItemDto): Promise<MenuItem> {
    const response = await api.post("/menu-items", data);
    return response.data.data;
  }

  static async update(id: string, data: Partial<CreateMenuItemDto>): Promise<MenuItem> {
    const response = await api.put(`/menu-items/${id}`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/menu-items/${id}`);
  }
}
