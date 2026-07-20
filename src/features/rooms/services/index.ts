import api from "@/services/api";
import type { Room, CreateRoomDto } from "../types";

export class RoomService {
  static async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<Room[]> {
    const response = await api.get("/rooms", { params });
    // Handle paginated response if backend returns it
    return response.data.data?.data || response.data.data || [];
  }

  static async getById(id: string): Promise<Room> {
    const response = await api.get(`/rooms/${id}`);
    return response.data.data;
  }

  static async create(data: CreateRoomDto): Promise<Room> {
    const response = await api.post("/rooms", data);
    return response.data.data;
  }

  static async update(id: string, data: Partial<CreateRoomDto>): Promise<Room> {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/rooms/${id}`);
  }
}
