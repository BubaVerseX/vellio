"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { toggleGroceryItem } from "@/lib/actions/grocery";
import { CATEGORY_ORDER, type GroceryItem } from "@/lib/plan/groceryList";
import type { IngredientCategory } from "@/lib/plan/ingredients";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function GroceryListView({
  grouped,
  initialChecked,
  weekStart,
}: {
  grouped: Record<IngredientCategory, GroceryItem[]>;
  initialChecked: Record<string, boolean>;
  weekStart: string;
}) {
  const { t } = useLocale();
  const [checked, setChecked] = useState<Record<string, boolean>>(initialChecked);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle(key: string) {
    const next = !checked[key];
    setError(null);
    setChecked((prev) => ({ ...prev, [key]: next }));
    const result = await toggleGroceryItem(weekStart, key, next);
    if (result.error) {
      setChecked((prev) => ({ ...prev, [key]: !next }));
      setError(result.error === "premium_required" ? t.premium.requiredShort : result.error);
    }
  }

  const nonEmptyCategories = CATEGORY_ORDER.filter((cat) => grouped[cat].length > 0);

  return (
    <div className="flex flex-col gap-5">
      {error && <p className="text-sm font-medium text-[var(--color-accent)]">{error}</p>}
      {nonEmptyCategories.map((category) => (
        <Card key={category} className="flex flex-col gap-2">
          <h2 className="mb-1 text-sm font-extrabold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t.grocery.categories[category]}
          </h2>
          {grouped[category].map((item) => {
            const isChecked = !!checked[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleToggle(item.key)}
                className="soft-pressed flex items-center gap-3 rounded-xl px-4 py-3 text-left"
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all",
                    isChecked ? "soft-raised bg-[var(--color-accent)]" : "soft-raised"
                  )}
                >
                  {isChecked && <Check strokeWidth={2.5} className="h-3.5 w-3.5 text-white" />}
                </span>
                <span
                  className={cn(
                    "flex-1 text-sm font-semibold",
                    isChecked
                      ? "text-[var(--color-text-tertiary)] line-through"
                      : "text-[var(--color-text-primary)]"
                  )}
                >
                  {item.name}
                </span>
                <span className="text-xs font-semibold text-[var(--color-text-tertiary)]">
                  {item.quantity} {item.unit}
                </span>
              </button>
            );
          })}
        </Card>
      ))}
    </div>
  );
}
