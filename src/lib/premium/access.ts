import type { Tables } from "@/lib/supabase/database.types";

type SubscriptionFields = Pick<
  Tables<"profiles">,
  "subscription_status" | "subscription_expires_at"
>;

/** True only while status is "active" AND (no expiry, or expiry hasn't passed).
 * A profile whose expiry has passed but whose status hasn't been flipped to
 * "expired" yet (e.g. the cron hasn't run) is treated as inactive here —
 * access is always computed from real time, never trusted from the stored
 * status alone. */
export function isSubscriptionActive(profile: SubscriptionFields | null | undefined): boolean {
  if (!profile || profile.subscription_status !== "active") return false;
  if (!profile.subscription_expires_at) return true;
  return new Date(profile.subscription_expires_at).getTime() > Date.now();
}
