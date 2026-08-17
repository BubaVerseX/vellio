"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getFavoriteIds } from "./favorites";
import { generateWorkoutPlanData, generateWorkoutPlanFromTemplate } from "@/lib/plan/workoutPlan";
import { currentWeekStart } from "@/lib/plan/generatePlan";
import { WORKOUT_TEMPLATES } from "@/lib/content/workoutTemplates";
import { requireActivePremium } from "@/lib/premium/requireActivePremium";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function applyWorkoutTemplate(templateId: string) {
  const template = WORKOUT_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return { error: "Template not found" };

  const supabase = await createClient();
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };
  if (!(await requireActivePremium(user.id))) return { error: "premium_required" };

  const [{ data: exercises }, favoriteExerciseIds] = await Promise.all([
    supabase.from("exercises").select("*"),
    getFavoriteIds(user.id, "exercise"),
  ]);
  if (!exercises) return { error: "Could not load exercises" };

  const weekStart = currentWeekStart();
  const planData = generateWorkoutPlanFromTemplate(
    template,
    exercises,
    `${user.id}-${weekStart}-template-${templateId}`,
    favoriteExerciseIds
  );

  const { error } = await supabase.from("workout_plans").upsert(
    {
      user_id: user.id,
      week_start: weekStart,
      setting: template.equipment,
      plan_data: planData,
    },
    { onConflict: "user_id,week_start" }
  );
  if (error) return { error: error.message };

  revalidatePath("/workouts", "layout");
  revalidatePath("/home");
  return { success: true };
}

/** "Recommend one for me" — re-runs the normal profile-driven generator. */
export async function recommendPersonalizedWorkout() {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };
  if (!(await requireActivePremium(user.id))) return { error: "premium_required" };

  const [{ data: profile }, { data: exercises }, favoriteExerciseIds] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("exercises").select("*"),
    getFavoriteIds(user.id, "exercise"),
  ]);
  if (!profile || !exercises) return { error: "Could not load profile" };

  const weekStart = currentWeekStart();
  const setting = (profile.equipment_setting ?? "home") as "home" | "gym" | "both";
  const planData = generateWorkoutPlanData(profile, exercises, weekStart, setting, favoriteExerciseIds);

  const { error } = await supabase.from("workout_plans").upsert(
    {
      user_id: user.id,
      week_start: weekStart,
      setting,
      plan_data: planData,
    },
    { onConflict: "user_id,week_start" }
  );
  if (error) return { error: error.message };

  revalidatePath("/workouts", "layout");
  revalidatePath("/home");
  return { success: true };
}
