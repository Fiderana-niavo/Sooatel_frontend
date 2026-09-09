import axios from "axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api.type";
import type { StockMovement, StockMovementDto, StockMovementFilters } from "../types/stock-movement.type";

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

export const stockMovementService = {
  getAll: async (filters: Partial<StockMovementFilters> = {}): Promise<PaginatedResponse<StockMovement>> => {
    const { data } = await axios.get<ApiResponse<PaginatedResponse<StockMovement>>>(`${BASE}/stock-movements`, {
      params: filters,
    });
    return data.payload;
  },

  create: async (dto: StockMovementDto): Promise<StockMovement> => {
    try {
      const { data } = await axios.post<ApiResponse<StockMovement>>(`${BASE}/stock-movements`, dto);
      return data.payload;
    } catch (err) {
      throw extractError(err, "Impossible de créer le mouvement.");
    }
  },

  update: async (id: string, dto: StockMovementDto): Promise<void> => {
    try {
      await axios.put(`${BASE}/stock-movements/${id}`, dto);
    } catch (err) {
      throw extractError(err, "Impossible de mettre à jour le mouvement.");
    }
  },

  validate: async (id: string): Promise<void> => {
    try {
      await axios.put(`${BASE}/stock-movements/${id}/validate`);
    } catch (err) {
      throw extractError(err, "Impossible de valider le mouvement.");
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${BASE}/stock-movements/${id}`);
    } catch (err) {
      throw extractError(err, "Impossible de supprimer le mouvement.");
    }
  },
};
