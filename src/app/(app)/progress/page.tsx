import { CheckCircle2, XCircle, Minus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getServerDictionary } from "@/lib/i18n/serverLocale";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WeightChart } from "@/components/charts/WeightChart";
import { WeightLogForm } from "@/components/WeightLogForm";

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

  const { data: logs } = await supabase
    .from("progress_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", ninetyDaysAgo.toISOString().slice(0, 10))
    .order("date", { ascending: true });

  const weightLogs = (logs ?? []).filter((l) => l.weight_kg != null);
  const chartData = weightLogs.map((l) => ({ date: l.date, weight: Number(l.weight_kg) }));

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
        {chartData.length > 0 ? (
          <WeightChart data={chartData} />
        ) : (
          <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
            {t.progress.noData}
          </p>
        )}
      </Card>

      <Card>
        <WeightLogForm defaultWeight={currentWeight ?? undefined} />
      </Card>

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
