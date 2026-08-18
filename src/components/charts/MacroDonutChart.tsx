import type { ReactNode } from "react";

/** 132px conic-gradient macro ring — the circle is one of the system's
 * only two radius exceptions (with the streak pill). Center hole shows
 * real data passed in via children (e.g. the real calorie target). */
export function MacroDonutChart({
  proteinG,
  carbsG,
  fatG,
  children,
}: {
  proteinG: number;
  carbsG: number;
  fatG: number;
  children?: ReactNode;
}) {
  const total = proteinG + carbsG + fatG || 1;
  const proteinEnd = (proteinG / total) * 100;
  const carbsEnd = proteinEnd + (carbsG / total) * 100;
  const gradient = `conic-gradient(var(--color-accent) 0% ${proteinEnd}%, var(--color-accent-2) ${proteinEnd}% ${carbsEnd}%, var(--color-neutral-3) ${carbsEnd}% 100%)`;

  return (
    <div className="relative h-[132px] w-[132px] shrink-0 rounded-full" style={{ background: gradient }}>
      <div className="absolute inset-[24px] flex flex-col items-center justify-center rounded-full bg-[var(--color-surface)]">
        {children}
      </div>
    </div>
  );
}
