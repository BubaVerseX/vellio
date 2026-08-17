export const PROJECTION_HORIZON_WEEKS = 12;
/** Rough Wishnofsky rule of thumb: ~7700 kcal of sustained deficit/surplus
 * per kg of body-fat change. A simplification (ignores lean-mass shifts,
 * adaptive metabolism, water weight) but standard for a directional estimate. */
const KCAL_PER_KG = 7700;

export type ProjectionPoint = { week: number; weightKg: number };

/** Deterministic weekly weight trajectory from the calorie target vs. TDEE
 * gap — the AI only writes the milestone narration grounded in these
 * numbers, it never invents the trajectory itself. */
export function computeWeightProjection(
  startingWeightKg: number,
  calorieTarget: number,
  tdee: number,
  horizonWeeks: number = PROJECTION_HORIZON_WEEKS
): { weeklyDeltaKg: number; series: ProjectionPoint[] } {
  const dailyDelta = calorieTarget - tdee;
  const weeklyDeltaKg = Math.round(((dailyDelta * 7) / KCAL_PER_KG) * 100) / 100;

  const series: ProjectionPoint[] = [];
  for (let week = 0; week <= horizonWeeks; week++) {
    series.push({
      week,
      weightKg: Math.round((startingWeightKg + weeklyDeltaKg * week) * 10) / 10,
    });
  }

  return { weeklyDeltaKg, series };
}
