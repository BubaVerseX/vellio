"use client";

import { useLocale, format } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ImageAttribution({
  name,
  url,
  className,
}: {
  name?: string | null;
  url?: string | null;
  className?: string;
}) {
  const { t } = useLocale();
  if (!name) return null;

  const label = format(t.common.photoBy, { name });

  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block truncate text-[10px] leading-tight text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]",
        className
      )}
    >
      {label}
    </a>
  ) : (
    <span className={cn("block truncate text-[10px] leading-tight text-[var(--color-text-tertiary)]", className)}>
      {label}
    </span>
  );
}
