import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type { ItemType, CreateItemTypeDto } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export class ItemTypeService {
  static async getAll(params?: Record<string, any>): Promise<ItemType[]> {
    const res = await axios.get<ApiResponse<{ records: ItemType[] } | ItemType[]>>(`${BASE}/item-types`, { params });
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    if (Array.isArray(res.data.payload)) {
      return res.data.payload;
    }
    return (res.data.payload as { records: ItemType[] }).records || [];
  }

  static async getById(id: string): Promise<ItemType> {
    const res = await axios.get<ApiResponse<ItemType>>(`${BASE}/item-types/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async create(data: CreateItemTypeDto): Promise<ItemType> {
    const res = await axios.post<ApiResponse<ItemType>>(`${BASE}/item-types`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async update(id: string, data: Partial<CreateItemTypeDto>): Promise<ItemType> {
    const res = await axios.put<ApiResponse<ItemType>>(`${BASE}/item-types/${id}`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async delete(id: string): Promise<void> {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/item-types/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
  }
}
