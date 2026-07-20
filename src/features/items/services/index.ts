import api from "@/services/api";
import type { Item, CreateItemDto } from "../types";

export class ItemService {
  static async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<Item[]> {
    const response = await api.get("/items", { params });
    // Handle paginated response if backend returns it
    return response.data.data?.data || response.data.data || [];
  }

  static async getById(id: string): Promise<Item> {
    const response = await api.get(`/items/${id}`);
    return response.data.data;
  }

  static async create(data: CreateItemDto): Promise<Item> {
    const response = await api.post("/items", data);
    return response.data.data;
  }

  static async update(id: string, data: Partial<CreateItemDto>): Promise<Item> {
    const response = await api.put(`/items/${id}`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/items/${id}`);
  }
}
