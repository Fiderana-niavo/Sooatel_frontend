import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type { Item, CreateItemDto } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export class ItemService {
  static async getAll(params?: Record<string, any>): Promise<Item[]> {
    const res = await axios.get<ApiResponse<{ records: Item[] } | Item[]>>(`${BASE}/items`, { params });
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    if (Array.isArray(res.data.payload)) {
      return res.data.payload;
    }
    return (res.data.payload as { records: Item[] }).records || [];
  }

  static async getById(id: string): Promise<Item> {
    const res = await axios.get<ApiResponse<Item>>(`${BASE}/items/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async create(data: CreateItemDto): Promise<Item> {
    const res = await axios.post<ApiResponse<Item>>(`${BASE}/items`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async update(id: string, data: Partial<CreateItemDto>): Promise<Item> {
    const res = await axios.put<ApiResponse<Item>>(`${BASE}/items/${id}`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async delete(id: string): Promise<void> {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/items/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
  }
}
