import { createClient } from "@/lib/supabase/server";
import { getFavoriteIds } from "@/lib/actions/favorites";
import { currentWeekStart } from "@/lib/plan/weekDate";
import { generateMealPlanData, type MealPlanData } from "@/lib/plan/mealPlan";
import { generateWorkoutPlanData, type WorkoutPlanData } from "@/lib/plan/workoutPlan";
import { calculateBMR, calculateCalorieTarget, calculateMacros, calculateTDEE, type MacroTargets } from "@/lib/plan/nutrition";
import type { Tables } from "@/lib/supabase/database.types";
import { generateAiPlan } from "./generateAiPlan";
import { computeWeightProjection, PROJECTION_HORIZON_WEEKS } from "./projection";

type ProfileSnapshot = {
  goal: string | null;
  weight_kg: number | null;
  activity_level: string | null;
  height_cm: number | null;
  age: number | null;
  sex: string | null;
  allergies: string[];
  dietary_restrictions: string[];
  equipment_setting: string | null;
  time_available_minutes: number | null;
};

const WEIGHT_CHANGE_THRESHOLD_KG = 3;
const TIME_CHANGE_THRESHOLD_MINUTES = 20;

function snapshotFromProfile(profile: Tables<"profiles">): ProfileSnapshot {
  return {
    goal: profile.goal,
    weight_kg: profile.weight_kg,
    activity_level: profile.activity_level,
    height_cm: profile.height_cm,
    age: profile.age,
    sex: profile.sex,
    allergies: profile.allergies ?? [],
    dietary_restrictions: profile.dietary_restrictions ?? [],
    equipment_setting: profile.equipment_setting,
    time_available_minutes: profile.time_available_minutes,
  };
}

function sameSet(a: string[], b: string[]) {
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.length === sb.length && sa.every((v, i) => v === sb[i]);
}

/** Only regenerate when the profile has drifted meaningfully since the last
 * generation — not on every visit. A goal change, an equipment/activity
 * change, or a weight/time swing past the threshold all qualify. */
function hasChangedMeaningfully(prev: ProfileSnapshot, next: ProfileSnapshot): boolean {
  if (prev.goal !== next.goal) return true;
  if (prev.equipment_setting !== next.equipment_setting) return true;
  if (prev.activity_level !== next.activity_level) return true;
  if (prev.sex !== next.sex) return true;
  if (!sameSet(prev.allergies, next.allergies)) return true;
  if (!sameSet(prev.dietary_restrictions, next.dietary_restrictions)) return true;

  if (prev.weight_kg != null && next.weight_kg != null) {
    if (Math.abs(prev.weight_kg - next.weight_kg) >= WEIGHT_CHANGE_THRESHOLD_KG) return true;
  } else if (prev.weight_kg !== next.weight_kg) {
    return true;
  }

  if (prev.time_available_minutes != null && next.time_available_minutes != null) {
    if (Math.abs(prev.time_available_minutes - next.time_available_minutes) >= TIME_CHANGE_THRESHOLD_MINUTES) {
      return true;
    }
  }

  return false;
}

export type ProjectionData = {
  horizonWeeks: number;
  weeklyDeltaKg: number;
  series: { week: number; weightKg: number }[];
  milestones: { weekLabel: string; text: string }[];
};

export type AiPlanRow = Tables<"ai_plans">;

/**
 * Returns the user's current AI plan, generating (or regenerating) it first
 * if missing or if their profile has drifted meaningfully. Falls back to the
 * formula generator — never the AI — whenever the AI call is unavailable or
 * fails, so a premium user always ends up with a usable plan.
 */
export async function ensureAiPlan(userId: string): Promise<AiPlanRow | null> {
  const supabase = await createClient();

  const [{ data: profile }, { data: existing }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("ai_plans").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  if (!profile) return null;

  const nextSnapshot = snapshotFromProfile(profile);
  if (existing) {
    const prevSnapshot = existing.source_profile as unknown as ProfileSnapshot;
    if (!hasChangedMeaningfully(prevSnapshot, nextSnapshot)) return existing;
  }

  const [{ data: recipes }, { data: exercises }] = await Promise.all([
    supabase.from("recipes").select("*"),
    supabase.from("exercises").select("*"),
  ]);
  if (!recipes || !exercises) return existing ?? null;

  const calorieTarget = calculateCalorieTarget(profile);
  if (!calorieTarget) return existing ?? null;
  const macros: MacroTargets = calculateMacros(profile, calorieTarget);
  const bmr = calculateBMR(profile);
  const tdee = bmr ? calculateTDEE(bmr, profile.activity_level) : calorieTarget;
  const { weeklyDeltaKg, series } = computeWeightProjection(profile.weight_kg ?? 70, calorieTarget, tdee);

  const aiResult = await generateAiPlan(
    profile,
    recipes,
    exercises,
    calorieTarget,
    macros,
    weeklyDeltaKg,
    PROJECTION_HORIZON_WEEKS
  );

  let mealPlanData: MealPlanData;
  let workoutPlanData: WorkoutPlanData;
  let milestones: { weekLabel: string; text: string }[];
  let modelId: string | null;

  if (aiResult) {
    mealPlanData = aiResult.mealPlanData;
    workoutPlanData = aiResult.workoutPlanData;
    milestones = aiResult.milestones;
    modelId = aiResult.modelId;
  } else {
    const weekStart = currentWeekStart();
    const [favoriteRecipeIds, favoriteExerciseIds] = await Promise.all([
      getFavoriteIds(userId, "recipe"),
      getFavoriteIds(userId, "exercise"),
    ]);
    const formulaMeal = generateMealPlanData(profile, recipes, weekStart, favoriteRecipeIds);
    if (!formulaMeal) return existing ?? null;
    mealPlanData = formulaMeal.planData;
    const setting = (profile.equipment_setting ?? "home") as "home" | "gym" | "both";
    workoutPlanData = generateWorkoutPlanData(profile, exercises, weekStart, setting, favoriteExerciseIds);
    milestones = [];
    modelId = null;
  }

  const workoutSetting = (profile.equipment_setting ?? "home") as "home" | "gym" | "both";
  const projection: ProjectionData = {
    horizonWeeks: PROJECTION_HORIZON_WEEKS,
    weeklyDeltaKg,
    series,
    milestones,
  };

  const { data: saved, error } = await supabase
    .from("ai_plans")
    .upsert(
      {
        user_id: userId,
        generated_at: new Date().toISOString(),
        source_profile: nextSnapshot,
        meal_plan_data: mealPlanData,
        workout_plan_data: workoutPlanData,
        workout_setting: workoutSetting,
        calorie_target: calorieTarget,
        macro_targets: macros,
        projection,
        model_id: modelId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error || !saved) {
    console.error("ensureAiPlan upsert error", error);
    return existing ?? null;
  }
  return saved;
}
