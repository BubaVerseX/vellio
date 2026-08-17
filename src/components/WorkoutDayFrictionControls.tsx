"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Timer } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { rescheduleWorkout, shortenWorkoutDay } from "@/lib/actions/workoutFriction";
import { dayLabel } from "@/lib/plan/dayLabel";
import type { DayKey } from "@/lib/plan/mealPlan";

const TIME_PRESETS = [15, 20, 30] as const;

export function WorkoutDayFrictionControls({
  weekStart,
  day,
  restDays,
}: {
  weekStart: string;
  day: DayKey;
  restDays: DayKey[];
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [showReschedule, setShowReschedule] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReschedule(toDay: DayKey) {
    setPending(true);
    setError(null);
    const result = await rescheduleWorkout(weekStart, day, toDay);
    setPending(false);
    if (result.error) {
      setError(result.error === "premium_required" ? t.premium.requiredShort : result.error);
      return;
    }
    router.push("/workouts");
    router.refresh();
  }

  async function handleShorten(minutes: number) {
    setPending(true);
    setError(null);
    const result = await shortenWorkoutDay(weekStart, day, minutes);
    setPending(false);
    if (result.error) {
      setError(result.error === "premium_required" ? t.premium.requiredShort : result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-tertiary)]">
          <Timer strokeWidth={1.8} className="h-3.5 w-3.5" />
          {t.workouts.onlyHaveMinutes}
        </span>
        {TIME_PRESETS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            disabled={pending}
            onClick={() => handleShorten(minutes)}
            className="soft-raised rounded-full px-3 py-1.5 text-xs font-bold text-[var(--color-text-secondary)]"
          >
            {minutes} {t.common.minutes}
          </button>
        ))}
      </div>

      {error && <p className="text-xs font-medium text-[var(--color-accent)]">{error}</p>}

      {!showReschedule ? (
        <Button
          variant="ghost"
          onClick={() => setShowReschedule(true)}
          className="flex items-center justify-center gap-2"
        >
          <CalendarClock strokeWidth={1.8} className="h-4 w-4" />
          {t.workouts.skipReschedule}
        </Button>
      ) : (
        <div className="soft-pressed flex flex-col gap-2 rounded-2xl p-3">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t.workouts.rescheduleToDay}
          </span>
          {restDays.length === 0 && (
            <span className="text-xs text-[var(--color-text-tertiary)]">{t.workouts.noRestDays}</span>
          )}
          <div className="flex flex-wrap gap-2">
            {restDays.map((restDay) => (
              <button
                key={restDay}
                type="button"
                disabled={pending}
                onClick={() => handleReschedule(restDay)}
                className="soft-raised rounded-full px-3 py-1.5 text-xs font-bold text-[var(--color-text-secondary)]"
              >
                {dayLabel(restDay, t)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowReschedule(false)}
            className="w-fit text-xs font-semibold text-[var(--color-text-tertiary)]"
          >
            {t.common.cancel}
          </button>
        </div>
      )}
    </div>
  );
}
