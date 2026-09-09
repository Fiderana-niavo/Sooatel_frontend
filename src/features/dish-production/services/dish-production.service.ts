import axios from "axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api.type";
import type { DishProduction, DishProductionDto, DishProductionFilters } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

// Extract the most human-readable message from an Axios error
const extractError = (err: unknown, fallback: string): Error => {
  const e = err as Record<string, any>;
  const msg =
    e?.response?.data?.error ||
    e?.response?.data?.message ||
    fallback;
  return new Error(msg);
};

export const dishProductionService = {
  getAll: async (filters: Partial<DishProductionFilters> = {}): Promise<PaginatedResponse<DishProduction>> => {
    const { data } = await axios.get<ApiResponse<PaginatedResponse<DishProduction>>>(`${BASE}/dish-productions`, {
      params: filters,
    });
    return data.payload;
  },

  create: async (dto: DishProductionDto): Promise<DishProduction> => {
    try {
      const { data } = await axios.post<ApiResponse<DishProduction>>(`${BASE}/dish-productions`, dto);
      return data.payload;
    } catch (err) {
      throw extractError(err, "Impossible de créer la production.");
    }
  },

  update: async (id: string, dto: DishProductionDto): Promise<void> => {
    try {
      await axios.put(`${BASE}/dish-productions/${id}`, dto);
    } catch (err) {
      throw extractError(err, "Impossible de mettre à jour la production.");
    }
  },

  validate: async (id: string): Promise<void> => {
    try {
      await axios.put(`${BASE}/dish-productions/${id}/validate`);
    } catch (err) {
      throw extractError(err, "Impossible de valider la production.");
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${BASE}/dish-productions/${id}`);
    } catch (err) {
      throw extractError(err, "Impossible de supprimer la production.");
    }
  },
};
