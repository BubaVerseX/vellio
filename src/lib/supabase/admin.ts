import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Service-role client for backend-only jobs (cron reminders) that need to read
 * across users, bypassing RLS. Requires SUPABASE_SERVICE_ROLE_KEY, which is not
 * fetchable via the Supabase MCP tooling for security reasons — add it manually
 * from the Supabase dashboard (Project Settings → API) as a Vercel env var.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
