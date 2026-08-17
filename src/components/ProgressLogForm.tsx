"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Ruler } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { logWeight } from "@/lib/actions/progress";
import { logMeasurements } from "@/lib/actions/measurements";
import { savePhotoPath } from "@/lib/actions/photo";
import { createClient } from "@/lib/supabase/client";

export function ProgressLogForm({
  userId,
  defaultWeight,
}: {
  userId: string;
  defaultWeight?: number | null;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [weight, setWeight] = useState(defaultWeight ? String(defaultWeight) : "");
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [measurements, setMeasurements] = useState({
    waistCm: "",
    chestCm: "",
    hipsCm: "",
    armsCm: "",
    thighsCm: "",
  });
  const [showPhoto, setShowPhoto] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateMeasurement(key: keyof typeof measurements, value: string) {
    setMeasurements((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setSaved(false);
    setError(null);
    const today = new Date().toISOString().slice(0, 10);

    if (weight) {
      const result = await logWeight(today, Number(weight));
      if (result.error) {
        setError(result.error === "premium_required" ? t.premium.requiredShort : result.error);
        setPending(false);
        return;
      }
    }

    const hasMeasurement = Object.values(measurements).some((v) => v);
    if (hasMeasurement) {
      const result = await logMeasurements(today, {
        waistCm: measurements.waistCm ? Number(measurements.waistCm) : undefined,
        chestCm: measurements.chestCm ? Number(measurements.chestCm) : undefined,
        hipsCm: measurements.hipsCm ? Number(measurements.hipsCm) : undefined,
        armsCm: measurements.armsCm ? Number(measurements.armsCm) : undefined,
        thighsCm: measurements.thighsCm ? Number(measurements.thighsCm) : undefined,
      });
      if (result.error) {
        setError(result.error === "premium_required" ? t.premium.requiredShort : result.error);
        setPending(false);
        return;
      }
    }

    if (photoFile) {
      const supabase = createClient();
      const ext = photoFile.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${today}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("progress-photos")
        .upload(path, photoFile, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        setPending(false);
        return;
      }
      const photoResult = await savePhotoPath(today, path);
      if (photoResult.error) {
        setError(photoResult.error === "premium_required" ? t.premium.requiredShort : photoResult.error);
        setPending(false);
        return;
      }
    }

    setPending(false);
    setSaved(true);
    setPhotoFile(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Label>{t.progress.weightToday}</Label>
          <Input
            type="number"
            step="0.1"
            min={1}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
      </div>

      {!showMeasurements ? (
        <button
          type="button"
          onClick={() => setShowMeasurements(true)}
          className="soft-raised flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-[var(--color-text-secondary)]"
        >
          <Ruler strokeWidth={1.8} className="h-3.5 w-3.5" />
          {t.progress.addMeasurements}
        </button>
      ) : (
        <div className="soft-pressed grid grid-cols-2 gap-3 rounded-2xl p-4">
          <div>
            <Label>{t.progress.waist}</Label>
            <Input
              type="number"
              value={measurements.waistCm}
              onChange={(e) => updateMeasurement("waistCm", e.target.value)}
            />
          </div>
          <div>
            <Label>{t.progress.chest}</Label>
            <Input
              type="number"
              value={measurements.chestCm}
              onChange={(e) => updateMeasurement("chestCm", e.target.value)}
            />
          </div>
          <div>
            <Label>{t.progress.hips}</Label>
            <Input
              type="number"
              value={measurements.hipsCm}
              onChange={(e) => updateMeasurement("hipsCm", e.target.value)}
            />
          </div>
          <div>
            <Label>{t.progress.arms}</Label>
            <Input
              type="number"
              value={measurements.armsCm}
              onChange={(e) => updateMeasurement("armsCm", e.target.value)}
            />
          </div>
          <div>
            <Label>{t.progress.thighs}</Label>
            <Input
              type="number"
              value={measurements.thighsCm}
              onChange={(e) => updateMeasurement("thighsCm", e.target.value)}
            />
          </div>
        </div>
      )}

      {!showPhoto ? (
        <button
          type="button"
          onClick={() => setShowPhoto(true)}
          className="soft-raised flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-[var(--color-text-secondary)]"
        >
          <Camera strokeWidth={1.8} className="h-3.5 w-3.5" />
          {t.progress.addPhoto}
        </button>
      ) : (
        <div className="soft-pressed flex flex-col gap-2 rounded-2xl p-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            className="text-sm text-[var(--color-text-secondary)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-accent)] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
          />
          <p className="text-xs text-[var(--color-text-tertiary)]">{t.progress.photoPrivate}</p>
        </div>
      )}

      {error && <p className="text-sm font-medium text-[var(--color-accent)]">{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? t.common.loading : saved ? t.progress.saved : t.progress.logWeight}
      </Button>
    </form>
  );
}
