"use client";

import { useState } from "react";
import { Dumbbell, Repeat } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { DAYS_OF_WEEK } from "@/lib/plan/mealPlan";
import { getExerciseAlternatives } from "@/lib/plan/alternatives";
import { dayLabel } from "@/lib/plan/dayLabel";
import { localizedField } from "@/lib/plan/localized";
import type { Tables } from "@/lib/supabase/database.types";
import { Card } from "@/components/ui/Card";
import type { GeneratedWorkoutPlan } from "@/lib/actions/preview";

type Exercise = Tables<"exercises">;

export function WorkoutPreview({
  previewId,
  exercises,
  workoutPlan,
  onChange,
}: {
  previewId: string;
  exercises: Exercise[];
  workoutPlan: GeneratedWorkoutPlan;
  onChange: (next: GeneratedWorkoutPlan) => void;
}) {
  const { t, locale } = useLocale();
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  const [openSwap, setOpenSwap] = useState<string | null>(null);

  function handleSwap(day: (typeof DAYS_OF_WEEK)[number], index: number, newExerciseId: string) {
    const dayPlan = workoutPlan.planData.days[day];
    if (dayPlan.type !== "workout") return;
    const newExercise = exerciseMap.get(newExerciseId);
    if (!newExercise) return;

    const nextExercises = [...dayPlan.exercises];
    nextExercises[index] = {
      exerciseId: newExercise.id,
      sets: newExercise.default_sets,
      reps: newExercise.default_reps,
    };

    onChange({
      ...workoutPlan,
      planData: {
        days: { ...workoutPlan.planData.days, [day]: { ...dayPlan, exercises: nextExercises } },
      },
    });
    setOpenSwap(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {DAYS_OF_WEEK.map((day) => {
        const dayPlan = workoutPlan.planData.days[day];
        return (
          <Card key={day} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                {dayLabel(day, t)}
              </span>
              {dayPlan.type === "workout" && (
                <span className="text-xs font-bold text-[var(--color-accent-2)]">
                  {t.workouts.muscleGroups[dayPlan.focus as keyof typeof t.workouts.muscleGroups] ??
                    dayPlan.focus}
                </span>
              )}
            </div>
            {dayPlan.type === "rest" ? (
              <p className="text-xs text-[var(--color-text-tertiary)]">{t.workouts.restDay}</p>
            ) : (
              dayPlan.exercises.map((ex, index) => {
                const exercise = exerciseMap.get(ex.exerciseId);
                if (!exercise) return null;
                const key = `${day}-${index}`;
                const isOpen = openSwap === key;
                const alternatives = getExerciseAlternatives(
                  exercise,
                  exercises,
                  workoutPlan.setting,
                  new Set(),
                  `${previewId}-${day}-${index}`
                );

                return (
                  <div key={key} className="soft-pressed rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <Dumbbell strokeWidth={1.8} className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent-2)]" />
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {localizedField(exercise, "name", "name_ka", locale)}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-tertiary)]">
                            {ex.sets} {t.workouts.sets} × {ex.reps}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenSwap(isOpen ? null : key)}
                        className="soft-raised flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-[var(--color-text-secondary)]"
                      >
                        <Repeat strokeWidth={1.8} className="h-3 w-3" />
                        {t.workouts.swap}
                      </button>
                    </div>
                    {isOpen && (
                      <div className="mt-2 flex flex-col gap-1.5 border-t border-black/[0.04] pt-2">
                        {alternatives.map((alt) => (
                          <button
                            key={alt.id}
                            type="button"
                            onClick={() => handleSwap(day, index, alt.id)}
                            className="soft-raised flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold"
                          >
                            <span>{localizedField(alt, "name", "name_ka", locale)}</span>
                          </button>
                        ))}
                        {alternatives.length === 0 && (
                          <span className="text-xs text-[var(--color-text-tertiary)]">
                            {t.workouts.swapNoOptions}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </Card>
        );
      })}
    </div>
  );
}
