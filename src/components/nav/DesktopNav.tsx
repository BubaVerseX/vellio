"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";
import { NAV_ITEMS } from "./nav-items";

export function DesktopNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="soft-raised hidden items-center gap-1.5 rounded-full p-2 md:flex">
      {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex items-center gap-2 overflow-hidden rounded-full px-5 py-3 text-[15px] font-bold transition-all",
              active
                ? "soft-pressed text-[var(--color-accent)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            {active && <div className="gradient-tint-primary pointer-events-none absolute inset-0" />}
            <Icon strokeWidth={2} className="relative h-[18px] w-[18px]" />
            <span className="relative">{t.nav[key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
