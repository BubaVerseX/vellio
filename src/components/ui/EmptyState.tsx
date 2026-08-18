import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center border border-[var(--color-border)]">
        <Icon strokeWidth={1.8} className="h-7 w-7 text-[var(--color-accent)]" />
      </div>
      <h3 className="text-lg font-extrabold tracking-tight">{title}</h3>
      <p className="max-w-xs text-sm text-[var(--color-text-secondary)]">{description}</p>
      {action}
    </div>
  );
}
