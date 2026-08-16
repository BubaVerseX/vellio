import type { Tables } from "@/lib/supabase/database.types";
import { filterRecipesForProfile, type MealPlanProfileInput } from "./mealPlan";
import { prioritizeFavorites } from "./favoritesSort";
import { seededShuffle } from "./seededRandom";

type Recipe = Tables<"recipes">;
type Exercise = Tables<"exercises">;

const ALTERNATIVES_COUNT = 3;
const CALORIE_TOLERANCE = 0.3; // ±30% of the current recipe's calories

export function getMealAlternatives(
  currentRecipe: Recipe,
  allRecipes: Recipe[],
  profile: MealPlanProfileInput,
  favoriteRecipeIds: Set<string>,
  seedKey: string
): Recipe[] {
  const eligible = filterRecipesForProfile(allRecipes, profile).filter(
    (r) => r.id !== currentRecipe.id && r.meal_type === currentRecipe.meal_type
  );

  const minCal = currentRecipe.calories * (1 - CALORIE_TOLERANCE);
  const maxCal = currentRecipe.calories * (1 + CALORIE_TOLERANCE);
  const inRange = eligible.filter((r) => r.calories >= minCal && r.calories <= maxCal);

  // Fall back to the full eligible pool (still same meal type + restrictions)
  // if the calorie band is too narrow to offer real choices.
  const pool = inRange.length >= ALTERNATIVES_COUNT ? inRange : eligible;

  return prioritizeFavorites(seededShuffle(pool, seedKey), favoriteRecipeIds).slice(
    0,
    ALTERNATIVES_COUNT
  );
}

export function getExerciseAlternatives(
  currentExercise: Exercise,
  allExercises: Exercise[],
  setting: "home" | "gym" | "both",
  favoriteExerciseIds: Set<string>,
  seedKey: string
): Exercise[] {
  const settingPool =
    setting === "both"
      ? allExercises
      : allExercises.filter((e) => e.setting === setting || e.setting === "both");

  const eligible = settingPool.filter(
    (e) => e.id !== currentExercise.id && e.muscle_group === currentExercise.muscle_group
  );

  return prioritizeFavorites(seededShuffle(eligible, seedKey), favoriteExerciseIds).slice(
    0,
    ALTERNATIVES_COUNT
  );
}
