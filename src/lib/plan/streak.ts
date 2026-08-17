export type StreakLog = { date: string; workout_completed: boolean | null };

/** Consecutive days of completed workouts ending today (or yesterday, if
 * today hasn't been logged yet — an unfinished today shouldn't zero out an
 * otherwise real streak). A missing day (no row at all) breaks the streak
 * the same as an explicit false, since it means nothing was logged. */
export function computeWorkoutStreak(logs: StreakLog[], todayDate: string): number {
  const byDate = new Map(logs.map((l) => [l.date, l.workout_completed]));
  const cursor = new Date(`${todayDate}T00:00:00Z`);
  if (byDate.get(todayDate) !== true) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (byDate.get(key) !== true) break;
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
