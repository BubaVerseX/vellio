export type IngredientCategory =
  | "produce"
  | "dairy"
  | "meat"
  | "seafood"
  | "pantry"
  | "spices"
  | "other";

export type StructuredIngredient = {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
};

/** recipes.ingredients is stored as jsonb; parse defensively in case of malformed rows. */
export function parseIngredients(raw: unknown): StructuredIngredient[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is StructuredIngredient =>
      !!item &&
      typeof item === "object" &&
      typeof (item as StructuredIngredient).name === "string" &&
      typeof (item as StructuredIngredient).quantity === "number" &&
      typeof (item as StructuredIngredient).unit === "string"
  );
}
