"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Repeat } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { fetchExerciseAlternatives, applyExerciseSwap } from "@/lib/actions/swap";
import { localizedField } from "@/lib/plan/localized";
import type { DayKey } from "@/lib/plan/mealPlan";
import type { Tables } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/Button";

type Exercise = Tables<"exercises">;

export function ExerciseSwapPanel({
  weekStart,
  day,
  exerciseIndex,
}: {
  weekStart: string;
  day: DayKey;
  exerciseIndex: number;
}) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<Exercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    setOpen(true);
    if (alternatives) return;
    setLoading(true);
    const result = await fetchExerciseAlternatives(weekStart, day, exerciseIndex);
    setLoading(false);
    if ("error" in result) {
      setError(result.error ?? "Error");
      return;
    }
    setAlternatives(result.alternatives);
  }

  async function handleChoose(exerciseId: string) {
    setApplying(exerciseId);
    const result = await applyExerciseSwap(weekStart, day, exerciseIndex, exerciseId);
    setApplying(null);
    if (!result.error) {
      setOpen(false);
      setAlternatives(null);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="soft-raised flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-[var(--color-text-secondary)]"
      >
        <Repeat strokeWidth={1.8} className="h-3.5 w-3.5" />
        {t.workouts.swap}
      </button>
    );
  }

  return (
    <div className="soft-pressed flex flex-col gap-2 rounded-2xl p-3">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
        {t.workouts.swapChoose}
      </span>
      {loading && <span className="text-sm text-[var(--color-text-secondary)]">{t.common.loading}</span>}
      {error && <span className="text-sm text-[var(--color-accent)]">{error}</span>}
      {alternatives?.length === 0 && (
        <span className="text-sm text-[var(--color-text-secondary)]">{t.workouts.swapNoOptions}</span>
      )}
      {alternatives?.map((alt) => (
        <button
          key={alt.id}
          type="button"
          onClick={() => handleChoose(alt.id)}
          disabled={applying !== null}
          className="soft-raised flex items-center justify-between rounded-xl px-3 py-2.5 text-left"
        >
          <span className="text-sm font-semibold">{localizedField(alt, "name", "name_ka", locale)}</span>
          <span className="text-xs font-bold text-[var(--color-accent-2)]">
            {alt.default_sets} × {alt.default_reps}
          </span>
        </button>
      ))}
      <Button variant="ghost" onClick={() => setOpen(false)} className="!py-2 text-xs">
        {t.common.cancel}
      </Button>
    </div>
  );
}
