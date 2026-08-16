import type { Tables } from "@/lib/supabase/database.types";
import { parseIngredients, type IngredientCategory } from "./ingredients";
import { DAYS_OF_WEEK, portionFor, type MealPlanData, type MealSlotKey } from "./mealPlan";

const MAIN_SLOTS: MealSlotKey[] = ["breakfast", "lunch", "dinner"];

type Recipe = Tables<"recipes">;

export type GroceryItem = {
  key: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
};

export const CATEGORY_ORDER: IngredientCategory[] = [
  "produce",
  "dairy",
  "meat",
  "seafood",
  "pantry",
  "spices",
  "other",
];

function normalize(name: string) {
  return name.trim().toLowerCase();
}

/** Ingredient key used both for React keys and for persisting checked state. */
export function ingredientKey(name: string, unit: string) {
  return `${normalize(name)}|${normalize(unit)}`;
}

export function aggregateGroceryList(
  weekMealPlan: MealPlanData,
  recipesById: Map<string, Recipe>
): Record<IngredientCategory, GroceryItem[]> {
  const totals = new Map<string, GroceryItem>();

  function addIngredients(recipeId: string | null, multiplier: number) {
    if (!recipeId) return;
    const recipe = recipesById.get(recipeId);
    if (!recipe) return;

    for (const ing of parseIngredients(recipe.ingredients)) {
      const key = ingredientKey(ing.name, ing.unit);
      const existing = totals.get(key);
      const scaledQuantity = ing.quantity * multiplier;
      if (existing) {
        existing.quantity += scaledQuantity;
      } else {
        totals.set(key, {
          key,
          name: ing.name,
          quantity: scaledQuantity,
          unit: ing.unit,
          category: ing.category,
        });
      }
    }
  }

  for (const day of DAYS_OF_WEEK) {
    const dayPlan = weekMealPlan.days[day];
    for (const slot of MAIN_SLOTS) {
      addIngredients(dayPlan[slot], portionFor(dayPlan, slot));
    }
    for (const snackId of dayPlan.snacks) {
      addIngredients(snackId, 1);
    }
  }

  const grouped = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, [] as GroceryItem[]])) as Record<
    IngredientCategory,
    GroceryItem[]
  >;

  for (const item of totals.values()) {
    item.quantity = Math.round(item.quantity * 100) / 100;
    grouped[item.category].push(item);
  }

  for (const category of CATEGORY_ORDER) {
    grouped[category].sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
}
