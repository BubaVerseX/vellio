"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Called after a client-side upload to Supabase Storage succeeds. */
export async function savePhotoPath(date: string, photoPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("progress_logs")
    .upsert({ user_id: user.id, date, photo_path: photoPath }, { onConflict: "user_id,date" });

  if (error) return { error: error.message };
  revalidatePath("/progress");
  revalidatePath("/progress/gallery");
  return { success: true };
}

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour, generated fresh per page render

export async function getSignedPhotoUrls(paths: string[]): Promise<Map<string, string>> {
  const supabase = await createClient();
  const map = new Map<string, string>();
  if (paths.length === 0) return map;

  const { data, error } = await supabase.storage
    .from("progress-photos")
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return map;

  for (const item of data) {
    if (item.signedUrl && item.path) map.set(item.path, item.signedUrl);
  }
  return map;
}
