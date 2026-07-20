import api from "@/services/api";
import type { UnitOfMeasure, CreateUnitOfMeasureDto } from "../types";

export class UnitOfMeasureService {
  static async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<UnitOfMeasure[]> {
    const response = await api.get("/unit-of-measures", { params });
    // Handle paginated response if backend returns it
    return response.data.data?.data || response.data.data || [];
  }

  static async getById(id: string): Promise<UnitOfMeasure> {
    const response = await api.get(`/unit-of-measures/${id}`);
    return response.data.data;
  }

  static async create(data: CreateUnitOfMeasureDto): Promise<UnitOfMeasure> {
    const response = await api.post("/unit-of-measures", data);
    return response.data.data;
  }

  static async update(id: string, data: Partial<CreateUnitOfMeasureDto>): Promise<UnitOfMeasure> {
    const response = await api.put(`/unit-of-measures/${id}`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/unit-of-measures/${id}`);
  }
}
