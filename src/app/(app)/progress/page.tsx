import Link from "next/link";
import { CheckCircle2, XCircle, Minus, Images, Flag, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getServerDictionary } from "@/lib/i18n/serverLocale";
import { format } from "@/lib/i18n/format";
import { isSubscriptionActive } from "@/lib/premium/access";
import type { ProjectionData } from "@/lib/ai/ensureAiPlan";
import { computeWorkoutStreak } from "@/lib/plan/streak";
import { computeCelebration } from "@/lib/plan/celebration";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressLogForm } from "@/components/ProgressLogForm";
import { MetricChartCard, type MetricSeries } from "@/components/MetricChartCard";
import { JourneyPath, type JourneyWeekStop } from "@/components/charts/JourneyPath";

const JOURNEY_DEFAULT_HORIZON_WEEKS = 8;

export default async function ProgressPage() {
  const supabase = await createClient();
  const { t } = await getServerDictionary();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("weight_kg, goal, created_at, subscription_status, subscription_expires_at")
    .eq("id", user.id)
    .single();

  const premium = isSubscriptionActive(profile);
  const { data: aiPlan } = premium
    ? await supabase.from("ai_plans").select("projection").eq("user_id", user.id).maybeSingle()
    : { data: null };
  const projection = aiPlan?.projection as unknown as ProjectionData | null;
  const projectedWeight = projection?.series.length
    ? projection.series.map(({ week, weightKg }) => {
        const d = new Date();
        d.setDate(d.getDate() + week * 7);
        return { date: d.toISOString().slice(0, 10), weight: weightKg };
      })
    : undefined;

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const [{ data: logs }, { data: measurementRows }] = await Promise.all([
    supabase
      .from("progress_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", ninetyDaysAgo.toISOString().slice(0, 10))
      .order("date", { ascending: true }),
    supabase
      .from("measurements")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", ninetyDaysAgo.toISOString().slice(0, 10))
      .order("date", { ascending: true }),
  ]);

  const weightLogs = (logs ?? []).filter((l) => l.weight_kg != null);
  const chartData = weightLogs.map((l) => ({ date: l.date, weight: Number(l.weight_kg) }));

  const metricSeries: MetricSeries = {
    weight: chartData,
    waistCm: (measurementRows ?? [])
      .filter((m) => m.waist_cm != null)
      .map((m) => ({ date: m.date, weight: Number(m.waist_cm) })),
    chestCm: (measurementRows ?? [])
      .filter((m) => m.chest_cm != null)
      .map((m) => ({ date: m.date, weight: Number(m.chest_cm) })),
    hipsCm: (measurementRows ?? [])
      .filter((m) => m.hips_cm != null)
      .map((m) => ({ date: m.date, weight: Number(m.hips_cm) })),
    armsCm: (measurementRows ?? [])
      .filter((m) => m.arms_cm != null)
      .map((m) => ({ date: m.date, weight: Number(m.arms_cm) })),
    thighsCm: (measurementRows ?? [])
      .filter((m) => m.thighs_cm != null)
      .map((m) => ({ date: m.date, weight: Number(m.thighs_cm) })),
  };

  const startingWeight = weightLogs[0]?.weight_kg ?? profile?.weight_kg ?? null;
  const currentWeight = weightLogs[weightLogs.length - 1]?.weight_kg ?? profile?.weight_kg ?? null;
  const change =
    startingWeight != null && currentWeight != null
      ? Math.round((currentWeight - startingWeight) * 10) / 10
      : null;

  const recentDays = [...(logs ?? [])].reverse().slice(0, 14);

  const todayDate = new Date().toISOString().slice(0, 10);
  const workoutStreak = computeWorkoutStreak(logs ?? [], todayDate);
  const totalWorkoutsCompleted = (logs ?? []).filter((l) => l.workout_completed).length;
  const celebration = computeCelebration({
    workoutStreak,
    totalWorkoutsCompleted,
    changeKg: change,
    goal: profile?.goal ?? null,
  });

  const horizonWeeks = premium && projection ? projection.horizonWeeks : JOURNEY_DEFAULT_HORIZON_WEEKS;
  const now = new Date();
  const accountStart = profile?.created_at ? new Date(profile.created_at) : now;
  const daysSinceStart = Math.floor((now.getTime() - accountStart.getTime()) / (1000 * 60 * 60 * 24));
  const currentWeekIndex = Math.min(Math.max(Math.floor(daysSinceStart / 7) + 1, 1), horizonWeeks);
  const journeyWeeks: JourneyWeekStop[] = Array.from({ length: horizonWeeks }, (_, i) => {
    const weekNumber = i + 1;
    return {
      index: weekNumber,
      label: format(t.progress.journeyWeekShort, { n: weekNumber }),
      status: weekNumber < currentWeekIndex ? "past" : weekNumber === currentWeekIndex ? "current" : "future",
    };
  });

  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-3xl font-extrabold tracking-tight">{t.progress.title}</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard value={startingWeight ?? "—"} label={t.progress.startingWeight} />
        <StatCard value={currentWeight ?? "—"} label={t.progress.currentWeight} accent="secondary" />
        <StatCard
          value={change != null ? `${change > 0 ? "+" : ""}${change} kg` : "—"}
          label={t.progress.change}
          accent="primary"
        />
      </div>

      {celebration && (
        <Card className="gradient-tint-primary flex items-center gap-4">
          <span className="blob-mask blob-variant-3 flex h-14 w-14 shrink-0 items-center justify-center bg-[var(--color-accent)]">
            <Trophy strokeWidth={1.8} className="h-6 w-6 text-white" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold tracking-tight">
              {celebration.type === "streak" &&
                format(t.progress.celebrationStreakHeadline, { days: celebration.days })}
              {celebration.type === "weight" &&
                format(t.progress.celebrationWeightHeadline, { kg: celebration.kg })}
              {celebration.type === "workouts" &&
                format(t.progress.celebrationWorkoutsHeadline, { count: celebration.count })}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {celebration.type === "streak" &&
                format(t.progress.celebrationStreakDetail, { days: celebration.days })}
              {celebration.type === "weight" &&
                format(t.progress.celebrationWeightDetail, {
                  start: startingWeight ?? "—",
                  current: currentWeight ?? "—",
                })}
              {celebration.type === "workouts" && t.progress.celebrationWorkoutsDetail}
            </p>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 text-lg font-extrabold tracking-tight">{t.progress.weightOverTime}</h2>
        <MetricChartCard series={metricSeries} projectedWeight={projectedWeight} />
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-extrabold tracking-tight">{t.progress.journeyTitle}</h2>
        <JourneyPath weeks={journeyWeeks} />
      </Card>

      {premium && projection && projection.milestones.length > 0 && (
        <Card className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">{t.progress.projectedTitle}</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {format(t.progress.projectedSubtitle, { weeks: projection.horizonWeeks })}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {projection.milestones.map((m, i) => (
              <div key={i} className="soft-pressed flex items-start gap-3 rounded-xl px-4 py-3">
                <Flag strokeWidth={1.8} className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent-2)]" />
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                    {m.weekLabel}
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">{m.text}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <ProgressLogForm userId={user.id} defaultWeight={currentWeight ?? undefined} />
      </Card>

      <Link href="/progress/gallery">
        <Card className="flex items-center justify-between transition-all hover:translate-y-[-1px]">
          <span className="flex items-center gap-2 text-sm font-bold">
            <Images strokeWidth={1.8} className="h-4 w-4 text-[var(--color-accent)]" />
            {t.progress.gallery}
          </span>
        </Card>
      </Link>

      <Link href="/progress/wrapped">
        <Card className="flex items-center justify-between transition-all hover:translate-y-[-1px]">
          <span className="flex items-center gap-2 text-sm font-bold">
            <Trophy strokeWidth={1.8} className="h-4 w-4 text-[var(--color-accent)]" />
            {t.progress.wrappedLink}
          </span>
        </Card>
      </Link>

      <Card>
        <h2 className="mb-4 text-lg font-extrabold tracking-tight">{t.progress.workoutLog}</h2>
        <div className="flex flex-col gap-2">
          {recentDays.length === 0 && (
            <p className="text-sm text-[var(--color-text-secondary)]">{t.progress.noData}</p>
          )}
          {recentDays.map((log) => (
            <div
              key={log.id}
              className="soft-pressed flex items-center justify-between rounded-xl px-4 py-2.5"
            >
              <span className="text-sm font-semibold">{log.date}</span>
              {log.workout_completed === true && (
                <CheckCircle2 strokeWidth={1.8} className="h-4 w-4 text-[var(--color-accent)]" />
              )}
              {log.workout_completed === false && (
                <XCircle strokeWidth={1.8} className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              )}
              {log.workout_completed == null && (
                <Minus strokeWidth={1.8} className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
