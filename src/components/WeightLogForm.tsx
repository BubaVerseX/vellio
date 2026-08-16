"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { logWeight } from "@/lib/actions/progress";

export function WeightLogForm({ defaultWeight }: { defaultWeight?: number | null }) {
  const { t } = useLocale();
  const router = useRouter();
  const [weight, setWeight] = useState(defaultWeight ? String(defaultWeight) : "");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weight) return;
    setPending(true);
    setSaved(false);
    const today = new Date().toISOString().slice(0, 10);
    const result = await logWeight(today, Number(weight));
    setPending(false);
    if (!result.error) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">
          {t.progress.weightToday}
        </label>
        <Input
          type="number"
          step="0.1"
          min={1}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={pending || !weight}>
        {saved ? t.progress.saved : t.progress.logWeight}
      </Button>
    </form>
  );
}
