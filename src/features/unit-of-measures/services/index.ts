import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type { UnitOfMeasure, CreateUnitOfMeasureDto } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export class UnitOfMeasureService {
  static async getAll(params?: Record<string, any>): Promise<UnitOfMeasure[]> {
    const res = await axios.get<ApiResponse<{ records: UnitOfMeasure[] } | UnitOfMeasure[]>>(`${BASE}/unit-of-measures`, { params });
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    if (Array.isArray(res.data.payload)) {
      return res.data.payload;
    }
    return (res.data.payload as { records: UnitOfMeasure[] }).records || [];
  }

  static async getById(id: string): Promise<UnitOfMeasure> {
    const res = await axios.get<ApiResponse<UnitOfMeasure>>(`${BASE}/unit-of-measures/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async create(data: CreateUnitOfMeasureDto): Promise<UnitOfMeasure> {
    const res = await axios.post<ApiResponse<UnitOfMeasure>>(`${BASE}/unit-of-measures`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async update(id: string, data: Partial<CreateUnitOfMeasureDto>): Promise<UnitOfMeasure> {
    const res = await axios.put<ApiResponse<UnitOfMeasure>>(`${BASE}/unit-of-measures/${id}`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async delete(id: string): Promise<void> {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/unit-of-measures/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
  }
}
