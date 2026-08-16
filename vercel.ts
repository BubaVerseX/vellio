import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  // Vercel Hobby plan allows cron jobs to run at most once/day. This checks
  // all enabled reminders once daily; upgrade to Pro and tighten this to
  // "*/15 * * * *" for reminders that fire close to each user's chosen time.
  crons: [{ path: "/api/cron/reminders", schedule: "0 6 * * *" }],
};
