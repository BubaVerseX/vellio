"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import en from "@/lib/i18n/dictionaries/en";
import { toggleGroceryItem } from "@/lib/actions/grocery";
import { CATEGORY_ORDER, type GroceryItem } from "@/lib/plan/groceryList";
import type { IngredientCategory } from "@/lib/plan/ingredients";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type MarkShape = "circle" | "square" | "triangle";

const CATEGORY_STYLE: Record<
  IngredientCategory,
  { squareColor: string; shape: MarkShape; shapeColor: string }
> = {
  produce: { squareColor: "var(--color-accent)", shape: "circle", shapeColor: "var(--color-bg)" },
  dairy: { squareColor: "var(--color-neutral-3)", shape: "square", shapeColor: "var(--color-bg)" },
  meat: { squareColor: "var(--color-accent-2)", shape: "triangle", shapeColor: "var(--color-neutral-3)" },
  seafood: { squareColor: "var(--color-accent-2)", shape: "circle", shapeColor: "var(--color-bg)" },
  pantry: { squareColor: "var(--color-neutral-3)", shape: "triangle", shapeColor: "var(--color-bg)" },
  spices: { squareColor: "var(--color-accent)", shape: "triangle", shapeColor: "var(--color-bg)" },
  other: { squareColor: "var(--color-bg)", shape: "circle", shapeColor: "var(--color-neutral-3)" },
};

function CategoryMarker({ category }: { category: IngredientCategory }) {
  const { squareColor, shape, shapeColor } = CATEGORY_STYLE[category];
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center"
      style={{ background: squareColor }}
    >
      {shape === "circle" && <span className="h-2.5 w-2.5 rounded-full" style={{ background: shapeColor }} />}
      {shape === "square" && <span className="h-2.5 w-2.5" style={{ background: shapeColor }} />}
      {shape === "triangle" && (
        <span
          className="h-0 w-0 border-r-[5px] border-b-[8px] border-l-[5px] border-r-transparent border-l-transparent"
          style={{ borderBottomColor: shapeColor }}
        />
      )}
    </span>
  );
}

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
    <div className="flex flex-col gap-5 pb-24">
      {error && <p className="text-sm font-medium text-[var(--color-accent)]">{error}</p>}
      {nonEmptyCategories.map((category) => (
        <div key={category} className="border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center gap-2.5 px-4 py-3">
            <CategoryMarker category={category} />
            <div className="min-w-0 flex-1">
              <h2 className="text-[12px] font-black text-[var(--color-text-primary)]">
                {t.grocery.categories[category]}
              </h2>
              <span className="text-mono-label block text-[9.5px] text-white/40">
                {en.grocery.categories[category]}
              </span>
            </div>
            <span className="text-mono-label text-[10px] text-[var(--color-text-tertiary)]">
              {grouped[category].length}
            </span>
          </div>
          <div className="flex flex-col divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
            {grouped[category].map((item) => {
              const isChecked = !!checked[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleToggle(item.key)}
                  className="flex items-center gap-3 px-4 py-3 text-left"
                >
                  <span
                    className={cn(
                      "flex h-[19px] w-[19px] shrink-0 items-center justify-center",
                      isChecked
                        ? "bg-[var(--color-accent)]"
                        : "border border-[var(--color-border-strong)]"
                    )}
                  >
                    {isChecked && <Check strokeWidth={3} className="h-3 w-3 text-[var(--color-bg)]" />}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-sm font-semibold",
                      isChecked ? "text-white/35 line-through" : "text-[var(--color-text-primary)]"
                    )}
                  >
                    {item.name}
                  </span>
                  <span className="text-mono-label text-[10px] text-[var(--color-text-tertiary)]">
                    {item.quantity} {item.unit}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="fixed right-0 bottom-[calc(64px+env(safe-area-inset-bottom))] left-0 z-30 px-4 md:static md:px-0">
        <Link href="/meals">
          <Button variant="primary" className="w-full">
            {t.grocery.finishList}
          </Button>
        </Link>
      </div>
    </div>
  );
}
