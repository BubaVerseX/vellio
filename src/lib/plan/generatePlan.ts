import { createClient } from "@/lib/supabase/server";
import { generateMealPlanData, type MealPlanData, DAYS_OF_WEEK, type DayKey } from "./mealPlan";
import { generateWorkoutPlanData, type WorkoutPlanData } from "./workoutPlan";
import type { MacroTargets } from "./nutrition";
import { getFavoriteIds } from "@/lib/actions/favorites";

export type GeneratedPlan = {
  mealPlan: { calorieTarget: number; macros: MacroTargets; planData: MealPlanData };
  workoutPlan: { setting: "home" | "gym" | "both"; planData: WorkoutPlanData };
};

/**
 * Single entry point for turning a user's profile into a meal + workout plan
 * and persisting it. v1 is entirely formula/database-driven (see mealPlan.ts /
 * workoutPlan.ts). To add AI-generated plans later, swap the internals of this
 * function (or branch on a feature flag) — callers (onboarding, "regenerate
 * week" actions) don't need to change.
 */
export async function generatePlan(
  userId: string,
  weekStart: string
): Promise<GeneratedPlan | null> {
  const supabase = await createClient();

  const [{ data: profile }, { data: recipes }, { data: exercises }, favoriteRecipeIds, favoriteExerciseIds] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("recipes").select("*"),
      supabase.from("exercises").select("*"),
      getFavoriteIds(userId, "recipe"),
      getFavoriteIds(userId, "exercise"),
    ]);

  if (!profile || !recipes || !exercises) return null;

  const mealResult = generateMealPlanData(profile, recipes, weekStart, favoriteRecipeIds);
  if (!mealResult) return null;

  const workoutSetting = (profile.equipment_setting ?? "home") as "home" | "gym" | "both";
  const workoutPlanData = generateWorkoutPlanData(
    profile,
    exercises,
    weekStart,
    workoutSetting,
    favoriteExerciseIds
  );

  const [{ error: mealError }, { error: workoutError }] = await Promise.all([
    supabase.from("meal_plans").upsert(
      {
        user_id: userId,
        week_start: weekStart,
        daily_calorie_target: mealResult.calorieTarget,
        macro_targets: mealResult.macros,
        plan_data: mealResult.planData,
      },
      { onConflict: "user_id,week_start" }
    ),
    supabase.from("workout_plans").upsert(
      {
        user_id: userId,
        week_start: weekStart,
        setting: workoutSetting,
        plan_data: workoutPlanData,
      },
      { onConflict: "user_id,week_start" }
    ),
  ]);

  if (mealError || workoutError) {
    console.error("generatePlan persist error", mealError, workoutError);
    return null;
  }

  return {
    mealPlan: {
      calorieTarget: mealResult.calorieTarget,
      macros: mealResult.macros,
      planData: mealResult.planData,
    },
    workoutPlan: { setting: workoutSetting, planData: workoutPlanData },
  };
}

/** Monday of the current week, in the user's local time, formatted as YYYY-MM-DD. */
export function currentWeekStart(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // shift Sunday back to the prior Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function dayKeyForDate(date = new Date()): DayKey {
  const day = date.getDay();
  return DAYS_OF_WEEK[day === 0 ? 6 : day - 1];
}
