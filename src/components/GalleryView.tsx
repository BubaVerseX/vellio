"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select, Label } from "@/components/ui/Input";
import { BlobImage } from "@/components/ui/BlobImage";

type Photo = { date: string; url: string };

export function GalleryView({ photos }: { photos: Photo[] }) {
  const { t } = useLocale();
  const [compareMode, setCompareMode] = useState(false);
  const [beforeDate, setBeforeDate] = useState(photos[0]?.date ?? "");
  const [afterDate, setAfterDate] = useState(photos[photos.length - 1]?.date ?? "");

  const before = photos.find((p) => p.date === beforeDate);
  const after = photos.find((p) => p.date === afterDate);

  return (
    <div className="flex flex-col gap-5">
      <Button
        variant={compareMode ? "selected" : "primary"}
        onClick={() => setCompareMode((v) => !v)}
        className="w-fit"
      >
        {t.progress.compare}
      </Button>

      {compareMode ? (
        <Card className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t.progress.compareBefore}</Label>
              <Select value={beforeDate} onChange={(e) => setBeforeDate(e.target.value)}>
                {photos.map((p) => (
                  <option key={p.date} value={p.date}>
                    {p.date}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>{t.progress.compareAfter}</Label>
              <Select value={afterDate} onChange={(e) => setAfterDate(e.target.value)}>
                {photos.map((p) => (
                  <option key={p.date} value={p.date}>
                    {p.date}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {before && (
              <div className="flex flex-col items-center gap-2">
                <BlobImage src={before.url} alt={before.date} variant={1} className="h-48 w-48" />
                <span className="text-xs font-semibold text-[var(--color-text-tertiary)]">
                  {before.date}
                </span>
              </div>
            )}
            {after && (
              <div className="flex flex-col items-center gap-2">
                <BlobImage src={after.url} alt={after.date} variant={2} className="h-48 w-48" />
                <span className="text-xs font-semibold text-[var(--color-text-tertiary)]">
                  {after.date}
                </span>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo, i) => (
            <div key={photo.date} className="flex flex-col items-center gap-2">
              <BlobImage
                src={photo.url}
                alt={photo.date}
                variant={((i % 3) + 1) as 1 | 2 | 3}
                className="h-32 w-32"
              />
              <span className="text-xs font-semibold text-[var(--color-text-tertiary)]">
                {photo.date}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
