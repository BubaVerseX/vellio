"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, UtensilsCrossed, PartyPopper } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { logMealStatus, type MealLogStatus } from "@/lib/actions/mealFriction";
import type { MealSlotKey } from "@/lib/plan/mealPlan";
import { cn } from "@/lib/utils";

export function QuickMealLogToggle({
  date,
  slot,
  initialStatus,
}: {
  date: string;
  slot: MealSlotKey;
  initialStatus: MealLogStatus | null;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);

  async function toggle(next: MealLogStatus) {
    const nextStatus = status === next ? null : next;
    const previous = status;
    setStatus(nextStatus);
    setError(null);
    const result = await logMealStatus(date, slot, nextStatus);
    if (result.error) {
      setStatus(previous);
      setError(result.error === "premium_required" ? t.premium.requiredShort : result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => toggle("eaten")}
          aria-label="Mark eaten"
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-lg",
            status === "eaten" ? "soft-pressed text-[var(--color-accent)]" : "soft-raised text-[var(--color-text-tertiary)]"
          )}
        >
          <Check strokeWidth={2} className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => toggle("ate_out")}
          aria-label="Mark ate out"
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-lg",
            status === "ate_out" ? "soft-pressed text-[var(--color-accent)]" : "soft-raised text-[var(--color-text-tertiary)]"
          )}
        >
          <UtensilsCrossed strokeWidth={2} className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => toggle("social")}
          aria-label="Mark social meal"
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-lg",
            status === "social" ? "soft-pressed text-[var(--color-accent)]" : "soft-raised text-[var(--color-text-tertiary)]"
          )}
        >
          <PartyPopper strokeWidth={2} className="h-3.5 w-3.5" />
        </button>
      </div>
      {error && <span className="text-[10px] font-semibold text-[var(--color-accent)]">{error}</span>}
    </div>
  );
}
