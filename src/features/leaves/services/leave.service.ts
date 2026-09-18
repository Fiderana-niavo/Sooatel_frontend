import axios from "axios";
import type { CreateLeaveDto, LeaveBalance, LeaveResponse, LeaveTransaction, LeaveType, OverflowCheckResponse, OverflowResolutionDto } from "../types/leave.type";
import type { ApiResponse } from "@/types/api.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const leaveService = {
  createLeave: async (data: CreateLeaveDto): Promise<LeaveResponse | OverflowCheckResponse> => {
    const response = await axios.post<ApiResponse<LeaveResponse | OverflowCheckResponse>>(`${BASE}/leaves`, data);
    if (!response.data.ok) throw new Error(response.data.error);
    return response.data.payload;
  },

  getUpcomingLeaves: async (): Promise<LeaveResponse[]> => {
    const response = await axios.get<ApiResponse<LeaveResponse[]>>(`${BASE}/leaves/upcoming`);
    if (!response.data.ok) throw new Error(response.data.error);
    return response.data.payload;
  },

  deleteLeave: async (id: string): Promise<void> => {
    const response = await axios.delete<ApiResponse<unknown>>(`${BASE}/leaves/${id}`);
    if (!response.data.ok) throw new Error(response.data.error);
  },

  resolveOverflow: async (data: OverflowResolutionDto): Promise<LeaveResponse[]> => {
    const response = await axios.post<ApiResponse<LeaveResponse[]>>(`${BASE}/leaves/resolve-overflow`, data);
    if (!response.data.ok) throw new Error(response.data.error);
    return response.data.payload;
  },

  allocateMonthly: async (): Promise<void> => {
    await axios.post(`${BASE}/leaves/allocate-monthly`);
  },

  confirmJob: async (idEmployee: string): Promise<void> => {
    await axios.post(`${BASE}/leaves/confirm/${idEmployee}`);
  },

  getBalance: async (idEmployee: string, idLeaveType: string): Promise<LeaveBalance | null> => {
    const response = await axios.get<ApiResponse<LeaveBalance | null>>(`${BASE}/leaves/balance/${idEmployee}/${idLeaveType}`);
    if (!response.data.ok) throw new Error(response.data.error);
    return response.data.payload;
  },

  getBalances: async (idEmployee: string): Promise<LeaveBalance[]> => {
    const response = await axios.get<ApiResponse<LeaveBalance[]>>(`${BASE}/leaves/balances/${idEmployee}`);
    if (!response.data.ok) throw new Error(response.data.error);
    return response.data.payload;
  },

  getTransactions: async (idEmployee: string): Promise<LeaveTransaction[]> => {
    const response = await axios.get<ApiResponse<LeaveTransaction[]>>(`${BASE}/leaves/transactions/${idEmployee}`);
    if (!response.data.ok) throw new Error(response.data.error);
    return response.data.payload;
  },

  getLeaveTypes: async (): Promise<LeaveType[]> => {
    const response = await axios.get<ApiResponse<LeaveType[]>>(`${BASE}/leaves/types`);
    if (!response.data.ok) throw new Error(response.data.error);
    return response.data.payload;
  },

  createLeaveType: async (data: Omit<LeaveType, "idLeaveType" | "isActive">): Promise<LeaveType> => {
    const response = await axios.post<ApiResponse<LeaveType>>(`${BASE}/leaves/types`, data);
    if (!response.data.ok) throw new Error(response.data.error);
    return response.data.payload;
  },

  updateLeaveType: async (id: string, data: Partial<Omit<LeaveType, "idLeaveType">>): Promise<LeaveType> => {
    const response = await axios.put<ApiResponse<LeaveType>>(`${BASE}/leaves/types/${id}`, data);
    if (!response.data.ok) throw new Error(response.data.error);
    return response.data.payload;
  },

  deleteLeaveType: async (id: string): Promise<void> => {
    const response = await axios.delete<ApiResponse<unknown>>(`${BASE}/leaves/types/${id}`);
    if (!response.data.ok) throw new Error(response.data.error);
  },
};

