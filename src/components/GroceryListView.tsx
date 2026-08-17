"use client";

import { useState } from "react";
import { Check, Carrot, Milk, Beef, Fish, Package, FlaskConical, ShoppingBag, type LucideIcon } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { toggleGroceryItem } from "@/lib/actions/grocery";
import { CATEGORY_ORDER, type GroceryItem } from "@/lib/plan/groceryList";
import type { IngredientCategory } from "@/lib/plan/ingredients";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const CATEGORY_STYLE: Record<IngredientCategory, { icon: LucideIcon; color: string }> = {
  produce: { icon: Carrot, color: "#4caf7a" },
  dairy: { icon: Milk, color: "#5aa9f0" },
  meat: { icon: Beef, color: "#e05252" },
  seafood: { icon: Fish, color: "#29b6c6" },
  pantry: { icon: Package, color: "#c9a227" },
  spices: { icon: FlaskConical, color: "#ff5722" },
  other: { icon: ShoppingBag, color: "#8b95a1" },
};

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
      {nonEmptyCategories.map((category) => {
        const { icon: CategoryIcon, color } = CATEGORY_STYLE[category];
        return (
        <Card key={category} className="flex flex-col gap-2">
          <div className="mb-1 flex items-center gap-2.5">
            <span
              className="blob-mask blob-variant-2 flex h-7 w-7 shrink-0 items-center justify-center"
              style={{ background: color }}
            >
              <CategoryIcon strokeWidth={1.8} className="h-3.5 w-3.5 text-white" />
            </span>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-[var(--color-text-tertiary)]">
              {t.grocery.categories[category]}
            </h2>
          </div>
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
        );
      })}
    </div>
  );
}
