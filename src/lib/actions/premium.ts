"use server";

import { createClient } from "@/lib/supabase/server";
import { isSubscriptionActive } from "@/lib/premium/access";
import { isIpayConfigured } from "@/lib/payments/ipay";

/**
 * Entry point for the "Upgrade to Premium" button. Real BoG iPay Hosted
 * Payment Page checkout (order creation, merchant auth, redirect URL,
 * signed callback verification) isn't wired yet — that needs iPay's actual
 * API contract, which isn't available in this session. Until then this
 * always resolves to the coming-soon state so the rest of the app is never
 * blocked on it (see AGENTS.md v2.0 Phase 4).
 */
export async function initiatePremiumCheckout() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_expires_at")
    .eq("id", user.id)
    .single();
  if (isSubscriptionActive(profile)) return { alreadyActive: true };

  if (!isIpayConfigured()) return { comingSoon: true };

  // IPAY_CLIENT_ID / IPAY_SECRET_KEY are set, but the Hosted Payment Page
  // request itself still needs to be built against iPay's real contract.
  return { comingSoon: true };
}
