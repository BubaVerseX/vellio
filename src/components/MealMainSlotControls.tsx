"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Check, UtensilsCrossed, PartyPopper } from "lucide-react";
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
import { SupraCelebrationCard } from "@/components/SupraCelebrationCard";

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
  const [showSupraPanel, setShowSupraPanel] = useState(initialLogStatus === "social");

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
        <Chip onClick={handleQuickSwap} disabled={quickSwapPending} className="!px-3 !py-1.5 text-xs">
          <span className="flex items-center gap-1.5">
            <Zap strokeWidth={1.8} className="h-3.5 w-3.5" />
            {t.meals.quickSwap}
          </span>
        </Chip>
        <Chip selected={logStatus === "eaten"} onClick={() => handleLogToggle("eaten")} className="!px-3 !py-1.5 text-xs">
          <span className="flex items-center gap-1.5">
            <Check strokeWidth={1.8} className="h-3.5 w-3.5" />
            {t.meals.markEaten}
          </span>
        </Chip>
        <Chip selected={logStatus === "ate_out"} onClick={() => handleLogToggle("ate_out")} className="!px-3 !py-1.5 text-xs">
          <span className="flex items-center gap-1.5">
            <UtensilsCrossed strokeWidth={1.8} className="h-3.5 w-3.5" />
            {t.meals.ateOut}
          </span>
        </Chip>
        <Chip
          selected={showSupraPanel}
          onClick={() => setShowSupraPanel((v) => !v)}
          className="!border-[var(--color-supra-accent)]/60 !px-3 !py-1.5 text-xs !text-[var(--color-supra-accent)]"
        >
          <span className="flex items-center gap-1.5">
            <PartyPopper strokeWidth={1.8} className="h-3.5 w-3.5" />
            {t.meals.social}
          </span>
        </Chip>
      </div>

      {showSupraPanel && (
        <SupraCelebrationCard logged={logStatus === "social"} onConfirm={() => handleLogToggle("social")} />
      )}

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
