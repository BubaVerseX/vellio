"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getFavoriteIds } from "./favorites";
import { getMealAlternatives, getExerciseAlternatives } from "@/lib/plan/alternatives";
import { computeDayTotalCalories, type DayKey, type MealPlanData } from "@/lib/plan/mealPlan";
import type { WorkoutPlanData } from "@/lib/plan/workoutPlan";

export type MealSlot = "breakfast" | "lunch" | "dinner" | { snackIndex: number };

function slotKey(slot: MealSlot) {
  return typeof slot === "string" ? slot : `snack:${slot.snackIndex}`;
}

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function fetchMealAlternatives(weekStart: string, day: DayKey, slot: MealSlot) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };

  const [{ data: mealRow }, { data: profile }, { data: recipes }] = await Promise.all([
    supabase.from("meal_plans").select("*").eq("user_id", user.id).eq("week_start", weekStart).single(),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("recipes").select("*"),
  ]);
  if (!mealRow || !profile || !recipes) return { error: "Not found" };

  const planData = mealRow.plan_data as unknown as MealPlanData;
  const dayPlan = planData.days[day];
  const currentId = typeof slot === "string" ? dayPlan[slot] : dayPlan.snacks[slot.snackIndex];
  const currentRecipe = recipes.find((r) => r.id === currentId);
  if (!currentRecipe) return { error: "Recipe not found" };

  const favoriteIds = await getFavoriteIds(user.id, "recipe");
  const alternatives = getMealAlternatives(
    currentRecipe,
    recipes,
    profile,
    favoriteIds,
    `${user.id}-${weekStart}-${day}-${slotKey(slot)}-swap`
  );

  return {
    current: currentRecipe,
    alternatives,
    favoriteIds: [...favoriteIds],
  };
}

export async function applyMealSwap(
  weekStart: string,
  day: DayKey,
  slot: MealSlot,
  newRecipeId: string
) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: mealRow } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .single();
  if (!mealRow) return { error: "Meal plan not found" };

  const planData = mealRow.plan_data as unknown as MealPlanData;
  const dayPlan = { ...planData.days[day] };

  if (typeof slot === "string") {
    dayPlan[slot] = newRecipeId;
  } else {
    const snacks = [...dayPlan.snacks];
    snacks[slot.snackIndex] = newRecipeId;
    dayPlan.snacks = snacks;
  }

  const ids = [dayPlan.breakfast, dayPlan.lunch, dayPlan.dinner, ...dayPlan.snacks].filter(
    (id): id is string => !!id
  );
  const { data: dayRecipes } = await supabase.from("recipes").select("id, calories").in("id", ids);
  const calorieById = new Map((dayRecipes ?? []).map((r) => [r.id, r.calories]));
  dayPlan.totalCalories = computeDayTotalCalories(dayPlan, calorieById);

  const newPlanData: MealPlanData = { days: { ...planData.days, [day]: dayPlan } };

  const { error } = await supabase
    .from("meal_plans")
    .update({ plan_data: newPlanData })
    .eq("id", mealRow.id);
  if (error) return { error: error.message };

  revalidatePath("/meals", "layout");
  revalidatePath("/home");
  return { success: true };
}

export async function fetchExerciseAlternatives(
  weekStart: string,
  day: DayKey,
  exerciseIndex: number
) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };

  const [{ data: workoutRow }, { data: exercises }] = await Promise.all([
    supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .single(),
    supabase.from("exercises").select("*"),
  ]);
  if (!workoutRow || !exercises) return { error: "Not found" };

  const planData = workoutRow.plan_data as unknown as WorkoutPlanData;
  const dayPlan = planData.days[day];
  if (dayPlan.type !== "workout") return { error: "Rest day" };

  const current = dayPlan.exercises[exerciseIndex];
  const currentExercise = exercises.find((e) => e.id === current?.exerciseId);
  if (!currentExercise) return { error: "Exercise not found" };

  const favoriteIds = await getFavoriteIds(user.id, "exercise");
  const setting = workoutRow.setting as "home" | "gym" | "both";
  const alternatives = getExerciseAlternatives(
    currentExercise,
    exercises,
    setting,
    favoriteIds,
    `${user.id}-${weekStart}-${day}-${exerciseIndex}-swap`
  );

  return {
    current: currentExercise,
    alternatives,
    favoriteIds: [...favoriteIds],
  };
}

export async function applyExerciseSwap(
  weekStart: string,
  day: DayKey,
  exerciseIndex: number,
  newExerciseId: string
) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };

  const [{ data: workoutRow }, { data: newExercise }] = await Promise.all([
    supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .single(),
    supabase.from("exercises").select("*").eq("id", newExerciseId).single(),
  ]);
  if (!workoutRow || !newExercise) return { error: "Not found" };

  const planData = workoutRow.plan_data as unknown as WorkoutPlanData;
  const dayPlan = planData.days[day];
  if (dayPlan.type !== "workout") return { error: "Rest day" };

  const exercises = [...dayPlan.exercises];
  exercises[exerciseIndex] = {
    exerciseId: newExercise.id,
    sets: newExercise.default_sets,
    reps: newExercise.default_reps,
  };

  const newPlanData: WorkoutPlanData = {
    days: { ...planData.days, [day]: { ...dayPlan, exercises } },
  };

  const { error } = await supabase
    .from("workout_plans")
    .update({ plan_data: newPlanData })
    .eq("id", workoutRow.id);
  if (error) return { error: error.message };

  revalidatePath("/workouts", "layout");
  revalidatePath("/home");
  return { success: true };
}
