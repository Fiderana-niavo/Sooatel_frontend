import axios from "axios";
import type { SalePayload, SaleRecord } from "../types";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const SaleService = {
  createSale: async (payload: SalePayload) => {
    const response = await axios.post(`${BASE}/sales`, payload, { headers: authHeader() });
    return response.data;
  },

  getAllSales: async (page: number = 1, limit: number = 10, filters: { idMenu?: string; date?: string; status?: number[]; paymentStatus?: "UNPAID" | "PARTIAL" | "PAID" } = {}): Promise<{ records: SaleRecord[]; total: number; totalPages: number }> => {
    const response = await axios.get(`${BASE}/sales`, {
      params: { 
        page, 
        limit, 
        ...filters,
        status: filters.status ? filters.status.join(',') : undefined
      },
      headers: authHeader()
    });
    return response.data.payload;
  },

  getSaleById: async (id: string): Promise<SaleRecord> => {
    const response = await axios.get(`${BASE}/sales/${id}`, { headers: authHeader() });
    return response.data.payload;
  },

  updateSale: async (id: string, payload: Partial<SalePayload>) => {
    const response = await axios.put(`${BASE}/sales/${id}`, payload, { headers: authHeader() });
    return response.data;
  },

  cancelSale: async (id: string) => {
    const response = await axios.patch(`${BASE}/sales/${id}/cancel`, {}, { headers: authHeader() });
    return response.data;
  },

  reopenSale: async (id: string, reason: string) => {
    const response = await axios.patch(`${BASE}/sales/${id}/reopen`, { reason }, { headers: authHeader() });
    return response.data;
  },



  closeSale: async (id: string) => {
    const response = await axios.patch(`${BASE}/sales/${id}/close`, {}, { headers: authHeader() });
    return response.data;
  },

  deleteSale: async (id: string) => {
    const response = await axios.delete(`${BASE}/sales/${id}`, { headers: authHeader() });
    return response.data;
  },

  getPaymentMethods: async () => {
    const response = await axios.get(`${BASE}/payment-methods/select`, { headers: authHeader() });
    return response.data;
  },

  getMenuItems: async () => {
    const response = await axios.get(`${BASE}/menu-items/select`, { headers: authHeader() });
    return response.data;
  },

  getSalers: async () => {
    const response = await axios.get(`${BASE}/employees/salers`, { headers: authHeader() });
    return response.data;
  }
};
