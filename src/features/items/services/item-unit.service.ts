import axios from "axios";
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
import type { ApiResponse } from "@/types/api.type";
import type { ItemUnit, CreateItemUnitDto, UpdateItemUnitDto } from "../types/item-unit.type";

class ItemUnitService {
  async getAll(params?: { idItem?: string }): Promise<ItemUnit[]> {
    const { data: response } = await axios.get<ApiResponse<{ records: ItemUnit[] } | ItemUnit[]>>(`${BASE}/item-units`, { params });
    if (Array.isArray(response.payload)) return response.payload;
    return (response.payload as { records: ItemUnit[] })?.records || [];
  }

  async create(dto: CreateItemUnitDto): Promise<ItemUnit> {
    const { data: response } = await axios.post<ApiResponse<ItemUnit>>(`${BASE}/item-units`, dto);
    return response.payload;
  }

  async update(id: string, dto: UpdateItemUnitDto): Promise<ItemUnit> {
    const { data: response } = await axios.put<ApiResponse<ItemUnit>>(`${BASE}/item-units/${id}`, dto);
    return response.payload;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${BASE}/item-units/${id}`);
  }
}

export const itemUnitService = new ItemUnitService();
