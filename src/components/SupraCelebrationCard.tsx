"use client";

import { PartyPopper } from "lucide-react";
import { useLocale } from "@/lib/i18n";

/** Distinct celebratory treatment for a meal logged as a planned social/
 * feast occasion (Supra mode) — deliberately warm and dark, tonally
 * different from the flat default logging state, never judgmental. */
export function SupraCelebrationCard({ recipeName }: { recipeName: string }) {
  const { t } = useLocale();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3a1f14] to-[#20120a] p-4 text-white">
      <div className="flex items-center gap-3">
        <span className="blob-mask blob-variant-2 flex h-11 w-11 shrink-0 items-center justify-center bg-white/10">
          <PartyPopper strokeWidth={1.8} className="h-5 w-5 text-[#ffb020]" />
        </span>
        <div className="min-w-0">
          <span className="block text-sm font-extrabold tracking-tight">{t.meals.supraHeadline}</span>
          <span className="block truncate text-xs text-white/70">{recipeName}</span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/85">{t.meals.supraBody}</p>
    </div>
  );
}
