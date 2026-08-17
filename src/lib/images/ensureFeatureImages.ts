import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { searchUnsplashImage } from "./unsplash";

export type FeatureImage = {
  url: string;
  attributionName: string;
  attributionUrl: string;
};

/**
 * Same cache-on-first-fetch pattern as ensureTemplateImages, generalized to
 * arbitrary keyed content images (landing hero, homepage rotating banner)
 * rather than workout templates specifically — reuses the same
 * `template_images` table, just with non-template keys. Public read, so
 * this also works for the anonymous landing page.
 */
export async function ensureFeatureImages(
  items: { id: string; query: string; orientation?: "squarish" | "landscape" | "portrait" }[]
): Promise<Map<string, FeatureImage>> {
  const supabase = await createClient();
  const ids = items.map((i) => i.id);
  const { data: cached } = await supabase.from("template_images").select("*").in("template_id", ids);
  const cachedById = new Map((cached ?? []).map((row) => [row.template_id, row]));

  const result = new Map<string, FeatureImage>();
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
  const missing = items.filter((i) => !cachedById.has(i.id));
  if (!admin || missing.length === 0) return result;

  await Promise.all(
    missing.map(async (item) => {
      const image = await searchUnsplashImage(item.query, {
        orientation: item.orientation ?? "landscape",
        size: "regular",
      });
      await admin.from("template_images").upsert({
        template_id: item.id,
        image_url: image?.url ?? null,
        attribution_name: image?.attributionName ?? null,
        attribution_url: image?.attributionUrl ?? null,
        fetched_at: new Date().toISOString(),
      });
      if (image) {
        result.set(item.id, {
          url: image.url,
          attributionName: image.attributionName,
          attributionUrl: image.attributionUrl,
        });
      }
    })
  );

  return result;
}
