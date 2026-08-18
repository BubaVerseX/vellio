/** Diagonal corner-ribbon for Georgian-cuisine recipe cards — a 45°-rotated
 * orange bar inside an overflow-hidden corner box, English mono label above
 * the real localized Georgian word. */
export function GeorgianRibbonBadge({ labelKa }: { labelKa: string }) {
  return (
    <div className="pointer-events-none absolute top-0 right-0 z-10 h-[126px] w-[126px] overflow-hidden select-none">
      <div className="text-mono-label absolute top-[22px] right-[-34px] flex w-[170px] rotate-45 flex-col items-center gap-0.5 bg-[var(--color-accent)] py-1.5 text-[var(--color-bg)]">
        <span className="text-[10px]">GEORGIAN</span>
        <span className="text-[10px] normal-case tracking-normal">{labelKa}</span>
      </div>
    </div>
  );
}
