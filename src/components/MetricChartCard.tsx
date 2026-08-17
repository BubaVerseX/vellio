"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { WeightChart } from "@/components/charts/WeightChart";

type Point = { date: string; weight: number };

export type MetricSeries = {
  weight: Point[];
  waistCm: Point[];
  chestCm: Point[];
  hipsCm: Point[];
  armsCm: Point[];
  thighsCm: Point[];
};

const METRICS: { key: keyof MetricSeries; labelKey: "weightMetric" | "waist" | "chest" | "hips" | "arms" | "thighs" }[] = [
  { key: "weight", labelKey: "weightMetric" },
  { key: "waistCm", labelKey: "waist" },
  { key: "chestCm", labelKey: "chest" },
  { key: "hipsCm", labelKey: "hips" },
  { key: "armsCm", labelKey: "arms" },
  { key: "thighsCm", labelKey: "thighs" },
];

export function MetricChartCard({
  series,
  projectedWeight,
}: {
  series: MetricSeries;
  /** Only ever shown against the weight tab — the projection is weight-only. */
  projectedWeight?: Point[];
}) {
  const { t } = useLocale();
  const [metric, setMetric] = useState<keyof MetricSeries>("weight");
  const available = METRICS.filter((m) => series[m.key].length > 0 || (m.key === "weight" && !!projectedWeight?.length));
  const data = series[metric];

  return (
    <div className="flex flex-col gap-4">
      <ChipGroup>
        {available.map(({ key, labelKey }) => (
          <Chip key={key} selected={metric === key} onClick={() => setMetric(key)}>
            {t.progress[labelKey]}
          </Chip>
        ))}
      </ChipGroup>
      {data.length > 0 || (metric === "weight" && projectedWeight?.length) ? (
        <WeightChart data={data} projectedData={metric === "weight" ? projectedWeight : undefined} />
      ) : (
        <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">{t.progress.noData}</p>
      )}
    </div>
  );
}
