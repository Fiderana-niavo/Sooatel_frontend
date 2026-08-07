import axios from "axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api.type";
import type { CashJournal, CashMovement } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const CashJournalService = {
  getAll: async (params?: { page?: number; limit?: number; date?: string }): Promise<PaginatedResponse<CashJournal>> => {
    const res = await axios.get<ApiResponse<PaginatedResponse<CashJournal>>>(`${BASE}/cash-journals`, { params, headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  getOne: async (id: string): Promise<CashJournal> => {
    const res = await axios.get<ApiResponse<CashJournal>>(`${BASE}/cash-journals/${id}`, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  openJournal: async (ref: string): Promise<CashJournal> => {
    const res = await axios.post<ApiResponse<CashJournal>>(`${BASE}/cash-journals/open`, { ref }, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  closeJournal: async (id: string, actualClosingBalance: number): Promise<CashJournal> => {
    const res = await axios.post<ApiResponse<CashJournal>>(`${BASE}/cash-journals/${id}/close`, { actualClosingBalance }, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  getMovements: async (idJournal: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<CashMovement>> => {
    const res = await axios.get<ApiResponse<PaginatedResponse<CashMovement>>>(`${BASE}/cash-journals/${idJournal}/movements`, { params, headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },
};
