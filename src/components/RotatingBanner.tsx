"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageAttribution } from "@/components/ui/ImageAttribution";

export type BannerSlide = {
  label: string;
  url?: string;
  attributionName?: string | null;
  attributionUrl?: string | null;
};

const ROTATE_MS = 5000;

/** Crossfades through a few training-style photos to keep the dashboard
 * feeling alive — purely decorative, so slides with no resolved photo are
 * skipped rather than showing an icon fallback. */
export function RotatingBanner({ slides }: { slides: BannerSlide[] }) {
  const available = slides.filter((s) => s.url);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (available.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % available.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [available.length]);

  if (available.length === 0) return null;
  const current = available[index];

  return (
    <div className="soft-raised flex flex-col gap-3 overflow-hidden rounded-3xl p-4">
      <div className="blob-mask blob-variant-2 relative h-40 w-full overflow-hidden md:h-56">
        {available.map((slide, i) => (
          <Image
            key={slide.label}
            src={slide.url!}
            alt=""
            fill
            sizes="(min-width: 768px) 700px, 100vw"
            loading="eager"
            className={cn(
              "object-cover transition-opacity duration-700",
              i === index ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-sm font-extrabold tracking-tight">{current.label}</span>
          <ImageAttribution name={current.attributionName} url={current.attributionUrl} />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {available.map((slide, i) => (
            <span
              key={slide.label}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-5 bg-[var(--color-accent)]" : "w-1.5 bg-[var(--color-text-tertiary)]/30"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
