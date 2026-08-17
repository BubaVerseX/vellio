import { createClient } from "@/lib/supabase/server";
import { isSubscriptionActive } from "./access";

/** Server-action gate: fetches the caller's own subscription status and
 * returns whether it's currently active. Used at the data-access layer
 * (not just the UI) to block persistence of plans/progress for free users —
 * see AGENTS.md v2.0 spec. */
export async function requireActivePremium(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_expires_at")
    .eq("id", userId)
    .single();
  return isSubscriptionActive(profile);
}
