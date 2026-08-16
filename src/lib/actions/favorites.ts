"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FavoriteItemType = "recipe" | "exercise";

export async function toggleFavorite(itemType: FavoriteItemType, itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
    if (error) return { error: error.message };
    revalidatePath("/meals", "layout");
    revalidatePath("/workouts", "layout");
    return { success: true, favorited: false };
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, item_type: itemType, item_id: itemId });
  if (error) return { error: error.message };

  revalidatePath("/meals", "layout");
  revalidatePath("/workouts", "layout");
  return { success: true, favorited: true };
}

export async function getFavoriteIds(
  userId: string,
  itemType: FavoriteItemType
): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("item_id")
    .eq("user_id", userId)
    .eq("item_type", itemType);

  return new Set((data ?? []).map((row) => row.item_id));
}
