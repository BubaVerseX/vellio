import { DAYS_OF_WEEK, type DayKey } from "./mealPlan";

/** Monday of the current week, in the user's local time, formatted as YYYY-MM-DD. */
export function currentWeekStart(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // shift Sunday back to the prior Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function dayKeyForDate(date = new Date()): DayKey {
  const day = date.getDay();
  return DAYS_OF_WEEK[day === 0 ? 6 : day - 1];
}
