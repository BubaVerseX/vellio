import { createClient } from "@/lib/supabase/server";
import { generateMealPlanData, type MealPlanData } from "./mealPlan";
import { generateWorkoutPlanData, type WorkoutPlanData } from "./workoutPlan";
import type { MacroTargets } from "./nutrition";
import { getFavoriteIds } from "@/lib/actions/favorites";
import { ensureAiPlan } from "@/lib/ai/ensureAiPlan";
import { currentWeekStart, dayKeyForDate } from "./weekDate";

export { currentWeekStart, dayKeyForDate };

export type GeneratedPlan = {
  mealPlan: { calorieTarget: number; macros: MacroTargets; planData: MealPlanData };
  workoutPlan: { setting: "home" | "gym" | "both"; planData: WorkoutPlanData };
};

/**
 * Persisted-plan path — premium only (callers must already have checked
 * subscription status; see getOrCreateWeekPlans). Instantiates this week's
 * meal_plans/workout_plans rows from the user's current AI plan
 * (lib/ai/ensureAiPlan), which regenerates only when missing or when the
 * profile has drifted meaningfully from the snapshot it was built from —
 * never on every visit. ensureAiPlan itself falls back to the formula
 * generator whenever the AI call is unavailable or fails, so this always
 * has something to persist once a profile is complete enough.
 */
export async function generatePlan(
  userId: string,
  weekStart: string
): Promise<GeneratedPlan | null> {
  const supabase = await createClient();

  const aiPlan = await ensureAiPlan(userId);
  if (!aiPlan) return null;

  const mealPlanData = aiPlan.meal_plan_data as unknown as MealPlanData;
  const workoutPlanData = aiPlan.workout_plan_data as unknown as WorkoutPlanData;
  const macros = aiPlan.macro_targets as unknown as MacroTargets;
  const workoutSetting = aiPlan.workout_setting as "home" | "gym" | "both";

  const [{ error: mealError }, { error: workoutError }] = await Promise.all([
    supabase.from("meal_plans").upsert(
      {
        user_id: userId,
        week_start: weekStart,
        daily_calorie_target: aiPlan.calorie_target,
        macro_targets: macros,
        plan_data: mealPlanData,
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
    mealPlan: { calorieTarget: aiPlan.calorie_target, macros, planData: mealPlanData },
    workoutPlan: { setting: workoutSetting, planData: workoutPlanData },
  };
}

/**
 * Free-tier path: the same formula-based generation v1 always used, but
 * never written to meal_plans/workout_plans — the result only ever lives in
 * the response for this one request, same as the pre-signup anonymous
 * preview flow (lib/plan/previewPlan.ts). Each visit computes fresh.
 */
export async function generateEphemeralPlan(
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

  return {
    mealPlan: {
      calorieTarget: mealResult.calorieTarget,
      macros: mealResult.macros,
      planData: mealResult.planData,
    },
    workoutPlan: { setting: workoutSetting, planData: workoutPlanData },
  };
}
