"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReminderSchedule = {
  days: string[]; // "mon" | "tue" | ...
  time: string; // "HH:MM"
  timezone: string;
};

export async function upsertReminder(
  reminderId: string | null,
  type: "meal" | "workout",
  schedule: ReminderSchedule,
  enabled: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (reminderId) {
    const { error } = await supabase
      .from("reminders")
      .update({ schedule, enabled })
      .eq("id", reminderId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("reminders")
      .insert({ user_id: user.id, type, schedule, enabled });
    if (error) return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}
