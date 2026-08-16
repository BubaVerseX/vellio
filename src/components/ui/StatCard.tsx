import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string | number;
  label: string;
  accent?: "primary" | "secondary" | "none";
  className?: string;
}

export function StatCard({ value, label, accent = "none", className }: StatCardProps) {
  return (
    <div className={cn("soft-raised flex flex-col gap-1 rounded-2xl p-4", className)}>
      <span
        className={cn(
          "text-2xl font-extrabold tracking-tight",
          accent === "primary" && "text-[var(--color-accent)]",
          accent === "secondary" && "text-[var(--color-accent-2)]",
          accent === "none" && "text-[var(--color-text-primary)]"
        )}
      >
        {value}
      </span>
      <span className="text-xs font-medium text-[var(--color-text-tertiary)]">{label}</span>
    </div>
  );
}
