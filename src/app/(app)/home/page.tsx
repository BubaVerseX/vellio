import Link from "next/link";
import { Flame, UtensilsCrossed, Dumbbell, Scale } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getServerDictionary } from "@/lib/i18n/serverLocale";
import { format } from "@/lib/i18n/format";
import { currentWeekStart, dayKeyForDate } from "@/lib/plan/generatePlan";
import { getOrCreateWeekPlans } from "@/lib/plan/getWeekPlans";
import { getRecipesByIds, getExercisesByIds, mealIdsFromDay } from "@/lib/plan/lookups";
import { localizedField } from "@/lib/plan/localized";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";

export default async function HomePage() {
  const supabase = await createClient();
  const { t, locale } = await getServerDictionary();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const weekStart = currentWeekStart();
  const todayKey = dayKeyForDate();
  const { mealPlan, workoutPlan } = await getOrCreateWeekPlans(user.id, weekStart);

  const todayMeals = mealPlan?.planData.days[todayKey];
  const todayWorkout = workoutPlan?.planData.days[todayKey];

  const recipeMap = await getRecipesByIds(todayMeals ? mealIdsFromDay(todayMeals) : []);
  const exerciseIds =
    todayWorkout?.type === "workout" ? todayWorkout.exercises.map((e) => e.exerciseId) : [];
  const exerciseMap = await getExercisesByIds(exerciseIds);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: recentLogs } = await supabase
    .from("progress_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", sevenDaysAgo.toISOString().slice(0, 10))
    .order("date", { ascending: true });

  const workoutsCompleted = (recentLogs ?? []).filter((l) => l.workout_completed).length;
  const latestWeight = [...(recentLogs ?? [])].reverse().find((l) => l.weight_kg != null)?.weight_kg;

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {format(t.home.greeting, { name: profile?.full_name?.split(" ")[0] ?? "" })}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          value={mealPlan?.calorieTarget ?? "—"}
          label={t.home.calorieTarget}
          accent="primary"
        />
        <StatCard
          value={latestWeight ?? (profile?.weight_kg ?? "—")}
          label={t.progress.currentWeight}
          accent="secondary"
        />
        <StatCard value={workoutsCompleted} label={t.progress.workoutsThisWeek} />
        <StatCard value={profile?.goal ? t.onboarding[goalLabelKey(profile.goal)] : "—"} label={t.onboarding.goal} />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <UtensilsCrossed strokeWidth={1.8} className="h-5 w-5 text-[var(--color-accent)]" />
            {t.home.todaysMeals}
          </h2>
          <Link href="/meals" className="text-sm font-semibold text-[var(--color-accent)]">
            {t.home.viewMealPlan}
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {todayMeals && mealIdsFromDay(todayMeals).length > 0 ? (
            mealIdsFromDay(todayMeals).map((id) => {
              const recipe = recipeMap.get(id);
              if (!recipe) return null;
              return (
                <div key={id} className="soft-pressed flex items-center justify-between rounded-xl px-4 py-3">
                  <span className="text-sm font-semibold">
                    {localizedField(recipe, "name", "name_ka", locale)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                    <Flame strokeWidth={1.8} className="h-3.5 w-3.5" />
                    {recipe.calories} {t.meals.calories}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-[var(--color-text-secondary)]">{t.meals.emptyBody}</p>
          )}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <Dumbbell strokeWidth={1.8} className="h-5 w-5 text-[var(--color-accent-2)]" />
            {t.home.todaysWorkout}
          </h2>
          <Link href="/workouts" className="text-sm font-semibold text-[var(--color-accent)]">
            {t.home.viewWorkoutPlan}
          </Link>
        </div>
        {todayWorkout?.type === "workout" ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-[var(--color-accent-2)]">
              {t.workouts.muscleGroups[todayWorkout.focus as keyof typeof t.workouts.muscleGroups] ??
                todayWorkout.focus}
            </span>
            {todayWorkout.exercises.map((ex) => {
              const exercise = exerciseMap.get(ex.exerciseId);
              if (!exercise) return null;
              return (
                <div key={ex.exerciseId} className="soft-pressed flex items-center justify-between rounded-xl px-4 py-3">
                  <span className="text-sm font-semibold">
                    {localizedField(exercise, "name", "name_ka", locale)}
                  </span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {ex.sets} {t.workouts.sets} × {ex.reps}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)]">{t.workouts.restDayBody}</p>
        )}
      </Card>

      <Link href="/progress">
        <Button variant="ghost" className="flex w-full items-center justify-center gap-2 !py-4">
          <Scale strokeWidth={1.8} className="h-4 w-4" />
          {t.home.logWeight}
        </Button>
      </Link>
    </div>
  );
}

function goalLabelKey(goal: string): "goalLose" | "goalGain" | "goalMaintain" | "goalMuscle" {
  if (goal === "lose_weight") return "goalLose";
  if (goal === "gain_weight") return "goalGain";
  if (goal === "build_muscle") return "goalMuscle";
  return "goalMaintain";
}
