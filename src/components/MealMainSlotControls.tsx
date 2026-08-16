"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Check, UtensilsCrossed } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import type { DayKey, MealSlotKey } from "@/lib/plan/mealPlan";
import {
  quickSwapToSimplest,
  setMealPortion,
  logMealStatus,
  type MealLogStatus,
} from "@/lib/actions/mealFriction";
import { PORTION_OPTIONS } from "@/lib/plan/portions";
import { cn } from "@/lib/utils";

export function MealMainSlotControls({
  weekStart,
  day,
  slot,
  date,
  currentPortion,
  initialLogStatus,
}: {
  weekStart: string;
  day: DayKey;
  slot: MealSlotKey;
  date: string;
  currentPortion: number;
  initialLogStatus: MealLogStatus | null;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [portion, setPortion] = useState(currentPortion);
  const [logStatus, setLogStatus] = useState<MealLogStatus | null>(initialLogStatus);
  const [quickSwapPending, setQuickSwapPending] = useState(false);
  const [portionPending, setPortionPending] = useState(false);

  async function handleQuickSwap() {
    setQuickSwapPending(true);
    const result = await quickSwapToSimplest(weekStart, day, slot);
    setQuickSwapPending(false);
    if (!result.error && result.changed) {
      router.refresh();
    }
  }

  async function handlePortionChange(next: (typeof PORTION_OPTIONS)[number]) {
    setPortion(next);
    setPortionPending(true);
    const result = await setMealPortion(weekStart, day, slot, next);
    setPortionPending(false);
    if (!result.error) router.refresh();
  }

  async function handleLogToggle(next: MealLogStatus) {
    const nextStatus = logStatus === next ? null : next;
    setLogStatus(nextStatus);
    await logMealStatus(date, slot, nextStatus);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleQuickSwap}
          disabled={quickSwapPending}
          className="soft-raised flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-[var(--color-text-secondary)]"
        >
          <Zap strokeWidth={1.8} className="h-3.5 w-3.5" />
          {t.meals.quickSwap}
        </button>
        <button
          type="button"
          onClick={() => handleLogToggle("eaten")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
            logStatus === "eaten" ? "soft-pressed text-[var(--color-accent)]" : "soft-raised text-[var(--color-text-secondary)]"
          )}
        >
          <Check strokeWidth={1.8} className="h-3.5 w-3.5" />
          {t.meals.markEaten}
        </button>
        <button
          type="button"
          onClick={() => handleLogToggle("ate_out")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
            logStatus === "ate_out" ? "soft-pressed text-[var(--color-accent)]" : "soft-raised text-[var(--color-text-secondary)]"
          )}
        >
          <UtensilsCrossed strokeWidth={1.8} className="h-3.5 w-3.5" />
          {t.meals.ateOut}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-[var(--color-text-tertiary)]">
          {t.meals.portion}
        </span>
        <ChipGroup className="p-1">
          {PORTION_OPTIONS.map((p) => (
            <Chip
              key={p}
              selected={portion === p}
              disabled={portionPending}
              onClick={() => handlePortionChange(p)}
              className="!px-3 !py-1 text-xs"
            >
              {p}×
            </Chip>
          ))}
        </ChipGroup>
      </div>
    </div>
  );
}
