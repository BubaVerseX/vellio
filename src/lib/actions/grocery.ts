"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleGroceryItem(weekStart: string, ingredientKey: string, checked: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("grocery_list_items").upsert(
    {
      user_id: user.id,
      week_start: weekStart,
      ingredient_key: ingredientKey,
      checked,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,week_start,ingredient_key" }
  );
  if (error) return { error: error.message };

  revalidatePath("/meals/grocery");
  return { success: true };
}
