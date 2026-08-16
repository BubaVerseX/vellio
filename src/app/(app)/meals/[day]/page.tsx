import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Flame, Utensils } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getServerDictionary } from "@/lib/i18n/serverLocale";
import { format } from "@/lib/i18n/format";
import { currentWeekStart } from "@/lib/plan/generatePlan";
import { getOrCreateWeekPlans } from "@/lib/plan/getWeekPlans";
import { DAYS_OF_WEEK, type DayKey } from "@/lib/plan/mealPlan";
import { getRecipesByIds, mealIdsFromDay } from "@/lib/plan/lookups";
import { localizedField } from "@/lib/plan/localized";
import { dayLabel } from "@/lib/plan/dayLabel";
import { parseIngredients } from "@/lib/plan/ingredients";
import { getFavoriteIds } from "@/lib/actions/favorites";
import { Card } from "@/components/ui/Card";
import { BlobImage } from "@/components/ui/BlobImage";
import { FavoriteButton } from "@/components/FavoriteButton";
import { MealSwapPanel } from "@/components/MealSwapPanel";
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
  const [recipeMap, favoriteIds] = await Promise.all([
    getRecipesByIds(ids),
    getFavoriteIds(user.id, "recipe"),
  ]);

  type MealEntry = {
    type: (typeof MEAL_TYPE_ORDER)[number] | "snack";
    slot: MealSlot;
    recipe: NonNullable<ReturnType<typeof recipeMap.get>>;
  };

  const mealsInOrder: MealEntry[] = [];
  for (const type of MEAL_TYPE_ORDER) {
    const id = dayPlan[type];
    const recipe = id ? recipeMap.get(id) : undefined;
    if (recipe) mealsInOrder.push({ type, slot: type, recipe });
  }
  dayPlan.snacks.forEach((id, snackIndex) => {
    const recipe = recipeMap.get(id);
    if (recipe) mealsInOrder.push({ type: "snack", slot: { snackIndex }, recipe });
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
        {mealsInOrder.map(({ type, slot, recipe }, i) => (
          <Card key={`${type}-${recipe.id}-${i}`} className="flex flex-col gap-4 sm:flex-row">
            <BlobImage
              src={recipe.image_url}
              alt={recipe.name}
              icon={Utensils}
              variant={((["breakfast", "lunch", "dinner", "snack"].indexOf(type) % 3) + 1) as 1 | 2 | 3}
              className="h-28 w-28 shrink-0 self-center sm:self-start"
            />
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
                  {recipe.calories} {t.meals.calories}
                </span>
                <span className="flex items-center gap-1">
                  <Clock strokeWidth={1.8} className="h-3.5 w-3.5" />
                  {format(t.meals.prepTime, { minutes: recipe.prep_time_minutes })}
                </span>
              </div>

              <div className="mt-2 flex gap-4 text-sm">
                <span>
                  <b>{recipe.protein_g}g</b>{" "}
                  <span className="text-[var(--color-text-tertiary)]">{t.meals.protein}</span>
                </span>
                <span>
                  <b>{recipe.carbs_g}g</b>{" "}
                  <span className="text-[var(--color-text-tertiary)]">{t.meals.carbs}</span>
                </span>
                <span>
                  <b>{recipe.fat_g}g</b>{" "}
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
                      .map((ing) => `${ing.name} (${ing.quantity} ${ing.unit})`)
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

              <div className="mt-2">
                <MealSwapPanel weekStart={weekStart} day={dayKey} slot={slot} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
