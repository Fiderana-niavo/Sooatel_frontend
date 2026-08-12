import axios from "axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api.type";
import type { Supplier, SupplierDto, SupplierProduct, SupplierProductDto, SupplierProductPrice, SuppliedItem, SuppliedItemDto } from "../types/supplier.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

// --- SUPPLIERS ---
export const getSuppliers = async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Supplier>> => {
  const { data } = await axios.get<ApiResponse<PaginatedResponse<Supplier>>>(`${BASE}/suppliers`, { params });
  return data.payload;
};

export const createSupplier = async (payload: SupplierDto): Promise<Supplier> => {
  const { data } = await axios.post<ApiResponse<Supplier>>(`${BASE}/suppliers`, payload);
  return data.payload;
};

export const updateSupplier = async (id: string, payload: Partial<SupplierDto>): Promise<Supplier> => {
  const { data } = await axios.put<ApiResponse<Supplier>>(`${BASE}/suppliers/${id}`, payload);
  return data.payload;
};

export const deleteSupplier = async (id: string): Promise<void> => {
  await axios.delete<ApiResponse<void>>(`${BASE}/suppliers/${id}`);
};

// --- SUPPLIER PRODUCTS ---
export const getSupplierProducts = async (params?: { page?: number; limit?: number; search?: string; idSupplier?: string }): Promise<PaginatedResponse<SupplierProduct>> => {
  const { data } = await axios.get<ApiResponse<PaginatedResponse<SupplierProduct>>>(`${BASE}/supplier-products/list`, { params });
  return data.payload;
};

export const createSupplierProduct = async (payload: SupplierProductDto): Promise<SupplierProduct> => {
  const { data } = await axios.post<ApiResponse<SupplierProduct>>(`${BASE}/supplier-products`, payload);
  return data.payload;
};

export const updateSupplierProduct = async (id: string, payload: Partial<SupplierProductDto>): Promise<SupplierProduct> => {
  const { data } = await axios.put<ApiResponse<SupplierProduct>>(`${BASE}/supplier-products/${id}`, payload);
  return data.payload;
};

export const deleteSupplierProduct = async (id: string): Promise<void> => {
  await axios.delete<ApiResponse<void>>(`${BASE}/supplier-products/${id}`);
};

// --- PRICING ---
export const getProductPriceHistory = async (idSupplierProduct: string): Promise<SupplierProductPrice[]> => {
  const { data } = await axios.get<ApiResponse<SupplierProductPrice[]>>(`${BASE}/supplier-products/${idSupplierProduct}/price-history`);
  return data.payload;
};

export const changeProductPrice = async (idSupplierProduct: string, price: number, changeDate?: string): Promise<void> => {
  await axios.post<ApiResponse<void>>(`${BASE}/supplier-products/${idSupplierProduct}/price`, { price, changeDate });
};

export const fixProductPriceError = async (idSupplierProduct: string, price: number): Promise<void> => {
  await axios.put<ApiResponse<void>>(`${BASE}/supplier-products/${idSupplierProduct}/price/fix`, { price });
};

// --- SUPPLIED ITEMS (Linking) ---
export const getSuppliedItems = async (params?: { page?: number; limit?: number; idSupplierProduct?: string; idItem?: string }): Promise<PaginatedResponse<SuppliedItem>> => {
  const { data } = await axios.get<ApiResponse<PaginatedResponse<SuppliedItem>>>(`${BASE}/supplied-items/list`, { params });
  return data.payload;
};

export const createSuppliedItem = async (payload: SuppliedItemDto): Promise<SuppliedItem> => {
  const { data } = await axios.post<ApiResponse<SuppliedItem>>(`${BASE}/supplied-items`, payload);
  return data.payload;
};

export const deleteSuppliedItem = async (id: string): Promise<void> => {
  await axios.delete<ApiResponse<void>>(`${BASE}/supplied-items/${id}`);
};
