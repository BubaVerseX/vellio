"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { setWorkoutCompleted } from "@/lib/actions/progress";

export function WorkoutCompleteButton({
  date,
  initialCompleted,
}: {
  date: string;
  initialCompleted: boolean;
}) {
  const { t } = useLocale();
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    const next = !completed;
    const result = await setWorkoutCompleted(date, next);
    setPending(false);
    if (result.error) {
      setError(result.error === "premium_required" ? t.premium.requiredShort : result.error);
      return;
    }
    setCompleted(next);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        variant={completed ? "selected" : "primary"}
        onClick={handleClick}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2"
      >
        <CheckCircle2 strokeWidth={1.8} className="h-4 w-4" />
        {completed ? t.workouts.completed : t.workouts.markComplete}
      </Button>
      {error && <p className="text-center text-xs font-semibold text-[var(--color-accent)]">{error}</p>}
    </div>
  );
}
