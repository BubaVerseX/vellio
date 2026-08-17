// Purely playful, supplementary flourish — never the source of truth. The
// real calorie number is always shown primary and unaltered; this just
// translates an already-estimated figure into a tangible, culturally
// specific unit alongside it.

/** A boiled khinkali is roughly 90-110 kcal; 100 is a fair round midpoint
 * for a clearly-approximate translation, not a precise nutrition claim. */
const KCAL_PER_KHINKALI = 100;

export function caloriesToKhinkali(calories: number): number {
  return Math.max(1, Math.round(calories / KCAL_PER_KHINKALI));
}

/** Moderate-intensity ballpark used only to seed the flourish above when no
 * real calorie-burn figure is tracked (this app doesn't measure actual
 * calories burned per workout) — deliberately rough, not a fitness claim. */
const ESTIMATED_KCAL_PER_WORKOUT_MINUTE = 6.5;

export function estimateWorkoutCalories(minutes: number): number {
  return Math.round(minutes * ESTIMATED_KCAL_PER_WORKOUT_MINUTE);
}
