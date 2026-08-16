import { DAYS_OF_WEEK, type DayKey } from "./mealPlan";

const WEEKDAY_TO_DAYKEY: Record<string, DayKey> = {
  Mon: "monday",
  Tue: "tuesday",
  Wed: "wednesday",
  Thu: "thursday",
  Fri: "friday",
  Sat: "saturday",
  Sun: "sunday",
};

/** "Now" broken down in a given IANA timezone, for matching reminder schedules. */
export function zonedNow(timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((p) => [p.type, p.value]));
  const dayKey = WEEKDAY_TO_DAYKEY[parts.weekday] ?? DAYS_OF_WEEK[0];
  const hhmm = `${parts.hour}:${parts.minute}`;
  const dateStr = `${parts.year}-${parts.month}-${parts.day}`;

  return { dayKey, hhmm, dateStr };
}

const SHORT_DAY_KEYS: Record<DayKey, string> = {
  monday: "mon",
  tuesday: "tue",
  wednesday: "wed",
  thursday: "thu",
  friday: "fri",
  saturday: "sat",
  sunday: "sun",
};

export function shortDayKey(day: DayKey) {
  return SHORT_DAY_KEYS[day];
}

/** True if `hhmm` falls in the same N-minute bucket as `targetHhmm`. */
export function withinMinuteWindow(hhmm: string, targetHhmm: string, windowMinutes: number) {
  const toMinutes = (v: string) => {
    const [h, m] = v.split(":").map(Number);
    return h * 60 + m;
  };
  return Math.abs(toMinutes(hhmm) - toMinutes(targetHhmm)) < windowMinutes;
}
