import axios from "axios";
import type { ApiResponse } from "@/types/api.type";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const BASE = `${BASE_URL}/supplier-payments`;

import type {
  CreateSupplierPaymentDto,
  DeliveryPaymentSummary,
  PurchasePaymentSummary,
  AvailableDestinations,
} from "../types/supplier-payment.type";

export const supplierPaymentService = {
  createPayment: (dto: CreateSupplierPaymentDto) =>
    axios.post<ApiResponse<unknown>>(`${BASE}`, dto),

  getDeliverySummary: (idDelivery: string) =>
    axios.get<ApiResponse<DeliveryPaymentSummary>>(`${BASE}/delivery/${idDelivery}/summary`),

  getAvailableDestinations: (idSupplier: string) =>
    axios.get<ApiResponse<AvailableDestinations>>(`${BASE}/supplier/${idSupplier}/destinations`),

  getSupplierBalance: (idSupplier: string) =>
    axios.get<ApiResponse<{ credit: number; debit: number; balance: number }>>(`${BASE}/supplier/${idSupplier}/balance`),

  applySupplierCredit: (idSupplier: string, dto: { idDelivery?: string; idPurchase?: string; amount?: number }) =>
    axios.post<ApiResponse<unknown>>(`${BASE}/supplier/${idSupplier}/apply-credit`, dto),

  getPaymentById: (idPayment: string) =>
    axios.get<ApiResponse<any>>(`${BASE}/${idPayment}`),

  updatePayment: (idPayment: string, dto: CreateSupplierPaymentDto) =>
    axios.put<ApiResponse<unknown>>(`${BASE}/${idPayment}`, dto),
    
  getPurchaseSummary: (idPurchase: string) =>
    axios.get<ApiResponse<PurchasePaymentSummary>>(`${BASE}/purchase/${idPurchase}/summary`),
};
