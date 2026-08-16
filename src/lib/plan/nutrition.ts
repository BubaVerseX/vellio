import type { Tables } from "@/lib/supabase/database.types";

type Profile = Tables<"profiles">;

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_CALORIE_ADJUSTMENT: Record<string, number> = {
  lose_weight: -0.2,
  gain_weight: 0.15,
  build_muscle: 0.1,
  maintain: 0,
};

/** Mifflin-St Jeor BMR. Sex "other" uses the midpoint of the male/female offsets. */
export function calculateBMR(profile: Pick<Profile, "weight_kg" | "height_cm" | "age" | "sex">) {
  const { weight_kg, height_cm, age, sex } = profile;
  if (!weight_kg || !height_cm || !age) return null;

  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  if (sex === "male") return base + 5;
  if (sex === "female") return base - 161;
  return base - 78; // midpoint offset for "other" / unspecified
}

export function calculateTDEE(bmr: number, activityLevel: string | null) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel ?? "sedentary"] ?? 1.2;
  return bmr * multiplier;
}

export function calculateCalorieTarget(
  profile: Pick<Profile, "weight_kg" | "height_cm" | "age" | "sex" | "activity_level" | "goal">
) {
  const bmr = calculateBMR(profile);
  if (!bmr) return null;

  const tdee = calculateTDEE(bmr, profile.activity_level);
  const adjustment = GOAL_CALORIE_ADJUSTMENT[profile.goal ?? "maintain"] ?? 0;
  const target = tdee * (1 + adjustment);

  // Never recommend below BMR — a floor for safety.
  return Math.round(Math.max(target, bmr));
}

export type MacroTargets = {
  proteinG: number;
  carbsG: number;
  fatG: number;
  calories: number;
};

const PROTEIN_G_PER_KG: Record<string, number> = {
  lose_weight: 2.0,
  build_muscle: 1.8,
  gain_weight: 1.8,
  maintain: 1.6,
};

const FAT_PERCENT_OF_CALORIES: Record<string, number> = {
  lose_weight: 0.25,
  build_muscle: 0.25,
  gain_weight: 0.25,
  maintain: 0.3,
};

export function calculateMacros(
  profile: Pick<Profile, "weight_kg" | "goal">,
  calorieTarget: number
): MacroTargets {
  const goal = profile.goal ?? "maintain";
  const proteinPerKg = PROTEIN_G_PER_KG[goal] ?? 1.6;
  const fatPercent = FAT_PERCENT_OF_CALORIES[goal] ?? 0.3;

  const proteinG = Math.round((profile.weight_kg ?? 70) * proteinPerKg);
  const fatCalories = calorieTarget * fatPercent;
  const fatG = Math.round(fatCalories / 9);

  const proteinCalories = proteinG * 4;
  const carbsCalories = Math.max(calorieTarget - proteinCalories - fatCalories, 0);
  const carbsG = Math.round(carbsCalories / 4);

  return { proteinG, carbsG, fatG, calories: calorieTarget };
}
