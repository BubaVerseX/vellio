"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";
import { NAV_ITEMS } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="soft-raised fixed inset-x-4 bottom-4 z-40 flex items-center justify-around rounded-[28px] px-2 py-2 md:hidden">
      {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-all",
              active && "soft-pressed"
            )}
          >
            <Icon
              strokeWidth={1.8}
              className={cn(
                "h-5 w-5",
                active ? "text-[var(--color-accent)]" : "text-[var(--color-text-tertiary)]"
              )}
            />
            <span
              className={cn(
                "text-[11px] font-semibold",
                active ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"
              )}
            >
              {t.nav[key]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
