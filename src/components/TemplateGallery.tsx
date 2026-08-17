"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { useLocale, format } from "@/lib/i18n";
import { WORKOUT_TEMPLATES } from "@/lib/content/workoutTemplates";
import { recommendPersonalizedWorkout, applyWorkoutTemplate } from "@/lib/actions/workoutTemplates";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BlobImage } from "@/components/ui/BlobImage";
import { ImageAttribution } from "@/components/ui/ImageAttribution";
import { cn } from "@/lib/utils";
import type { TemplateImage } from "@/lib/images/ensureTemplateImages";

export function TemplateGallery({
  userEquipment,
  templateImages,
}: {
  userEquipment: string | null;
  templateImages?: Record<string, TemplateImage>;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [recommending, setRecommending] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  async function handleRecommend() {
    setRecommending(true);
    const result = await recommendPersonalizedWorkout();
    setRecommending(false);
    if (!result.error) {
      router.push("/workouts");
      router.refresh();
    }
  }

  async function handleUseTemplate(id: string) {
    setApplyingId(id);
    const result = await applyWorkoutTemplate(id);
    setApplyingId(null);
    if (!result.error) {
      setAppliedId(id);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="flex flex-col items-center gap-3 text-center">
          <div className="soft-pressed flex h-14 w-14 items-center justify-center rounded-2xl">
            <Sparkles strokeWidth={1.8} className="h-6 w-6 text-[var(--color-accent)]" />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">{t.templates.subtitle}</p>
          <Button onClick={handleRecommend} disabled={recommending} className="w-full">
            {recommending ? t.templates.recommending : t.templates.recommendForMe}
          </Button>
        </Card>

        <a href="#template-grid" className="block">
          <Card className="flex h-full flex-col items-center justify-center gap-3 text-center transition-all hover:translate-y-[-1px]">
            <span className="text-sm font-bold">{t.templates.browseAll}</span>
          </Card>
        </a>
      </div>

      <div id="template-grid" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WORKOUT_TEMPLATES.map((template, i) => {
          const Icon = template.icon;
          const matches = userEquipment === "both" || template.equipment === "both" || userEquipment === template.equipment;
          const isApplying = applyingId === template.id;
          const isApplied = appliedId === template.id;

          const image = templateImages?.[template.id];

          return (
            <Card key={template.id} className="flex flex-col gap-3">
              <div className="flex flex-col items-center gap-1">
                <BlobImage
                  src={image?.url}
                  alt=""
                  icon={Icon}
                  variant={((i % 3) + 1) as 1 | 2 | 3}
                  className="h-20 w-20"
                  sizes="80px"
                />
                <ImageAttribution name={image?.attributionName} url={image?.attributionUrl} />
              </div>
              <h3 className="text-center text-base font-extrabold tracking-tight">
                {t.templates.items[template.id as keyof typeof t.templates.items]}
              </h3>

              <div className="flex items-center justify-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                <span className="flex items-center gap-1">
                  <Calendar strokeWidth={1.8} className="h-3.5 w-3.5" />
                  {format(t.templates.sessionsPerWeek, { count: template.sessionsPerWeek })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock strokeWidth={1.8} className="h-3.5 w-3.5" />
                  {format(t.templates.minutesPerSession, { count: template.minutesPerSession })}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="soft-pressed rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-[var(--color-text-tertiary)]">
                  {t.templates.difficulty[template.difficulty]}
                </span>
                {matches && (
                  <span className="soft-pressed rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-[var(--color-accent)]">
                    {t.templates.matchesSetup}
                  </span>
                )}
              </div>

              <Button
                variant={isApplied ? "selected" : "primary"}
                onClick={() => handleUseTemplate(template.id)}
                disabled={isApplying}
                className={cn("mt-1 flex items-center justify-center gap-2 !py-2.5 text-sm")}
              >
                {isApplied && <CheckCircle2 strokeWidth={1.8} className="h-4 w-4" />}
                {isApplying ? t.templates.applying : isApplied ? t.templates.applied : t.templates.useTemplate}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
