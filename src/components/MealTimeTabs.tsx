"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MealTab {
  key: string;
  label: string;
  content: ReactNode;
}

/** Flush-rectangle meal-time tabs — active segment filled orange. */
export function MealTimeTabs({ tabs }: { tabs: MealTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              "text-mono-label flex-1 border border-[var(--color-border)] px-2 py-2.5 text-[10px] transition-colors duration-150",
              active === tab.key
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-bg)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.find((tab) => tab.key === active)?.content}
    </div>
  );
}
