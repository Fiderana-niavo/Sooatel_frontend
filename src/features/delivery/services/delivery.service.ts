import axios from "axios";
import type { PaginatedResponse, ApiResponse } from "@/types/api.type";
import type { PendingPurchase, CreateDeliveryDto, DeliveryListRecord, DeliveryDetails } from "../types/delivery.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const deliveryService = {
  getPendingBySupplier: async (idSupplier: string, excludeDeliveryId?: string): Promise<PendingPurchase[]> => {
    const params = excludeDeliveryId ? { excludeDeliveryId } : undefined;
    const { data: response } = await axios.get<ApiResponse<PendingPurchase[]>>(`${BASE}/deliveries/pending/${idSupplier}`, { params });
    return response.payload;
  },

  create: async (dto: CreateDeliveryDto): Promise<{ idDelivery: string; ref: string }> => {
    const { data: response } = await axios.post<ApiResponse<{ idDelivery: string; ref: string }>>(`${BASE}/deliveries`, dto);
    return response.payload;
  },

  getAllDeliveries: async (params?: { page?: number; limit?: number; ref?: string; status?: number; startDate?: string; endDate?: string }): Promise<PaginatedResponse<DeliveryListRecord>> => {
    const { data: response } = await axios.get<ApiResponse<PaginatedResponse<DeliveryListRecord>>>(`${BASE}/deliveries`, { params });
    return response.payload;
  },

  getDeliveryDetails: async (id: string): Promise<DeliveryDetails> => {
    const { data: response } = await axios.get<ApiResponse<DeliveryDetails>>(`${BASE}/deliveries/${id}/details`);
    return response.payload;
  },

  updateDelivery: async (id: string, dto: CreateDeliveryDto): Promise<{ idDelivery: string; ref: string }> => {
    const { data: response } = await axios.put<ApiResponse<{ idDelivery: string; ref: string }>>(`${BASE}/deliveries/${id}`, dto);
    return response.payload;
  },

  deleteDelivery: async (id: string): Promise<void> => {
    await axios.delete(`${BASE}/deliveries/${id}`);
  },

  validateDelivery: async (id: string): Promise<void> => {
    await axios.put(`${BASE}/deliveries/${id}/validate`);
  },
};
