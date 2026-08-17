"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateCalorieTarget } from "@/lib/plan/nutrition";

export type OnboardingInput = {
  fullName: string;
  age: number;
  sex: "male" | "female" | "other";
  weightKg: number;
  heightCm: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose_weight" | "gain_weight" | "maintain" | "build_muscle";
  allergies: string[];
  dietaryRestrictions: string[];
  restrictionsNotes: string;
  medicalConditions: string;
  timeAvailableMinutes: number;
  equipmentSetting: "home" | "gym" | "both";
};

export async function submitOnboarding(input: OnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error: updateError } = await supabase
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

  if (updateError) return { error: updateError.message };

  // Free users' plans are generated fresh on their first visit to /home
  // (see getOrCreateWeekPlans) rather than persisted here — just confirm
  // the profile has enough to compute a calorie target so onboarding fails
  // fast instead of surfacing an empty plan later.
  const calorieTarget = calculateCalorieTarget({
    weight_kg: input.weightKg,
    height_cm: input.heightCm,
    age: input.age,
    sex: input.sex,
    activity_level: input.activityLevel,
    goal: input.goal,
  });
  if (!calorieTarget) return { error: "Could not generate your plan. Please try again." };

  return { success: true };
}
