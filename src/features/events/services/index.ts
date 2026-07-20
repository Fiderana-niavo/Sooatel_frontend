import api from "@/services/api";
import type { Event, CreateEventDto } from "../types";

export class EventService {
  static async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<Event[]> {
    const response = await api.get("/events", { params });
    // Handle paginated response if backend returns it
    return response.data.data?.data || response.data.data || [];
  }

  static async getById(id: string): Promise<Event> {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  }

  static async create(data: CreateEventDto): Promise<Event> {
    const response = await api.post("/events", data);
    return response.data.data;
  }

  static async update(id: string, data: Partial<CreateEventDto>): Promise<Event> {
    const response = await api.put(`/events/${id}`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  }
}
