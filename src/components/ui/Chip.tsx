import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full px-4 py-2 text-sm font-semibold transition-all",
        selected
          ? "soft-raised text-[var(--color-accent)]"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ChipGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("soft-pressed flex flex-wrap gap-1.5 rounded-[28px] p-1.5", className)}
      {...props}
    />
  );
}
