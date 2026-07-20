import api from "@/services/api";
import type { ItemType, CreateItemTypeDto } from "../types";

export class ItemTypeService {
  static async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<ItemType[]> {
    const response = await api.get("/item-types", { params });
    // Handle paginated response if backend returns it
    return response.data.data?.data || response.data.data || [];
  }

  static async getById(id: string): Promise<ItemType> {
    const response = await api.get(`/item-types/${id}`);
    return response.data.data;
  }

  static async create(data: CreateItemTypeDto): Promise<ItemType> {
    const response = await api.post("/item-types", data);
    return response.data.data;
  }

  static async update(id: string, data: Partial<CreateItemTypeDto>): Promise<ItemType> {
    const response = await api.put(`/item-types/${id}`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/item-types/${id}`);
  }
}
