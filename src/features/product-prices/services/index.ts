import api from "@/services/api";
import type { ProductPrice, CreateProductPriceDto } from "../types";

export class ProductPriceService {
  static async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<ProductPrice[]> {
    const response = await api.get("/product-prices", { params });
    // Handle paginated response if backend returns it
    return response.data.data?.data || response.data.data || [];
  }

  static async getById(id: string): Promise<ProductPrice> {
    const response = await api.get(`/product-prices/${id}`);
    return response.data.data;
  }

  static async create(data: CreateProductPriceDto): Promise<ProductPrice> {
    const response = await api.post("/product-prices", data);
    return response.data.data;
  }

  static async update(id: string, data: Partial<CreateProductPriceDto>): Promise<ProductPrice> {
    const response = await api.put(`/product-prices/${id}`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/product-prices/${id}`);
  }
}
