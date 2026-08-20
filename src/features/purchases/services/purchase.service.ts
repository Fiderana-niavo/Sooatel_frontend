import axios from "axios";
import type { PaginatedResponse, ApiResponse } from "@/types/api.type";
import type { Purchase, CreatePurchaseDto, PurchaseDetail } from "../types/purchase.type";
import type { SuppliedItem } from "../types/purchase.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const purchaseService = {
  create: async (data: CreatePurchaseDto): Promise<Purchase> => {
    const { data: response } = await axios.post<ApiResponse<Purchase>>(`${BASE}/purchases`, data);
    return response.payload;
  },

  update: async (id: string, data: CreatePurchaseDto): Promise<Purchase> => {
    const { data: response } = await axios.put<ApiResponse<Purchase>>(`${BASE}/purchases/${id}`, data);
    return response.payload;
  },

  getAll: async (params?: { page?: number; limit?: number; status?: number; lifecycleStatus?: number; idSupplier?: string; startDate?: string; endDate?: string }): Promise<PaginatedResponse<Purchase>> => {
    const { data: response } = await axios.get<ApiResponse<PaginatedResponse<Purchase>>>(`${BASE}/purchases`, { params });
    return response.payload;
  },

  getById: async (id: string): Promise<Purchase> => {
    const { data: response } = await axios.get<ApiResponse<Purchase>>(`${BASE}/purchases/${id}`);
    return response.payload;
  },

  getDetails: async (id: string): Promise<PurchaseDetail[]> => {
    const { data: response } = await axios.get<ApiResponse<PurchaseDetail[]>>(`${BASE}/purchases/${id}/details`);
    return response.payload;
  },

  getSuppliedItemsBySupplier: async (idSupplier: string): Promise<SuppliedItem[]> => {
    const { data: response } = await axios.get<ApiResponse<SuppliedItem[]>>(`${BASE}/supplied-items/supplier/${idSupplier}`);
    return response.payload;
  },

  getDeliveries: async (id: string): Promise<any> => {
    const { data: response } = await axios.get<ApiResponse<any>>(`${BASE}/purchases/${id}/deliveries`);
    return response.payload;
  },

  confirm: async (id: string): Promise<Purchase> => {
    const { data: response } = await axios.post<ApiResponse<Purchase>>(`${BASE}/purchases/${id}/confirm`);
    return response.payload;
  },

  cancel: async (id: string, options?: { forceAction?: "delete" | "confirm" }): Promise<Purchase> => {
    const { data: response } = await axios.post<ApiResponse<Purchase>>(`${BASE}/purchases/${id}/cancel`, options);
    return response.payload;
  },
};
