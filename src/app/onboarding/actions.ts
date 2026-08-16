"use server";

import { createClient } from "@/lib/supabase/server";
import { generatePlan, currentWeekStart } from "@/lib/plan/generatePlan";

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

  const plan = await generatePlan(user.id, currentWeekStart());
  if (!plan) return { error: "Could not generate your plan. Please try again." };

  return { success: true };
}
