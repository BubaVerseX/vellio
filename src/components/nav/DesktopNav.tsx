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
    <nav className="soft-raised hidden items-center gap-1 rounded-full p-1.5 md:flex">
      {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
              active
                ? "soft-pressed text-[var(--color-accent)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <Icon strokeWidth={1.8} className="h-4 w-4" />
            {t.nav[key]}
          </Link>
        );
      })}
    </nav>
  );
}
