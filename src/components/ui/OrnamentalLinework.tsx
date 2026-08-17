import { cn } from "@/lib/utils";

/** Thin, low-opacity abstract lattice — loosely inspired by traditional
 * Georgian interlace line motifs, kept purely geometric (never literal or
 * costume-like). Reserved for the weekly wrapped card and the premium
 * upgrade page only — do not reuse elsewhere. Color comes from the
 * inherited `currentColor` / Tailwind text-color + opacity utility on the
 * wrapping element. */
export function OrnamentalLinework({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      aria-hidden
    >
      <defs>
        <pattern id="ornamental-lattice" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M0,30 L30,0 L60,30 L30,60 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="30" cy="30" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M0,0 L60,60 M60,0 L0,60" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="240" height="240" fill="url(#ornamental-lattice)" />
    </svg>
  );
}
