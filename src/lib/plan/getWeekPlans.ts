import { createClient } from "@/lib/supabase/server";
import { generatePlan } from "./generatePlan";
import type { MealPlanData } from "./mealPlan";
import type { WorkoutPlanData } from "./workoutPlan";
import type { MacroTargets } from "./nutrition";

export type WeekPlans = {
  mealPlan: { calorieTarget: number; macros: MacroTargets; planData: MealPlanData } | null;
  workoutPlan: { setting: string; planData: WorkoutPlanData } | null;
};

/** Fetches this week's plans, generating them on the fly if they don't exist yet. */
export async function getOrCreateWeekPlans(userId: string, weekStart: string): Promise<WeekPlans> {
  const supabase = await createClient();

  const [{ data: mealRow }, { data: workoutRow }] = await Promise.all([
    supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("week_start", weekStart)
      .maybeSingle(),
    supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("week_start", weekStart)
      .maybeSingle(),
  ]);

  if (mealRow && workoutRow) {
    return {
      mealPlan: {
        calorieTarget: mealRow.daily_calorie_target,
        macros: mealRow.macro_targets as unknown as MacroTargets,
        planData: mealRow.plan_data as unknown as MealPlanData,
      },
      workoutPlan: {
        setting: workoutRow.setting,
        planData: workoutRow.plan_data as unknown as WorkoutPlanData,
      },
    };
  }

  const generated = await generatePlan(userId, weekStart);
  if (!generated) return { mealPlan: null, workoutPlan: null };

  return {
    mealPlan: generated.mealPlan,
    workoutPlan: {
      setting: generated.workoutPlan.setting,
      planData: generated.workoutPlan.planData,
    },
  };
}
