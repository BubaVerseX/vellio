import type { Tables } from "@/lib/supabase/database.types";
import { seededShuffle } from "./seededRandom";
import { DAYS_OF_WEEK, type DayKey } from "./mealPlan";

type Profile = Tables<"profiles">;
type Exercise = Tables<"exercises">;

export type PlannedExercise = {
  exerciseId: string;
  sets: number;
  reps: string;
};

export type DayWorkoutPlan =
  | { type: "rest" }
  | { type: "workout"; focus: string; exercises: PlannedExercise[] };

export type WorkoutPlanData = {
  days: Record<DayKey, DayWorkoutPlan>;
};

const FOCUS_CYCLES: Record<string, string[]> = {
  build_muscle: ["chest", "back", "legs", "shoulders", "arms"],
  gain_weight: ["chest", "back", "legs", "shoulders", "full_body"],
  lose_weight: ["full_body", "cardio", "legs", "cardio", "full_body"],
  maintain: ["full_body", "cardio", "legs", "full_body", "core"],
};

function daysPerWeekFromTime(timeAvailableMinutes: number | null) {
  const minutes = timeAvailableMinutes ?? 30;
  if (minutes >= 60) return 5;
  if (minutes >= 40) return 4;
  if (minutes >= 20) return 3;
  return 2;
}

function exerciseCountFromTime(timeAvailableMinutes: number | null) {
  const minutes = timeAvailableMinutes ?? 30;
  return Math.max(3, Math.min(7, Math.floor(minutes / 8)));
}

function buildWeeklySchedule(daysPerWeek: number): boolean[] {
  // Spread training days evenly across the week rather than front-loading them.
  const schedule = Array(7).fill(false);
  const gap = 7 / daysPerWeek;
  for (let i = 0; i < daysPerWeek; i++) {
    schedule[Math.floor(i * gap)] = true;
  }
  return schedule;
}

function eligibleExercisesForSetting(exercises: Exercise[], setting: "home" | "gym" | "both") {
  if (setting === "both") return exercises;
  return exercises.filter((e) => e.setting === setting || e.setting === "both");
}

function pickExercisesForFocus(
  exercises: Exercise[],
  focus: string,
  count: number,
  seedKey: string
): Exercise[] {
  let pool: Exercise[];

  if (focus === "full_body") {
    const groups = ["legs", "chest", "back", "core", "cardio"];
    pool = groups.flatMap((group) =>
      seededShuffle(
        exercises.filter((e) => e.muscle_group === group),
        `${seedKey}-${group}`
      ).slice(0, 2)
    );
  } else {
    pool = exercises.filter((e) => e.muscle_group === focus);
  }

  return seededShuffle(pool, seedKey).slice(0, count);
}

/**
 * Formula/database-driven workout plan generator. This is the v1 implementation —
 * swap the body of this function for an AI-generation call later without touching
 * callers (see `generatePlan.ts`).
 */
export function generateWorkoutPlanData(
  profile: Profile,
  exercises: Exercise[],
  weekStart: string,
  setting: "home" | "gym" | "both"
): WorkoutPlanData {
  const goal = profile.goal ?? "maintain";
  const focusCycle = FOCUS_CYCLES[goal] ?? FOCUS_CYCLES.maintain;
  const daysPerWeek = daysPerWeekFromTime(profile.time_available_minutes);
  const exerciseCount = exerciseCountFromTime(profile.time_available_minutes);
  const schedule = buildWeeklySchedule(daysPerWeek);
  const pool = eligibleExercisesForSetting(exercises, setting);

  const days = {} as Record<DayKey, DayWorkoutPlan>;
  let trainingDayIndex = 0;

  DAYS_OF_WEEK.forEach((day, index) => {
    if (!schedule[index]) {
      days[day] = { type: "rest" };
      return;
    }

    const focus = focusCycle[trainingDayIndex % focusCycle.length];
    trainingDayIndex += 1;

    const picked = pickExercisesForFocus(
      pool,
      focus,
      exerciseCount,
      `${profile.id}-${weekStart}-${day}-${focus}`
    );

    days[day] = {
      type: "workout",
      focus,
      exercises: picked.map((e) => ({
        exerciseId: e.id,
        sets: e.default_sets,
        reps: e.default_reps,
      })),
    };
  });

  return { days };
}
