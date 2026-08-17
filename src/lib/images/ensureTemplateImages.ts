import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { searchUnsplashImage } from "./unsplash";
import { WORKOUT_TEMPLATES } from "@/lib/content/workoutTemplates";

export type TemplateImage = {
  url: string;
  attributionName: string;
  attributionUrl: string;
};

/**
 * Workout templates are static content (not a DB table), so their resolved
 * Unsplash photos are cached in `template_images`, keyed by template id.
 * Same first-fetch-then-cache behavior as recipes/exercises.
 */
export async function getTemplateImages(): Promise<Map<string, TemplateImage>> {
  const supabase = await createClient();
  const { data: cached } = await supabase.from("template_images").select("*");
  const cachedById = new Map((cached ?? []).map((row) => [row.template_id, row]));

  const result = new Map<string, TemplateImage>();
  for (const row of cached ?? []) {
    if (row.image_url) {
      result.set(row.template_id, {
        url: row.image_url,
        attributionName: row.attribution_name ?? "Unsplash",
        attributionUrl: row.attribution_url ?? "https://unsplash.com",
      });
    }
  }

  if (!process.env.UNSPLASH_ACCESS_KEY) return result;
  const admin = createAdminClient();
  const missing = WORKOUT_TEMPLATES.filter((tpl) => !cachedById.has(tpl.id));
  if (!admin || missing.length === 0) return result;

  await Promise.all(
    missing.map(async (tpl) => {
      const query = `${tpl.id.replace(/_/g, " ")} workout fitness`;
      const image = await searchUnsplashImage(query);
      await admin.from("template_images").upsert({
        template_id: tpl.id,
        image_url: image?.url ?? null,
        attribution_name: image?.attributionName ?? null,
        attribution_url: image?.attributionUrl ?? null,
        fetched_at: new Date().toISOString(),
      });
      if (image) {
        result.set(tpl.id, {
          url: image.url,
          attributionName: image.attributionName,
          attributionUrl: image.attributionUrl,
        });
      }
    })
  );

  return result;
}
