import api from "@/services/api";
import type { MenuCategory, CreateMenuCategoryDto } from "../types";

export class MenuCategoryService {
  static async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<MenuCategory[]> {
    const response = await api.get("/menu-categories", { params });
    // Handle paginated response if backend returns it
    return response.data.data?.data || response.data.data || [];
  }

  static async getById(id: string): Promise<MenuCategory> {
    const response = await api.get(`/menu-categories/${id}`);
    return response.data.data;
  }

  static async create(data: CreateMenuCategoryDto): Promise<MenuCategory> {
    const response = await api.post("/menu-categories", data);
    return response.data.data;
  }

  static async update(id: string, data: Partial<CreateMenuCategoryDto>): Promise<MenuCategory> {
    const response = await api.put(`/menu-categories/${id}`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/menu-categories/${id}`);
  }
}
