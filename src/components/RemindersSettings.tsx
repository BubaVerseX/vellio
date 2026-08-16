"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { Card } from "@/components/ui/Card";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { upsertReminder, type ReminderSchedule } from "@/lib/actions/reminders";
import type { Tables } from "@/lib/supabase/database.types";

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function ReminderCard({
  title,
  reminder,
  type,
  defaultTime,
}: {
  title: string;
  reminder: Tables<"reminders"> | undefined;
  type: "meal" | "workout";
  defaultTime: string;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const schedule = (reminder?.schedule as unknown as ReminderSchedule) ?? {
    days: ["mon", "tue", "wed", "thu", "fri"],
    time: defaultTime,
    timezone: "UTC",
  };

  const [enabled, setEnabled] = useState(reminder?.enabled ?? true);
  const [days, setDays] = useState<string[]>(schedule.days ?? []);
  const [time, setTime] = useState(schedule.time ?? defaultTime);
  const [pending, setPending] = useState(false);

  function toggleDay(day: string) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  async function handleSave() {
    setPending(true);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await upsertReminder(reminder?.id ?? null, type, { days, time, timezone }, enabled);
    setPending(false);
    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold tracking-tight">{title}</h3>
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            enabled ? "soft-pressed text-[var(--color-accent)]" : "soft-raised text-[var(--color-text-tertiary)]"
          }`}
        >
          {enabled ? t.settings.enabled : t.settings.disabled}
        </button>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold text-[var(--color-text-tertiary)]">
          {t.settings.reminderDays}
        </label>
        <ChipGroup>
          {DAY_KEYS.map((day) => (
            <Chip key={day} type="button" selected={days.includes(day)} onClick={() => toggleDay(day)}>
              {t.settings.days[day]}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-[var(--color-text-tertiary)]">
          {t.settings.reminderTime}
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="soft-pressed rounded-xl border-0 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
        />
      </div>

      <Button onClick={handleSave} disabled={pending} className="!py-2.5 text-sm">
        {pending ? t.common.loading : t.common.save}
      </Button>
    </Card>
  );
}

export function RemindersSettings({ reminders }: { reminders: Tables<"reminders">[] }) {
  const { t } = useLocale();
  const mealReminder = reminders.find((r) => r.type === "meal");
  const workoutReminder = reminders.find((r) => r.type === "workout");

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-extrabold tracking-tight">{t.settings.reminders}</h2>
      <ReminderCard
        title={t.settings.mealReminders}
        reminder={mealReminder}
        type="meal"
        defaultTime="08:00"
      />
      <ReminderCard
        title={t.settings.workoutReminders}
        reminder={workoutReminder}
        type="workout"
        defaultTime="18:00"
      />
    </div>
  );
}
