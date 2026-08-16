import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { DayKey } from "./mealPlan";

const DAY_TO_SHORT_KEY: Record<DayKey, keyof Dictionary["settings"]["days"]> = {
  monday: "mon",
  tuesday: "tue",
  wednesday: "wed",
  thursday: "thu",
  friday: "fri",
  saturday: "sat",
  sunday: "sun",
};

export function dayLabel(day: DayKey, t: Dictionary) {
  return t.settings.days[DAY_TO_SHORT_KEY[day]];
}
