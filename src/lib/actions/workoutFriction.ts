"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DayKey } from "@/lib/plan/mealPlan";
import type { WorkoutPlanData } from "@/lib/plan/workoutPlan";
import { dateForDay } from "@/lib/plan/weekDate";
import { requireActivePremium } from "@/lib/premium/requireActivePremium";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Pushes a missed workout to another day instead of just leaving it marked
 * incomplete. Swaps the two days' contents — `toDay` must currently be a rest
 * day, so nothing already scheduled there gets silently lost. */
export async function rescheduleWorkout(weekStart: string, fromDay: DayKey, toDay: DayKey) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };
  if (fromDay === toDay) return { error: "Pick a different day" };
  if (!(await requireActivePremium(user.id))) return { error: "premium_required" };

  const { data: workoutRow } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .single();
  if (!workoutRow) return { error: "Workout plan not found" };

  const planData = workoutRow.plan_data as unknown as WorkoutPlanData;
  const toDayPlan = planData.days[toDay];
  if (toDayPlan.type !== "rest") {
    return { error: "That day already has a workout scheduled." };
  }

  const newPlanData: WorkoutPlanData = {
    days: {
      ...planData.days,
      [fromDay]: toDayPlan,
      [toDay]: planData.days[fromDay],
    },
  };

  const { error } = await supabase
    .from("workout_plans")
    .update({ plan_data: newPlanData })
    .eq("id", workoutRow.id);
  if (error) return { error: error.message };

  const fromDate = dateForDay(weekStart, fromDay);
  await supabase.from("progress_logs").upsert(
    {
      user_id: user.id,
      date: fromDate,
      workout_notes: `Rescheduled to ${toDay}`,
    },
    { onConflict: "user_id,date" }
  );

  revalidatePath("/workouts", "layout");
  revalidatePath("/home");
  return { success: true };
}

const MIN_TIME_FILTERED_EXERCISES = 2;

/** "I only have N minutes" — trims today's exercise list down to fit, keeping
 * the same exercises (same session type) rather than swapping in new ones. */
export async function shortenWorkoutDay(weekStart: string, day: DayKey, availableMinutes: number) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };
  if (!(await requireActivePremium(user.id))) return { error: "premium_required" };

  const { data: workoutRow } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .single();
  if (!workoutRow) return { error: "Workout plan not found" };

  const planData = workoutRow.plan_data as unknown as WorkoutPlanData;
  const dayPlan = planData.days[day];
  if (dayPlan.type !== "workout") return { error: "Rest day" };

  const targetCount = Math.max(
    MIN_TIME_FILTERED_EXERCISES,
    Math.min(dayPlan.exercises.length, Math.floor(availableMinutes / 8))
  );
  if (targetCount >= dayPlan.exercises.length) {
    return { success: true, changed: false };
  }

  const newPlanData: WorkoutPlanData = {
    days: {
      ...planData.days,
      [day]: { ...dayPlan, exercises: dayPlan.exercises.slice(0, targetCount) },
    },
  };

  const { error } = await supabase
    .from("workout_plans")
    .update({ plan_data: newPlanData })
    .eq("id", workoutRow.id);
  if (error) return { error: error.message };

  revalidatePath("/workouts", "layout");
  revalidatePath("/home");
  return { success: true, changed: true };
}
