import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { mealReminderEmail, workoutReminderEmail } from "@/lib/email/templates";
import { currentWeekStart, dayKeyForDate } from "@/lib/plan/generatePlan";
import { mealIdsFromDay } from "@/lib/plan/lookups";
import { zonedNow, shortDayKey, withinMinuteWindow } from "@/lib/plan/timezone";
import type { ReminderSchedule } from "@/lib/actions/reminders";
import type { MealPlanData } from "@/lib/plan/mealPlan";
import type { WorkoutPlanData } from "@/lib/plan/workoutPlan";
import type { Locale } from "@/lib/i18n";

const RUN_WINDOW_MINUTES = 15;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ skipped: "SUPABASE_SERVICE_ROLE_KEY not configured" });
  }

  const { data: reminders } = await admin.from("reminders").select("*").eq("enabled", true);
  if (!reminders?.length) return NextResponse.json({ processed: 0 });

  let sent = 0;

  for (const reminder of reminders) {
    const schedule = reminder.schedule as unknown as ReminderSchedule;
    if (!schedule?.timezone || !schedule.time || !schedule.days?.length) continue;

    const { dayKey, hhmm, dateStr } = zonedNow(schedule.timezone);
    const isScheduledToday = schedule.days.includes(shortDayKey(dayKey));
    const isDueNow = withinMinuteWindow(hhmm, schedule.time, RUN_WINDOW_MINUTES);
    const alreadySentToday = reminder.last_sent_at?.slice(0, 10) === dateStr;

    if (!isScheduledToday || !isDueNow || alreadySentToday) continue;

    const { data: profile } = await admin
      .from("profiles")
      .select("email, locale")
      .eq("id", reminder.user_id)
      .single();
    if (!profile?.email) continue;

    const locale = (profile.locale ?? "en") as Locale;
    const weekStart = currentWeekStart(new Date(`${dateStr}T00:00:00Z`));
    const todayKey = dayKeyForDate(new Date(`${dateStr}T00:00:00Z`));

    if (reminder.type === "meal") {
      const { data: mealPlan } = await admin
        .from("meal_plans")
        .select("plan_data")
        .eq("user_id", reminder.user_id)
        .eq("week_start", weekStart)
        .maybeSingle();

      const planData = mealPlan?.plan_data as unknown as MealPlanData | undefined;
      const dayPlan = planData?.days[todayKey];
      const ids = dayPlan ? mealIdsFromDay(dayPlan) : [];

      let mealNames: string[] = [];
      if (ids.length) {
        const { data: recipes } = await admin.from("recipes").select("id, name, name_ka").in("id", ids);
        mealNames = (recipes ?? []).map((r) => (locale === "ka" && r.name_ka ? r.name_ka : r.name));
      }

      const { subject, html } = mealReminderEmail(locale, mealNames);
      await sendEmail({ to: profile.email, subject, html });
    } else {
      const { data: workoutPlan } = await admin
        .from("workout_plans")
        .select("plan_data")
        .eq("user_id", reminder.user_id)
        .eq("week_start", weekStart)
        .maybeSingle();

      const planData = workoutPlan?.plan_data as unknown as WorkoutPlanData | undefined;
      const dayPlan = planData?.days[todayKey];
      const isRestDay = !dayPlan || dayPlan.type === "rest";
      const focus = dayPlan?.type === "workout" ? dayPlan.focus : undefined;

      const { subject, html } = workoutReminderEmail(locale, isRestDay, focus);
      await sendEmail({ to: profile.email, subject, html });
    }

    await admin.from("reminders").update({ last_sent_at: new Date().toISOString() }).eq("id", reminder.id);
    sent += 1;
  }

  return NextResponse.json({ processed: reminders.length, sent });
}
