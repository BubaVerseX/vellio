"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { FAQ_IDS } from "@/lib/content/faq";
import { cn } from "@/lib/utils";

export function FaqAccordion() {
  const { t } = useLocale();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {FAQ_IDS.map((id) => {
        const item = t.faq.items[id];
        const isOpen = openId === id;
        return (
          <div
            key={id}
            className={cn("rounded-2xl transition-all", isOpen ? "soft-pressed" : "soft-raised")}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-[15px] font-bold">{item.question}</span>
              <ChevronDown
                strokeWidth={1.8}
                className={cn(
                  "h-4 w-4 shrink-0 text-[var(--color-text-tertiary)] transition-transform",
                  isOpen && "rotate-180 text-[var(--color-accent)]"
                )}
              />
            </button>
            {isOpen && (
              <p className="px-5 pb-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
