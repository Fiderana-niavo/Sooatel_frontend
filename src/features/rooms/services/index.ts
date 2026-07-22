import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type { Room, CreateRoomDto } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export class RoomService {
  static async getAll(params?: Record<string, any>): Promise<Room[]> {
    const res = await axios.get<ApiResponse<{ records: Room[] } | Room[]>>(`${BASE}/rooms`, { params });
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    if (Array.isArray(res.data.payload)) {
      return res.data.payload;
    }
    return (res.data.payload as { records: Room[] }).records || [];
  }

  static async getById(id: string): Promise<Room> {
    const res = await axios.get<ApiResponse<Room>>(`${BASE}/rooms/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async create(data: CreateRoomDto): Promise<Room> {
    const res = await axios.post<ApiResponse<Room>>(`${BASE}/rooms`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async update(id: string, data: Partial<CreateRoomDto>): Promise<Room> {
    const res = await axios.put<ApiResponse<Room>>(`${BASE}/rooms/${id}`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async delete(id: string): Promise<void> {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/rooms/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
  }
}
