import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export async function getRecipesByIds(ids: string[]): Promise<Map<string, Tables<"recipes">>> {
  const uniqueIds = [...new Set(ids)].filter(Boolean);
  if (uniqueIds.length === 0) return new Map();

  const supabase = await createClient();
  const { data } = await supabase.from("recipes").select("*").in("id", uniqueIds);
  return new Map((data ?? []).map((r) => [r.id, r]));
}

export async function getExercisesByIds(ids: string[]): Promise<Map<string, Tables<"exercises">>> {
  const uniqueIds = [...new Set(ids)].filter(Boolean);
  if (uniqueIds.length === 0) return new Map();

  const supabase = await createClient();
  const { data } = await supabase.from("exercises").select("*").in("id", uniqueIds);
  return new Map((data ?? []).map((e) => [e.id, e]));
}

export function mealIdsFromDay(day: {
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  snacks: string[];
}) {
  return [day.breakfast, day.lunch, day.dinner, ...day.snacks].filter((id): id is string => !!id);
}
