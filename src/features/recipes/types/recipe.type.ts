export interface RecipeDetailPayload {
  idIngredient: string;
  quantity: number;
  idItemUnit: string | null;
}

export interface CreateRecipePayload {
  idItem: string;
  yieldQuantity?: number;
  details: RecipeDetailPayload[];
}

export interface UpdateRecipePayload {
  yieldQuantity?: number;
  details: RecipeDetailPayload[];
}

export interface RecipeDetail {
  idRecipeDetail: string;
  quantity: number;
  idItemUnit: string | null;
  idIngredient: string;
  idRecipe: string;
  version: number;
  createdAt: string;
  ingredient?: {
    idItem: string;
    label: string;
    unit?: { symbol: string };
  };
  itemUnit?: {
    idItemUnit: string;
    toStockRatio: number;
    alternativeUnit?: { symbol: string };
  };
}

export interface RecipeListItem {
  idRecipe: string;
  idItem: string;
  version: number;
  isActive: boolean;
  yieldQuantity: number;
  versionsCount: number;
  item: {
    label: string;
    unit: { symbol: string };
  };
}

export interface Recipe {
  idRecipe: string;
  recipeCost: number | null;
  yieldQuantity: number;
  idItem: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  item?: {
    idItem: string;
    label: string;
    unit?: { symbol: string };
  };
}

export interface FlatIngredient {
  idIngredient: string;
  label: string;
  unit: string;
  totalQty: number;
  totalCost: number;
}

export interface RecipeTreeNode {
  idIngredient: string;
  label: string;
  qty: number;
  unit: string;
  cost: number;
  isProduced: boolean;
  subRecipeId?: string;
  subRecipeVersion?: number;
  children?: RecipeTreeNode[];
}

export interface RecipeAnalysis {
  tree: RecipeTreeNode;
  flatIngredients: FlatIngredient[];
  totalCost: number;
}
