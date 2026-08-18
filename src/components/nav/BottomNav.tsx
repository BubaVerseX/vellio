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
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-[var(--color-border)] bg-[var(--color-bg)] pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 border-t-[3px] border-t-transparent px-2 py-2.5 transition-colors duration-150",
              active && "border-t-[var(--color-accent)]"
            )}
          >
            <Icon
              strokeWidth={active ? 2.2 : 1.8}
              className={cn(
                "h-6 w-6",
                active ? "text-[var(--color-text-primary)]" : "text-[rgba(255,255,255,0.42)]"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-bold",
                active ? "text-[var(--color-text-primary)]" : "text-[rgba(255,255,255,0.42)]"
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
