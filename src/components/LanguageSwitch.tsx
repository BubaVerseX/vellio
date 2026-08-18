"use client";

import { useRouter } from "next/navigation";
import { useLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ka", label: "GE" },
];

/** Boxed segmented toggle — active segment filled orange. */
export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const router = useRouter();

  return (
    <div className={cn("flex border border-[var(--color-border-strong)]", className)}>
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => {
            setLocale(code);
            router.refresh();
          }}
          className={cn(
            "text-mono-label px-3 py-1.5 text-[10px] transition-colors duration-150",
            locale === code
              ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
              : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
