import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "selected" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-bold tracking-tight disabled:cursor-not-allowed",
        !disabled && variant === "primary" && "soft-raised soft-raised-tappable text-[var(--color-text-primary)]",
        !disabled && variant === "selected" && "soft-pressed text-[var(--color-accent)]",
        !disabled && variant === "ghost" && "soft-flat text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
        disabled && "soft-disabled",
        className
      )}
      {...props}
    />
  );
});
