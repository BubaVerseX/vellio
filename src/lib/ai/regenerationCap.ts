import type { Tables } from "@/lib/supabase/database.types";

// Pure decision logic for the AI regeneration cap, deliberately kept free of
// any Next.js/Supabase runtime imports (createClient, next/headers, etc.) so
// it can be unit-tested directly with `node --test` — see
// ensureAiPlan.test.ts. ensureAiPlan.ts is the only caller.

export type ProfileSnapshot = {
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

export const WEIGHT_CHANGE_THRESHOLD_KG = 3;
export const TIME_CHANGE_THRESHOLD_MINUTES = 20;

export function snapshotFromProfile(profile: Tables<"profiles">): ProfileSnapshot {
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

export function sameSet(a: string[], b: string[]) {
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.length === sb.length && sa.every((v, i) => v === sb[i]);
}

/** Only regenerate when the profile has drifted meaningfully since the last
 * generation — not on every visit. A goal change, an equipment/activity
 * change, or a weight/time swing past the threshold all qualify. Weight and
 * time are compared the same way: a null↔number transition always counts as
 * a change (both feed plan generation via a `?? default` fallback — see
 * lib/plan/workoutPlan.ts — so going from "unset" to a real value changes
 * the effective input even before any threshold is crossed), and once both
 * sides are set, only a swing past the threshold counts. */
export function hasChangedMeaningfully(prev: ProfileSnapshot, next: ProfileSnapshot): boolean {
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
  } else if (prev.time_available_minutes !== next.time_available_minutes) {
    return true;
  }

  return false;
}
