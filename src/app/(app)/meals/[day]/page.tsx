import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Flame, Utensils } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getServerDictionary } from "@/lib/i18n/serverLocale";
import { format } from "@/lib/i18n/format";
import { currentWeekStart } from "@/lib/plan/generatePlan";
import { dateForDay } from "@/lib/plan/weekDate";
import { getOrCreateWeekPlans } from "@/lib/plan/getWeekPlans";
import { DAYS_OF_WEEK, portionFor, type DayKey } from "@/lib/plan/mealPlan";
import { getRecipesByIds, mealIdsFromDay } from "@/lib/plan/lookups";
import { localizedField } from "@/lib/plan/localized";
import { dayLabel } from "@/lib/plan/dayLabel";
import { parseIngredients } from "@/lib/plan/ingredients";
import { getFavoriteIds } from "@/lib/actions/favorites";
import type { MealLogStatus } from "@/lib/actions/mealFriction";
import { Card } from "@/components/ui/Card";
import { BlobImage } from "@/components/ui/BlobImage";
import { ImageAttribution } from "@/components/ui/ImageAttribution";
import { FavoriteButton } from "@/components/FavoriteButton";
import { GeorgianRibbonBadge } from "@/components/ui/GeorgianRibbonBadge";
import { MealSwapPanel } from "@/components/MealSwapPanel";
import { MealMainSlotControls } from "@/components/MealMainSlotControls";
import type { MealSlot } from "@/lib/actions/swap";

const MEAL_TYPE_ORDER = ["breakfast", "lunch", "dinner"] as const;

export default async function MealDayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day } = await params;
  if (!DAYS_OF_WEEK.includes(day as DayKey)) notFound();
  const dayKey = day as DayKey;

  const supabase = await createClient();
  const { t, locale } = await getServerDictionary();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const weekStart = currentWeekStart();
  const { mealPlan } = await getOrCreateWeekPlans(user.id, weekStart);
  if (!mealPlan) notFound();

  const dayPlan = mealPlan.planData.days[dayKey];
  const ids = mealIdsFromDay(dayPlan);
  const date = dateForDay(weekStart, dayKey);
  const [recipeMap, favoriteIds, { data: mealLogRows }] = await Promise.all([
    getRecipesByIds(ids),
    getFavoriteIds(user.id, "recipe"),
    supabase.from("meal_logs").select("slot, status").eq("user_id", user.id).eq("date", date),
  ]);
  const logStatusBySlot = new Map(
    (mealLogRows ?? []).map((row) => [row.slot, row.status as MealLogStatus])
  );

  type MealEntry = {
    type: (typeof MEAL_TYPE_ORDER)[number] | "snack";
    slot: MealSlot;
    recipe: NonNullable<ReturnType<typeof recipeMap.get>>;
    portion: number;
  };

  const mealsInOrder: MealEntry[] = [];
  for (const type of MEAL_TYPE_ORDER) {
    const id = dayPlan[type];
    const recipe = id ? recipeMap.get(id) : undefined;
    if (recipe) mealsInOrder.push({ type, slot: type, recipe, portion: portionFor(dayPlan, type) });
  }
  dayPlan.snacks.forEach((id, snackIndex) => {
    const recipe = recipeMap.get(id);
    if (recipe) mealsInOrder.push({ type: "snack", slot: { snackIndex }, recipe, portion: 1 });
  });

  return (
    <div className="flex flex-col gap-6 py-6">
      <Link
        href="/meals"
        className="flex w-fit items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"
      >
        <ArrowLeft strokeWidth={1.8} className="h-4 w-4" />
        {t.meals.title}
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">{dayLabel(dayKey, t)}</h1>
        <div className="flex items-center gap-1 text-sm font-bold text-[var(--color-accent)]">
          <Flame strokeWidth={1.8} className="h-4 w-4" />
          {dayPlan.totalCalories} {t.meals.calories}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {mealsInOrder.map(({ type, slot, recipe, portion }, i) => (
          <Card key={`${type}-${recipe.id}-${i}`} className="flex flex-col gap-4 sm:flex-row">
            <div className="flex shrink-0 flex-col gap-1 self-center sm:self-start">
              <div className="relative">
                {recipe.cuisine === "georgian" && <GeorgianRibbonBadge label={t.meals.georgianBadge} />}
                <BlobImage
                  src={recipe.image_url}
                  alt={recipe.name}
                  icon={Utensils}
                  variant={((["breakfast", "lunch", "dinner", "snack"].indexOf(type) % 3) + 1) as 1 | 2 | 3}
                  className="h-28 w-28"
                  sizes="112px"
                />
              </div>
              <ImageAttribution
                name={recipe.image_attribution_name}
                url={recipe.image_attribution_url}
                className="w-28 text-center"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                  {t.meals[type]}
                </span>
                <FavoriteButton
                  itemType="recipe"
                  itemId={recipe.id}
                  initialFavorited={favoriteIds.has(recipe.id)}
                />
              </div>
              <h3 className="text-lg font-extrabold tracking-tight">
                {localizedField(recipe, "name", "name_ka", locale)}
              </h3>
              {recipe.description && (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {localizedField(recipe, "description", "description_ka", locale)}
                </p>
              )}

              <div className="mt-1 flex flex-wrap gap-3 text-xs text-[var(--color-text-tertiary)]">
                <span className="flex items-center gap-1">
                  <Flame strokeWidth={1.8} className="h-3.5 w-3.5" />
                  {Math.round(recipe.calories * portion)} {t.meals.calories}
                  {portion !== 1 && ` (${portion}×)`}
                </span>
                <span className="flex items-center gap-1">
                  <Clock strokeWidth={1.8} className="h-3.5 w-3.5" />
                  {format(t.meals.prepTime, { minutes: recipe.prep_time_minutes })}
                </span>
              </div>

              <div className="mt-2 flex gap-4 text-sm">
                <span>
                  <b>{Math.round(recipe.protein_g * portion)}g</b>{" "}
                  <span className="text-[var(--color-text-tertiary)]">{t.meals.protein}</span>
                </span>
                <span>
                  <b>{Math.round(recipe.carbs_g * portion)}g</b>{" "}
                  <span className="text-[var(--color-text-tertiary)]">{t.meals.carbs}</span>
                </span>
                <span>
                  <b>{Math.round(recipe.fat_g * portion)}g</b>{" "}
                  <span className="text-[var(--color-text-tertiary)]">{t.meals.fat}</span>
                </span>
              </div>

              {parseIngredients(recipe.ingredients).length > 0 && (
                <div className="mt-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                    {t.meals.ingredients}
                  </span>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {parseIngredients(recipe.ingredients)
                      .map((ing) => `${ing.name} (${Math.round(ing.quantity * portion * 100) / 100} ${ing.unit})`)
                      .join(", ")}
                  </p>
                </div>
              )}

              {recipe.instructions && (
                <div className="mt-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                    {t.meals.instructions}
                  </span>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {localizedField(recipe, "instructions", "instructions_ka", locale)}
                  </p>
                </div>
              )}

              <div className="mt-2 flex flex-col gap-2">
                <MealSwapPanel weekStart={weekStart} day={dayKey} slot={slot} />
                {typeof slot === "string" && (
                  <MealMainSlotControls
                    weekStart={weekStart}
                    day={dayKey}
                    slot={slot}
                    date={date}
                    recipeName={localizedField(recipe, "name", "name_ka", locale)}
                    currentPortion={portionFor(dayPlan, slot)}
                    initialLogStatus={logStatusBySlot.get(slot) ?? null}
                  />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
