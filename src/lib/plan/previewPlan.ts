"use client";

import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

export async function fetchAllRecipes(): Promise<Tables<"recipes">[]> {
  const supabase = createClient();
  const { data } = await supabase.from("recipes").select("*");
  return data ?? [];
}

export async function fetchAllExercises(): Promise<Tables<"exercises">[]> {
  const supabase = createClient();
  const { data } = await supabase.from("exercises").select("*");
  return data ?? [];
}

/** Stable per-session id so seeded shuffles stay consistent across a preview,
 * without needing a real user id (there isn't one yet). */
export function createPreviewId(): string {
  return `preview-${crypto.randomUUID()}`;
}
