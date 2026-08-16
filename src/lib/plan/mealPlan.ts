import type { Tables } from "@/lib/supabase/database.types";
import { seededShuffle } from "./seededRandom";
import { prioritizeFavorites } from "./favoritesSort";
import { calculateCalorieTarget, calculateMacros, type MacroTargets } from "./nutrition";

type Recipe = Tables<"recipes">;

/** Minimal shape the generator needs — satisfied by a real profile row, or by
 * an in-progress intake form during the anonymous preview flow (see
 * lib/plan/previewPlan.ts). */
export type MealPlanProfileInput = {
  id: string;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  sex: string | null;
  activity_level: string | null;
  goal: string | null;
  allergies: string[];
  dietary_restrictions: string[];
};

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type DayKey = (typeof DAYS_OF_WEEK)[number];

export type DayMealPlan = {
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  snacks: string[];
  totalCalories: number;
};

export type MealPlanData = {
  days: Record<DayKey, DayMealPlan>;
};

export function filterRecipesForProfile(recipes: Recipe[], profile: MealPlanProfileInput): Recipe[] {
  const allergies = new Set((profile.allergies ?? []).map((a) => a.toLowerCase()));
  const restrictions = profile.dietary_restrictions ?? [];

  return recipes.filter((recipe) => {
    const hasAllergen = recipe.allergens.some((a) => allergies.has(a.toLowerCase()));
    if (hasAllergen) return false;

    const meetsAllRestrictions = restrictions.every((r) => recipe.dietary_tags.includes(r));
    if (!meetsAllRestrictions) return false;

    return true;
  });
}

/**
 * Formula/database-driven meal plan generator. This is the v1 implementation of
 * plan generation — swap the body of this function for an AI-generation call
 * later without touching callers (see `generatePlan.ts`).
 */
export function generateMealPlanData(
  profile: MealPlanProfileInput,
  recipes: Recipe[],
  weekStart: string,
  favoriteRecipeIds: Set<string> = new Set()
): { planData: MealPlanData; calorieTarget: number; macros: MacroTargets } | null {
  const calorieTarget = calculateCalorieTarget(profile);
  if (!calorieTarget) return null;
  const macros = calculateMacros(profile, calorieTarget);

  const eligible = filterRecipesForProfile(recipes, profile);
  const byType = {
    breakfast: prioritizeFavorites(
      seededShuffle(
        eligible.filter((r) => r.meal_type === "breakfast"),
        `${profile.id}-${weekStart}-breakfast`
      ),
      favoriteRecipeIds
    ),
    lunch: prioritizeFavorites(
      seededShuffle(
        eligible.filter((r) => r.meal_type === "lunch"),
        `${profile.id}-${weekStart}-lunch`
      ),
      favoriteRecipeIds
    ),
    dinner: prioritizeFavorites(
      seededShuffle(
        eligible.filter((r) => r.meal_type === "dinner"),
        `${profile.id}-${weekStart}-dinner`
      ),
      favoriteRecipeIds
    ),
    snack: prioritizeFavorites(
      seededShuffle(
        eligible.filter((r) => r.meal_type === "snack"),
        `${profile.id}-${weekStart}-snack`
      ),
      favoriteRecipeIds
    ),
  };

  const days = {} as Record<DayKey, DayMealPlan>;

  DAYS_OF_WEEK.forEach((day, index) => {
    const breakfast = byType.breakfast.length
      ? byType.breakfast[index % byType.breakfast.length]
      : null;
    const lunch = byType.lunch.length ? byType.lunch[index % byType.lunch.length] : null;
    const dinner = byType.dinner.length
      ? byType.dinner[index % byType.dinner.length]
      : null;

    const subtotal = (breakfast?.calories ?? 0) + (lunch?.calories ?? 0) + (dinner?.calories ?? 0);

    // Keep adding snacks until the day is within ~100 cal of target — a large
    // gap (e.g. a high-calorie goal) needs more than one. Cycle through the
    // shuffled snack list rather than always taking the single closest match,
    // so a day doesn't repeat the same snack many times when several are
    // eligible for this profile.
    const snacks: Recipe[] = [];
    let remaining = calorieTarget - subtotal;
    const MAX_SNACKS = 6;
    let snackCursor = index;
    while (remaining > 100 && byType.snack.length && snacks.length < MAX_SNACKS) {
      const next = byType.snack[snackCursor % byType.snack.length];
      snacks.push(next);
      remaining -= next.calories;
      snackCursor += 1;
    }

    days[day] = {
      breakfast: breakfast?.id ?? null,
      lunch: lunch?.id ?? null,
      dinner: dinner?.id ?? null,
      snacks: snacks.map((s) => s.id),
      totalCalories: subtotal + snacks.reduce((sum, s) => sum + s.calories, 0),
    };
  });

  return { planData: { days }, calorieTarget, macros };
}
