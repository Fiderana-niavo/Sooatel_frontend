import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type { Event, CreateEventDto } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export class EventService {
  static async getAll(params?: Record<string, any>): Promise<Event[]> {
    const res = await axios.get<ApiResponse<{ records: Event[] } | Event[]>>(`${BASE}/events`, { params });
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    if (Array.isArray(res.data.payload)) {
      return res.data.payload;
    }
    return (res.data.payload as { records: Event[] }).records || [];
  }

  static async getById(id: string): Promise<Event> {
    const res = await axios.get<ApiResponse<Event>>(`${BASE}/events/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async create(data: CreateEventDto): Promise<Event> {
    const res = await axios.post<ApiResponse<Event>>(`${BASE}/events`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async update(id: string, data: Partial<CreateEventDto>): Promise<Event> {
    const res = await axios.put<ApiResponse<Event>>(`${BASE}/events/${id}`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async delete(id: string): Promise<void> {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/events/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
  }
}
