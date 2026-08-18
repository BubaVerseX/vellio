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
    <nav className="hidden items-stretch gap-1 md:flex">
      {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 border-t-[3px] border-t-transparent px-5 py-3 text-[13px] font-bold tracking-tight transition-colors duration-150",
              active
                ? "border-t-[var(--color-accent)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            )}
          >
            <Icon strokeWidth={2} className="h-[18px] w-[18px]" />
            <span>{t.nav[key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
