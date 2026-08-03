import axios from "axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api.type";
import type { CashJournal } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const CashJournalService = {
  getAll: async (params?: { page?: number; limit?: number; date?: string }): Promise<{ records: CashJournal[], total: number }> => {
    const res = await axios.get<ApiResponse<PaginatedResponse<CashJournal>>>(`${BASE}/cash-journals`, { params, headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },
  getOne: async (id: string): Promise<CashJournal> => {
    const res = await axios.get<ApiResponse<CashJournal>>(`${BASE}/cash-journals/${id}`, { headers: authHeader() });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  }
};
