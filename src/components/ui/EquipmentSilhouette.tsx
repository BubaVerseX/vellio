import { cn } from "@/lib/utils";

type EquipmentShape = "dumbbell" | "kettlebell" | "stopwatch";

/** Large flat single-color branding shapes — hero/landing screen only.
 * Built from primitives (rects, circles, ring borders, one triangle),
 * rendered behind all text at near-background value. Never use on
 * dashboard, meal, progress, grocery, or logging screens. */
export function EquipmentSilhouette({
  shape,
  className,
  rotate,
}: {
  shape: EquipmentShape;
  className?: string;
  rotate?: number;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("select-none", className)}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
      aria-hidden
      focusable="false"
    >
      {shape === "dumbbell" && (
        <g fill="var(--color-equipment)">
          <rect x="68" y="90" width="64" height="20" />
          <circle cx="42" cy="100" r="38" />
          <circle cx="158" cy="100" r="38" />
          <circle cx="42" cy="100" r="17" fill="var(--color-bg)" />
          <circle cx="158" cy="100" r="17" fill="var(--color-bg)" />
        </g>
      )}
      {shape === "kettlebell" && (
        <g fill="var(--color-equipment)">
          <circle cx="100" cy="125" r="62" />
          <path d="M68 78 a32 32 0 0 1 64 0" fill="none" stroke="var(--color-equipment)" strokeWidth="15" />
        </g>
      )}
      {shape === "stopwatch" && (
        <g fill="var(--color-equipment)">
          <polygon points="100,4 88,22 112,22" />
          <rect x="82" y="18" width="36" height="18" />
          <circle cx="100" cy="112" r="72" />
          <circle cx="100" cy="112" r="53" fill="var(--color-bg)" />
        </g>
      )}
    </svg>
  );
}
