import Link from "next/link";
import { Flame, UtensilsCrossed, Dumbbell, Scale, Utensils } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getServerDictionary } from "@/lib/i18n/serverLocale";
import { format } from "@/lib/i18n/format";
import { currentWeekStart, dayKeyForDate } from "@/lib/plan/generatePlan";
import { getOrCreateWeekPlans } from "@/lib/plan/getWeekPlans";
import { getRecipesByIds, getExercisesByIds, mealIdsFromDay } from "@/lib/plan/lookups";
import { portionFor } from "@/lib/plan/mealPlan";
import { localizedField } from "@/lib/plan/localized";
import { computeWorkoutStreak } from "@/lib/plan/streak";
import { caloriesToKhinkali, estimateWorkoutCalories } from "@/lib/plan/culturalUnits";
import type { MealLogStatus } from "@/lib/actions/mealFriction";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { BlobImage } from "@/components/ui/BlobImage";
import { ImageAttribution } from "@/components/ui/ImageAttribution";
import { FreePreviewBanner } from "@/components/FreePreviewBanner";
import { QuickMealLogToggle } from "@/components/QuickMealLogToggle";
import { WorkoutCompleteButton } from "@/components/WorkoutCompleteButton";
import { RotatingBanner } from "@/components/RotatingBanner";
import { MacroDonutChart } from "@/components/charts/MacroDonutChart";
import { ensureFeatureImages } from "@/lib/images/ensureFeatureImages";

const MAIN_SLOTS = ["breakfast", "lunch", "dinner"] as const;

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
  const { mealPlan, workoutPlan, isEphemeral } = await getOrCreateWeekPlans(user.id, weekStart);

  const todayMeals = mealPlan?.planData.days[todayKey];
  const todayWorkout = workoutPlan?.planData.days[todayKey];

  const recipeMap = await getRecipesByIds(todayMeals ? mealIdsFromDay(todayMeals) : []);
  const exerciseIds =
    todayWorkout?.type === "workout" ? todayWorkout.exercises.map((e) => e.exerciseId) : [];
  const exerciseMap = await getExercisesByIds(exerciseIds);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const streakWindowStart = new Date();
  streakWindowStart.setDate(streakWindowStart.getDate() - 60);
  const { data: recentLogs } = await supabase
    .from("progress_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", streakWindowStart.toISOString().slice(0, 10))
    .order("date", { ascending: true });

  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);
  const workoutsCompleted = (recentLogs ?? []).filter(
    (l) => l.workout_completed && l.date >= sevenDaysAgoStr
  ).length;
  const latestWeight = [...(recentLogs ?? [])].reverse().find((l) => l.weight_kg != null)?.weight_kg;

  const todayDate = new Date().toISOString().slice(0, 10);
  const workoutStreak = computeWorkoutStreak(recentLogs ?? [], todayDate);
  const todayProgressLog = (recentLogs ?? []).find((l) => l.date === todayDate);
  const { data: todayMealLogs } = await supabase
    .from("meal_logs")
    .select("slot, status")
    .eq("user_id", user.id)
    .eq("date", todayDate);
  const mealLogBySlot = new Map(
    (todayMealLogs ?? []).map((row) => [row.slot, row.status as MealLogStatus])
  );

  const bannerImages = await ensureFeatureImages([
    { id: "banner_strength", query: "strength training weightlifting" },
    { id: "banner_cardio", query: "cardio running fitness" },
    { id: "banner_home", query: "home workout bodyweight exercise" },
    { id: "banner_outdoor", query: "outdoor training athlete" },
  ]);
  const bannerSlides = [
    { id: "banner_strength", label: t.home.trainStrength },
    { id: "banner_cardio", label: t.home.trainCardio },
    { id: "banner_home", label: t.home.trainHome },
    { id: "banner_outdoor", label: t.home.trainOutdoor },
  ].map(({ id, label }) => {
    const img = bannerImages.get(id);
    return { label, url: img?.url, attributionName: img?.attributionName, attributionUrl: img?.attributionUrl };
  });

  const featuredExercise =
    todayWorkout?.type === "workout" && todayWorkout.exercises.length > 0
      ? exerciseMap.get(todayWorkout.exercises[0].exerciseId)
      : undefined;

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {format(t.home.greeting, { name: profile?.full_name?.split(" ")[0] ?? "" })}
        </h1>
      </div>

      {isEphemeral && <FreePreviewBanner />}

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

      <RotatingBanner slides={bannerSlides} />

      {mealPlan && (
        <Card className="flex items-center gap-5">
          <MacroDonutChart
            proteinG={mealPlan.macros.proteinG}
            carbsG={mealPlan.macros.carbsG}
            fatG={mealPlan.macros.fatG}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h2 className="text-lg font-extrabold tracking-tight">{t.home.macros}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff5722]" />
                <b>{mealPlan.macros.proteinG}g</b>
                <span className="text-[var(--color-text-tertiary)]">{t.meals.protein}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#0d6efd]" />
                <b>{mealPlan.macros.carbsG}g</b>
                <span className="text-[var(--color-text-tertiary)]">{t.meals.carbs}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#ffb020]" />
                <b>{mealPlan.macros.fatG}g</b>
                <span className="text-[var(--color-text-tertiary)]">{t.meals.fat}</span>
              </span>
            </div>
          </div>
        </Card>
      )}

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
            <>
              {MAIN_SLOTS.map((slot) => {
                const id = todayMeals[slot];
                const recipe = id ? recipeMap.get(id) : undefined;
                if (!recipe) return null;
                const displayCalories = Math.round(recipe.calories * portionFor(todayMeals, slot));
                return (
                  <div key={slot} className="soft-pressed flex items-center justify-between gap-2 rounded-xl px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <BlobImage
                        src={recipe.image_url}
                        alt={recipe.name}
                        icon={Utensils}
                        variant={1}
                        className="h-10 w-10 shrink-0"
                        sizes="40px"
                      />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold uppercase text-[var(--color-text-tertiary)]">
                          {t.meals[slot]}
                        </span>
                        <span className="block truncate text-sm font-semibold">
                          {localizedField(recipe, "name", "name_ka", locale)}
                        </span>
                        <ImageAttribution
                          name={recipe.image_attribution_name}
                          url={recipe.image_attribution_url}
                        />
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                        <Flame strokeWidth={1.8} className="h-3.5 w-3.5" />
                        {displayCalories}
                      </span>
                      <QuickMealLogToggle
                        date={todayDate}
                        slot={slot}
                        initialStatus={mealLogBySlot.get(slot) ?? null}
                      />
                    </div>
                  </div>
                );
              })}
              {todayMeals.snacks.map((id) => {
                const recipe = recipeMap.get(id);
                if (!recipe) return null;
                return (
                  <div key={id} className="soft-pressed flex items-center justify-between rounded-xl px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <BlobImage
                        src={recipe.image_url}
                        alt={recipe.name}
                        icon={Utensils}
                        variant={2}
                        className="h-10 w-10 shrink-0"
                        sizes="40px"
                      />
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {localizedField(recipe, "name", "name_ka", locale)}
                        </span>
                        <ImageAttribution
                          name={recipe.image_attribution_name}
                          url={recipe.image_attribution_url}
                        />
                      </div>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                      <Flame strokeWidth={1.8} className="h-3.5 w-3.5" />
                      {recipe.calories} {t.meals.calories}
                    </span>
                  </div>
                );
              })}
            </>
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
          <div className="flex flex-col gap-3">
            <div className="gradient-tint-secondary relative flex items-center gap-4 overflow-hidden rounded-2xl p-3">
              {workoutStreak > 0 && (
                <span className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-[var(--color-text-primary)] px-2.5 py-1 text-[11px] font-extrabold text-white">
                  <Flame strokeWidth={2} className="h-3 w-3" />
                  {format(t.home.streakDays, { count: workoutStreak })}
                </span>
              )}
              <BlobImage
                src={featuredExercise?.image_url}
                alt={featuredExercise?.name ?? ""}
                icon={Dumbbell}
                variant={3}
                className="h-24 w-24 shrink-0"
                sizes="96px"
              />
              <div className="min-w-0">
                <span className="block text-lg font-extrabold tracking-tight">
                  {t.workouts.muscleGroups[todayWorkout.focus as keyof typeof t.workouts.muscleGroups] ??
                    todayWorkout.focus}
                </span>
                {featuredExercise && (
                  <span className="block truncate text-sm font-semibold text-[var(--color-text-secondary)]">
                    {localizedField(featuredExercise, "name", "name_ka", locale)}
                  </span>
                )}
                <span className="block text-xs text-[var(--color-text-tertiary)]">
                  {format(t.home.featuredExercises, { count: todayWorkout.exercises.length })}
                  {" · "}
                  {format(t.home.approxDuration, { minutes: profile?.time_available_minutes ?? 30 })}
                </span>
                <span className="block text-[11px] text-[var(--color-text-tertiary)]">
                  {format(t.common.khinkaliBurned, {
                    count: caloriesToKhinkali(estimateWorkoutCalories(profile?.time_available_minutes ?? 30)),
                  })}
                </span>
              </div>
            </div>
            {todayWorkout.exercises.map((ex) => {
              const exercise = exerciseMap.get(ex.exerciseId);
              if (!exercise) return null;
              return (
                <div key={ex.exerciseId} className="soft-pressed flex items-center justify-between rounded-xl px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <BlobImage
                      src={exercise.image_url}
                      alt={exercise.name}
                      icon={Dumbbell}
                      variant={3}
                      className="h-10 w-10 shrink-0"
                      sizes="40px"
                    />
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {localizedField(exercise, "name", "name_ka", locale)}
                      </span>
                      <ImageAttribution
                        name={exercise.image_attribution_name}
                        url={exercise.image_attribution_url}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--color-text-tertiary)]">
                    {ex.sets} {t.workouts.sets} × {ex.reps}
                  </span>
                </div>
              );
            })}
            <div className="mt-1">
              <WorkoutCompleteButton
                date={todayDate}
                initialCompleted={!!todayProgressLog?.workout_completed}
              />
            </div>
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
