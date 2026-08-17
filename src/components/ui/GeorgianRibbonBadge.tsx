/** Organic angled ribbon (not a plain rectangle, via clip-path tapering)
 * draped across a recipe card's corner for Georgian-cuisine recipes. */
export function GeorgianRibbonBadge({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute -top-1 -left-3 z-10 -rotate-[40deg] select-none">
      <span
        className="block bg-[var(--color-accent)] px-4 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase shadow-md"
        style={{ clipPath: "polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)" }}
      >
        {label}
      </span>
    </div>
  );
}
