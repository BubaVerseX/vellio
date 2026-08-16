"use client";

import type { OnboardingInput } from "@/app/onboarding/actions";
import type { GeneratedMealPlan, GeneratedWorkoutPlan } from "@/lib/actions/preview";

const STORAGE_KEY = "vellio-pending-plan";

export type PendingPlan = {
  input: OnboardingInput;
  mealPlan: GeneratedMealPlan;
  workoutPlan: GeneratedWorkoutPlan;
};

/**
 * Bridges the gap between "generated a preview anonymously" and "confirmed
 * email and logged in" when Supabase requires email confirmation (so there's
 * no session yet at signup time to save against). Session-scoped only — if
 * the user closes the tab before confirming, the preview is simply gone, same
 * as if they'd never signed up.
 */
export function savePendingPlan(plan: PendingPlan) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // sessionStorage unavailable (private mode etc.) — the save-plan
    // banner just won't auto-resume, not fatal.
  }
}

export function loadPendingPlan(): PendingPlan | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingPlan) : null;
  } catch {
    return null;
  }
}

export function clearPendingPlan() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
