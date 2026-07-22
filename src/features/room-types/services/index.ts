import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type { RoomType, CreateRoomTypeDto } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export class RoomTypeService {
  static async getAll(params?: Record<string, any>): Promise<RoomType[]> {
    const res = await axios.get<ApiResponse<{ records: RoomType[] } | RoomType[]>>(`${BASE}/room-types`, { params });
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    if (Array.isArray(res.data.payload)) {
      return res.data.payload;
    }
    return (res.data.payload as { records: RoomType[] }).records || [];
  }

  static async getById(id: string): Promise<RoomType> {
    const res = await axios.get<ApiResponse<RoomType>>(`${BASE}/room-types/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async create(data: CreateRoomTypeDto): Promise<RoomType> {
    const res = await axios.post<ApiResponse<RoomType>>(`${BASE}/room-types`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async update(id: string, data: Partial<CreateRoomTypeDto>): Promise<RoomType> {
    const res = await axios.put<ApiResponse<RoomType>>(`${BASE}/room-types/${id}`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async delete(id: string): Promise<void> {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/room-types/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
  }
}
