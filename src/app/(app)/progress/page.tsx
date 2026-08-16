import Link from "next/link";
import { CheckCircle2, XCircle, Minus, Images } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getServerDictionary } from "@/lib/i18n/serverLocale";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressLogForm } from "@/components/ProgressLogForm";
import { MetricChartCard, type MetricSeries } from "@/components/MetricChartCard";

export default async function ProgressPage() {
  const supabase = await createClient();
  const { t } = await getServerDictionary();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("weight_kg")
    .eq("id", user.id)
    .single();

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

      <Card>
        <h2 className="mb-4 text-lg font-extrabold tracking-tight">{t.progress.weightOverTime}</h2>
        <MetricChartCard series={metricSeries} />
      </Card>

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
