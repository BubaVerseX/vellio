export type CelebrationMilestone =
  | { type: "streak"; days: number }
  | { type: "weight"; kg: number }
  | { type: "workouts"; count: number };

/** Picks the single most notable real achievement to celebrate on the
 * progress page — never fabricated, always grounded in an actual number.
 * Returns null when nothing yet clears the bar, rather than praising an
 * empty history. Priority: an active streak (most immediate), then
 * measurable progress toward the stated goal, then total workouts logged
 * as a fallback for someone without a directional goal. */
export function computeCelebration({
  workoutStreak,
  totalWorkoutsCompleted,
  changeKg,
  goal,
}: {
  workoutStreak: number;
  totalWorkoutsCompleted: number;
  changeKg: number | null;
  goal: string | null;
}): CelebrationMilestone | null {
  if (workoutStreak >= 3) return { type: "streak", days: workoutStreak };

  if (changeKg != null) {
    const wantsLoss = goal === "lose_weight";
    const wantsGain = goal === "gain_weight" || goal === "build_muscle";
    if (wantsLoss && changeKg <= -1) return { type: "weight", kg: Math.round(Math.abs(changeKg) * 10) / 10 };
    if (wantsGain && changeKg >= 1) return { type: "weight", kg: Math.round(Math.abs(changeKg) * 10) / 10 };
  }

  if (totalWorkoutsCompleted >= 5) return { type: "workouts", count: totalWorkoutsCompleted };

  return null;
}
