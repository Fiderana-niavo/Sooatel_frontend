import axios from "axios";
import type { ApiResponse } from "@/types/api.type";
import type { Recipe, RecipeListItem, RecipeDetail, CreateRecipePayload, UpdateRecipePayload, RecipeAnalysis } from "../types/recipe.type";

const BASE = `${import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"}/recipes`;

export const RecipeService = {
  async getAll(): Promise<RecipeListItem[]> {
    const res = await axios.get<ApiResponse<RecipeListItem[]>>(BASE);
    if (!res.data.ok) throw new Error(res.data.error ?? "Erreur API");
    return res.data.payload;
  },

  async getVersions(idItem: string): Promise<Recipe[]> {
    const res = await axios.get<ApiResponse<Recipe[]>>(`${BASE}/item/${idItem}/versions`);
    if (!res.data.ok) throw new Error(res.data.error ?? "Erreur API");
    return res.data.payload;
  },

  async getDetails(idRecipe: string): Promise<RecipeDetail[]> {
    const res = await axios.get<ApiResponse<RecipeDetail[]>>(`${BASE}/${idRecipe}/details`);
    if (!res.data.ok) throw new Error(res.data.error ?? "Erreur API");
    return res.data.payload;
  },

  async getIngredients(idRecipe: string): Promise<RecipeAnalysis> {
    const res = await axios.get<ApiResponse<RecipeAnalysis>>(`${BASE}/${idRecipe}/ingredients`);
    if (!res.data.ok) throw new Error(res.data.error ?? "Erreur API");
    return res.data.payload;
  },

  async create(data: CreateRecipePayload): Promise<Recipe> {
    const res = await axios.post<ApiResponse<Recipe>>(BASE, data);
    if (!res.data.ok) throw new Error(res.data.error ?? "Erreur API");
    return res.data.payload;
  },

  async update(idRecipe: string, data: UpdateRecipePayload): Promise<void> {
    const res = await axios.put<ApiResponse<null>>(`${BASE}/${idRecipe}`, data);
    if (!res.data.ok) throw new Error(res.data.error ?? "Erreur API");
  },

  async remove(idRecipe: string): Promise<void> {
    const res = await axios.delete<ApiResponse<null>>(`${BASE}/${idRecipe}`);
    if (!res.data.ok) throw new Error(res.data.error ?? "Erreur API");
  },

  async setActive(idRecipe: string): Promise<{ createdNewVersion: boolean; newVersion?: number; activatedExistingVersion?: number }> {
    const res = await axios.put<ApiResponse<{ createdNewVersion: boolean; newVersion?: number; activatedExistingVersion?: number }>>(`${BASE}/${idRecipe}/active`);
    if (!res.data.ok) throw new Error(res.data.error ?? "Erreur API");
    return res.data.payload;
  },
};
