"use client";

import { useRouter } from "next/navigation";
import { useLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ka", label: "GE" },
];

export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const router = useRouter();

  return (
    <div className={cn("soft-pressed flex gap-1 rounded-full p-1", className)}>
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => {
            setLocale(code);
            router.refresh();
          }}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-bold transition-all",
            locale === code
              ? "soft-raised text-[var(--color-accent)]"
              : "text-[var(--color-text-tertiary)]"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
