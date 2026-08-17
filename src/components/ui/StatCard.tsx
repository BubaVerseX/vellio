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
        "soft-raised relative flex flex-col gap-1 overflow-hidden rounded-2xl p-4",
        className
      )}
    >
      {accent === "primary" && (
        <div className="gradient-tint-primary pointer-events-none absolute inset-0" />
      )}
      {accent === "secondary" && (
        <div className="gradient-tint-secondary pointer-events-none absolute inset-0" />
      )}
      <span
        className={cn(
          "relative text-2xl font-extrabold tracking-tight",
          accent === "primary" && "text-[var(--color-accent)]",
          accent === "secondary" && "text-[var(--color-accent-2)]",
          accent === "none" && "text-[var(--color-text-primary)]"
        )}
      >
        {value}
      </span>
      <span className="relative text-xs font-medium text-[var(--color-text-tertiary)]">{label}</span>
    </div>
  );
}
