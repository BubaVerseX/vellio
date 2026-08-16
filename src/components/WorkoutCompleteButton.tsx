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

  async function handleClick() {
    setPending(true);
    const next = !completed;
    const result = await setWorkoutCompleted(date, next);
    if (!result.error) setCompleted(next);
    setPending(false);
  }

  return (
    <Button
      variant={completed ? "selected" : "primary"}
      onClick={handleClick}
      disabled={pending}
      className="flex w-full items-center justify-center gap-2"
    >
      <CheckCircle2 strokeWidth={1.8} className="h-4 w-4" />
      {completed ? t.workouts.completed : t.workouts.markComplete}
    </Button>
  );
}
