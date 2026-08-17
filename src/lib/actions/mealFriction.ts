"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getFavoriteIds } from "./favorites";
import { getMealAlternatives } from "@/lib/plan/alternatives";
import {
  computeDayTotalCalories,
  type DayKey,
  type MealPlanData,
  type MealSlotKey,
} from "@/lib/plan/mealPlan";
import type { PortionOption } from "@/lib/plan/portions";
import { requireActivePremium } from "@/lib/premium/requireActivePremium";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** One-tap swap to the fastest/lowest-effort alternative within the same
 * calorie/macro range — not just any random alternative. */
export async function quickSwapToSimplest(weekStart: string, day: DayKey, slot: MealSlotKey) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };
  if (!(await requireActivePremium(user.id))) return { error: "premium_required" };

  const [{ data: mealRow }, { data: profile }, { data: recipes }] = await Promise.all([
    supabase.from("meal_plans").select("*").eq("user_id", user.id).eq("week_start", weekStart).single(),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("recipes").select("*"),
  ]);
  if (!mealRow || !profile || !recipes) return { error: "Not found" };

  const planData = mealRow.plan_data as unknown as MealPlanData;
  const dayPlan = planData.days[day];
  const currentId = dayPlan[slot];
  const currentRecipe = recipes.find((r) => r.id === currentId);
  if (!currentRecipe) return { error: "Recipe not found" };

  const favoriteIds = await getFavoriteIds(user.id, "recipe");
  const alternatives = getMealAlternatives(
    currentRecipe,
    recipes,
    profile,
    favoriteIds,
    `${user.id}-${weekStart}-${day}-${slot}-quickswap`
  );

  // Include the current recipe itself in the comparison — if it's already
  // the quickest option, this is a no-op rather than a pointless swap.
  const candidates = [currentRecipe, ...alternatives];
  const simplest = candidates.reduce((best, r) =>
    r.prep_time_minutes < best.prep_time_minutes ? r : best
  );

  if (simplest.id === currentRecipe.id) {
    return { success: true, changed: false };
  }

  const nextDay = { ...dayPlan, [slot]: simplest.id };
  const ids = [nextDay.breakfast, nextDay.lunch, nextDay.dinner, ...nextDay.snacks].filter(
    (id): id is string => !!id
  );
  const { data: dayRecipes } = await supabase.from("recipes").select("id, calories").in("id", ids);
  const calorieById = new Map((dayRecipes ?? []).map((r) => [r.id, r.calories]));
  nextDay.totalCalories = computeDayTotalCalories(nextDay, calorieById);

  const newPlanData: MealPlanData = { days: { ...planData.days, [day]: nextDay } };
  const { error } = await supabase
    .from("meal_plans")
    .update({ plan_data: newPlanData })
    .eq("id", mealRow.id);
  if (error) return { error: error.message };

  revalidatePath("/meals", "layout");
  revalidatePath("/home");
  return { success: true, changed: true, newRecipeName: simplest.name };
}

/** Scales a slot's serving size. Ingredient quantities scale automatically
 * wherever the grocery list aggregates this week's meal plan (see
 * lib/plan/groceryList.ts), since it reads this same portions map. */
export async function setMealPortion(
  weekStart: string,
  day: DayKey,
  slot: MealSlotKey,
  portion: PortionOption
) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };
  if (!(await requireActivePremium(user.id))) return { error: "premium_required" };

  const { data: mealRow } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .single();
  if (!mealRow) return { error: "Meal plan not found" };

  const planData = mealRow.plan_data as unknown as MealPlanData;
  const dayPlan = { ...planData.days[day], portions: { ...planData.days[day].portions, [slot]: portion } };

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

export type MealLogStatus = "eaten" | "ate_out" | "social";

/** Marks a meal slot eaten, "ate out", or a planned social/feast-style
 * occasion ("social" — Supra mode) without touching the stored plan — the
 * rest of the week stays untouched either way. */
export async function logMealStatus(date: string, slot: MealSlotKey, status: MealLogStatus | null) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };
  if (!(await requireActivePremium(user.id))) return { error: "premium_required" };

  if (status === null) {
    const { error } = await supabase
      .from("meal_logs")
      .delete()
      .eq("user_id", user.id)
      .eq("date", date)
      .eq("slot", slot);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("meal_logs")
      .upsert(
        { user_id: user.id, date, slot, status },
        { onConflict: "user_id,date,slot" }
      );
    if (error) return { error: error.message };
  }

  revalidatePath("/meals", "layout");
  revalidatePath("/home");
  return { success: true };
}
