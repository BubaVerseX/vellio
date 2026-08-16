import type { Tables } from "@/lib/supabase/database.types";
import { parseIngredients, type IngredientCategory } from "./ingredients";
import { DAYS_OF_WEEK, type DayMealPlan, type MealPlanData } from "./mealPlan";

// Duplicated from lib/plan/lookups.ts (deliberately, not imported): that module
// pulls in the server-only Supabase client, which would leak into the client
// bundle for GroceryListView if imported here.
function mealIdsFromDay(day: DayMealPlan): string[] {
  return [day.breakfast, day.lunch, day.dinner, ...day.snacks].filter(
    (id): id is string => !!id
  );
}

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

  for (const day of DAYS_OF_WEEK) {
    const ids = mealIdsFromDay(weekMealPlan.days[day]);
    for (const id of ids) {
      const recipe = recipesById.get(id);
      if (!recipe) continue;

      for (const ing of parseIngredients(recipe.ingredients)) {
        const key = ingredientKey(ing.name, ing.unit);
        const existing = totals.get(key);
        if (existing) {
          existing.quantity += ing.quantity;
        } else {
          totals.set(key, {
            key,
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            category: ing.category,
          });
        }
      }
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
