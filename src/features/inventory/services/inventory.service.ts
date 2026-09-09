import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type { LossDto, InventoryLineDto } from "../types/inventory.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

const extractError = (err: unknown, fallback: string): Error => {
  const e = err as Record<string, any>;
  const msg = e?.response?.data?.error || e?.response?.data?.message || fallback;
  return new Error(msg);
};

export const inventoryService = {
  recordLoss: async (dto: LossDto): Promise<void> => {
    try {
      await axios.post<ApiResponse<unknown>>(`${BASE}/stock-movements/loss`, dto);
    } catch (err) {
      throw extractError(err, "Impossible d'enregistrer la perte.");
    }
  },

  submitInventory: async (lines: InventoryLineDto[]): Promise<{ adjusted: number }> => {
    try {
      const { data } = await axios.post<ApiResponse<{ adjusted: number }>>(`${BASE}/inventories`, lines);
      return data.payload;
    } catch (err) {
      throw extractError(err, "Impossible de soumettre l'inventaire.");
    }
  },
};
