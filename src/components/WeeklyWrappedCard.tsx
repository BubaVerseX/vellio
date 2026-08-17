"use client";

import { Download } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { format } from "@/lib/i18n/format";
import { OrnamentalLinework } from "@/components/ui/OrnamentalLinework";
import { caloriesToKhinkali, estimateWorkoutCalories } from "@/lib/plan/culturalUnits";

const ESTIMATED_CALORIES_PER_WORKOUT = estimateWorkoutCalories(45);

function drawWrappedCard(
  canvas: HTMLCanvasElement,
  data: {
    appName: string;
    workoutsThisWeek: number;
    mealsOnTargetPercent: number | null;
    streak: number;
    workoutsLabel: string;
    mealsLabel: string;
    streakLabel: string;
    khinkaliLabel: string;
  }
) {
  const width = 800;
  const height = 1000;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#12161c");
  bg.addColorStop(1, "#1c232c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let x = -height; x < width + height; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + height, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + height, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 32px -apple-system, sans-serif";
  ctx.fillText(data.appName, 64, 96);

  ctx.fillStyle = "#ff5722";
  ctx.font = "800 160px -apple-system, sans-serif";
  ctx.fillText(`${data.workoutsThisWeek}/7`, 64, 380);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "600 26px -apple-system, sans-serif";
  ctx.fillText(data.workoutsLabel, 64, 430);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "600 20px -apple-system, sans-serif";
  ctx.fillText(data.khinkaliLabel, 64, 466);

  const statY = 620;
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 56px -apple-system, sans-serif";
  ctx.fillText(data.mealsOnTargetPercent != null ? `${data.mealsOnTargetPercent}%` : "—", 64, statY);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "600 22px -apple-system, sans-serif";
  ctx.fillText(data.mealsLabel, 64, statY + 36);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 56px -apple-system, sans-serif";
  ctx.fillText(`${data.streak}`, 420, statY);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "600 22px -apple-system, sans-serif";
  ctx.fillText(data.streakLabel, 420, statY + 36);
}

export function WeeklyWrappedCard({
  workoutsThisWeek,
  mealsOnTargetPercent,
  streak,
}: {
  workoutsThisWeek: number;
  mealsOnTargetPercent: number | null;
  streak: number;
}) {
  const { t } = useLocale();
  const khinkaliCount = caloriesToKhinkali(workoutsThisWeek * ESTIMATED_CALORIES_PER_WORKOUT);
  const khinkaliLabel = format(t.common.khinkaliBurned, { count: khinkaliCount });

  function handleDownload() {
    const canvas = document.createElement("canvas");
    drawWrappedCard(canvas, {
      appName: t.common.appName,
      workoutsThisWeek,
      mealsOnTargetPercent,
      streak,
      workoutsLabel: t.progress.wrappedWorkouts,
      mealsLabel: t.progress.wrappedMealsOnTarget,
      streakLabel: format(t.home.streakDays, { count: streak }),
      khinkaliLabel,
    });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vellio-weekly-wrapped.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#12161c] p-6 text-white shadow-[0_20px_44px_rgba(0,0,0,0.28)]">
      <OrnamentalLinework className="text-white opacity-[0.06]" />
      <div className="relative flex flex-col gap-6">
        <span className="text-sm font-extrabold tracking-tight text-white/80">{t.common.appName}</span>

        <div>
          <div className="text-6xl font-extrabold tracking-tight text-[var(--color-accent)]">
            {workoutsThisWeek}/7
          </div>
          <div className="mt-1 text-sm font-semibold text-white/70">{t.progress.wrappedWorkouts}</div>
          <div className="mt-1 text-xs text-white/45">{khinkaliLabel}</div>
        </div>

        <div className="flex gap-8">
          <div>
            <div className="text-3xl font-extrabold tracking-tight">
              {mealsOnTargetPercent != null ? `${mealsOnTargetPercent}%` : "—"}
            </div>
            <div className="text-xs font-semibold text-white/60">{t.progress.wrappedMealsOnTarget}</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">{streak}</div>
            <div className="text-xs font-semibold text-white/60">{t.progress.wrappedStreak}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/15"
        >
          <Download strokeWidth={1.8} className="h-4 w-4" />
          {t.progress.wrappedDownload}
        </button>
      </div>
    </div>
  );
}
