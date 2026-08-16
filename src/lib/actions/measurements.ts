"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MeasurementsInput = {
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
  armsCm?: number;
  thighsCm?: number;
};

export async function logMeasurements(date: string, input: MeasurementsInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("measurements").upsert(
    {
      user_id: user.id,
      date,
      waist_cm: input.waistCm ?? null,
      chest_cm: input.chestCm ?? null,
      hips_cm: input.hipsCm ?? null,
      arms_cm: input.armsCm ?? null,
      thighs_cm: input.thighsCm ?? null,
    },
    { onConflict: "user_id,date" }
  );

  if (error) return { error: error.message };
  revalidatePath("/progress");
  return { success: true };
}
