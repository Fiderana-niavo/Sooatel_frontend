import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type { ProductPrice, CreateProductPriceDto } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export class ProductPriceService {
  static async getAll(params?: Record<string, any>): Promise<ProductPrice[]> {
    const res = await axios.get<ApiResponse<{ records: ProductPrice[] } | ProductPrice[]>>(`${BASE}/product-prices`, { params });
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    if (Array.isArray(res.data.payload)) {
      return res.data.payload;
    }
    return (res.data.payload as { records: ProductPrice[] }).records || [];
  }

  static async getById(id: string): Promise<ProductPrice> {
    const res = await axios.get<ApiResponse<ProductPrice>>(`${BASE}/product-prices/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async create(data: CreateProductPriceDto): Promise<ProductPrice> {
    const res = await axios.post<ApiResponse<ProductPrice>>(`${BASE}/product-prices`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async update(id: string, data: Partial<CreateProductPriceDto>): Promise<ProductPrice> {
    const res = await axios.put<ApiResponse<ProductPrice>>(`${BASE}/product-prices/${id}`, data);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
    return res.data.payload;
  }

  static async delete(id: string): Promise<void> {
    const res = await axios.delete<ApiResponse<void>>(`${BASE}/product-prices/${id}`);
    if (!res.data.ok) throw new Error(res.data.error || 'Erreur API');
  }
}
