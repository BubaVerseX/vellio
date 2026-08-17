import { createAdminClient } from "@/lib/supabase/admin";
import { searchUnsplashImage } from "./unsplash";
import type { Tables } from "@/lib/supabase/database.types";

interface ImageableRow {
  id: string;
  image_url: string | null;
  image_attribution_name: string | null;
  image_attribution_url: string | null;
  image_fetched_at: string | null;
}

type ImagePatch = Pick<
  ImageableRow,
  "image_url" | "image_attribution_name" | "image_attribution_url" | "image_fetched_at"
>;

async function resolvePatch(query: string): Promise<ImagePatch> {
  const image = await searchUnsplashImage(query);
  return image
    ? {
        image_url: image.url,
        image_attribution_name: image.attributionName,
        image_attribution_url: image.attributionUrl,
        image_fetched_at: new Date().toISOString(),
      }
    : { image_url: null, image_attribution_name: null, image_attribution_url: null, image_fetched_at: new Date().toISOString() };
}

/**
 * Fetches + caches an Unsplash photo for any row missing one, keyed by
 * `queryFor(row)`. Rows that already have an image_url, or that we've
 * already tried and failed to find a photo for (image_fetched_at set),
 * are left alone — this keeps us within Unsplash's hourly rate limit and
 * avoids re-querying on every page load. Without SUPABASE_SERVICE_ROLE_KEY
 * configured (no admin client) or UNSPLASH_ACCESS_KEY set, this is a no-op
 * and rows fall through to the icon fallback.
 */
export async function ensureRecipeImages(
  recipes: Tables<"recipes">[]
): Promise<Tables<"recipes">[]> {
  if (!process.env.UNSPLASH_ACCESS_KEY) return recipes;
  const admin = createAdminClient();
  const needsFetch = recipes.filter((r) => !r.image_url && !r.image_fetched_at);
  if (!admin || needsFetch.length === 0) return recipes;

  const patches = new Map<string, ImagePatch>();
  await Promise.all(
    needsFetch.map(async (recipe) => {
      const patch = await resolvePatch(`${recipe.name} ${recipe.meal_type} food`);
      patches.set(recipe.id, patch);
      await admin.from("recipes").update(patch).eq("id", recipe.id);
    })
  );

  return recipes.map((r) => (patches.has(r.id) ? { ...r, ...patches.get(r.id)! } : r));
}

export async function ensureExerciseImages(
  exercises: Tables<"exercises">[]
): Promise<Tables<"exercises">[]> {
  if (!process.env.UNSPLASH_ACCESS_KEY) return exercises;
  const admin = createAdminClient();
  const needsFetch = exercises.filter((e) => !e.image_url && !e.image_fetched_at);
  if (!admin || needsFetch.length === 0) return exercises;

  const patches = new Map<string, ImagePatch>();
  await Promise.all(
    needsFetch.map(async (exercise) => {
      const patch = await resolvePatch(`${exercise.name} ${exercise.muscle_group} exercise`);
      patches.set(exercise.id, patch);
      await admin.from("exercises").update(patch).eq("id", exercise.id);
    })
  );

  return exercises.map((e) => (patches.has(e.id) ? { ...e, ...patches.get(e.id)! } : e));
}
