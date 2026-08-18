import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string | number;
  label: string;
  accent?: "primary" | "secondary" | "none";
  className?: string;
}

export function StatCard({ value, label, accent = "none", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border border-[var(--color-border)] bg-[var(--color-surface)] p-4",
        accent === "primary" && "border-l-[3px] border-l-[var(--color-accent)]",
        accent === "secondary" && "border-l-[3px] border-l-[var(--color-accent-2)]",
        className
      )}
    >
      <span
        className={cn(
          "text-display text-2xl",
          accent === "primary" && "text-[var(--color-accent)]",
          accent === "secondary" && "text-[var(--color-accent-2)]",
          accent === "none" && "text-[var(--color-text-primary)]"
        )}
      >
        {value}
      </span>
      <span className="text-mono-label text-[9px] text-[var(--color-text-tertiary)]">{label}</span>
    </div>
  );
}
