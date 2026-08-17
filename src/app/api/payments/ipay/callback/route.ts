import { NextResponse } from "next/server";
import { isIpayConfigured } from "@/lib/payments/ipay";

/**
 * Stub for BoG iPay's Hosted Payment Page callback. Once real credentials
 * and API docs are available, this needs to: verify the callback signature,
 * look up the order, and on a confirmed successful payment set
 * profiles.subscription_status = 'active' with subscription_started_at /
 * subscription_expires_at for that user. None of that can be built
 * correctly without iPay's actual callback contract, so this intentionally
 * stays a 501 until it's wired for real — see lib/actions/premium.ts.
 */
export async function POST() {
  if (!isIpayConfigured()) {
    return NextResponse.json({ error: "iPay not configured" }, { status: 501 });
  }
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
