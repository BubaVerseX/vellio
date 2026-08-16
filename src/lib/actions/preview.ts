"use server";

import { createClient } from "@/lib/supabase/server";
import { currentWeekStart } from "@/lib/plan/generatePlan";
import type { OnboardingInput } from "@/app/onboarding/actions";
import type { MealPlanData } from "@/lib/plan/mealPlan";
import type { WorkoutPlanData } from "@/lib/plan/workoutPlan";
import type { MacroTargets } from "@/lib/plan/nutrition";

export type GeneratedMealPlan = {
  planData: MealPlanData;
  calorieTarget: number;
  macros: MacroTargets;
};

export type GeneratedWorkoutPlan = {
  planData: WorkoutPlanData;
  setting: "home" | "gym" | "both";
};

/**
 * Persists a plan that was already generated client-side during the
 * anonymous preview flow (see /get-started) — does NOT regenerate it, so
 * what the user saw in preview is exactly what gets saved.
 */
export async function saveGeneratedPlan(
  input: OnboardingInput,
  mealPlan: GeneratedMealPlan,
  workoutPlan: GeneratedWorkoutPlan
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      age: input.age,
      sex: input.sex,
      weight_kg: input.weightKg,
      height_cm: input.heightCm,
      activity_level: input.activityLevel,
      goal: input.goal,
      allergies: input.allergies,
      dietary_restrictions: input.dietaryRestrictions,
      restrictions_notes: input.restrictionsNotes || null,
      medical_conditions: input.medicalConditions || null,
      time_available_minutes: input.timeAvailableMinutes,
      equipment_setting: input.equipmentSetting,
      disclaimer_accepted_at: new Date().toISOString(),
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  const weekStart = currentWeekStart();

  const [{ error: mealError }, { error: workoutError }] = await Promise.all([
    supabase.from("meal_plans").upsert(
      {
        user_id: user.id,
        week_start: weekStart,
        daily_calorie_target: mealPlan.calorieTarget,
        macro_targets: mealPlan.macros,
        plan_data: mealPlan.planData,
      },
      { onConflict: "user_id,week_start" }
    ),
    supabase.from("workout_plans").upsert(
      {
        user_id: user.id,
        week_start: weekStart,
        setting: workoutPlan.setting,
        plan_data: workoutPlan.planData,
      },
      { onConflict: "user_id,week_start" }
    ),
  ]);

  if (mealError || workoutError) {
    return { error: "Could not save your plan. Please try again from your dashboard." };
  }

  return { success: true };
}
