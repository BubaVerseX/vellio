"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function logWeight(date: string, weightKg: number) {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("progress_logs")
    .upsert({ user_id: userId, date, weight_kg: weightKg }, { onConflict: "user_id,date" });

  if (error) return { error: error.message };
  revalidatePath("/progress");
  revalidatePath("/home");
  return { success: true };
}

export async function setWorkoutCompleted(date: string, completed: boolean) {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("progress_logs")
    .upsert(
      { user_id: userId, date, workout_completed: completed },
      { onConflict: "user_id,date" }
    );

  if (error) return { error: error.message };
  revalidatePath("/progress");
  revalidatePath("/home");
  revalidatePath("/workouts");
  return { success: true };
}
