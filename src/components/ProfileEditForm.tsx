"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { submitOnboarding, type OnboardingInput } from "@/app/onboarding/actions";
import type { Tables } from "@/lib/supabase/database.types";

const ALLERGY_OPTIONS = ["nuts", "peanuts", "dairy", "egg", "gluten", "soy", "fish", "shellfish"] as const;
const RESTRICTION_OPTIONS = ["vegetarian", "vegan", "gluten_free", "dairy_free", "pescatarian"] as const;

export function ProfileEditForm({ profile }: { profile: Tables<"profiles"> }) {
  const { t } = useLocale();
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: profile.full_name ?? "",
    age: String(profile.age ?? ""),
    sex: (profile.sex ?? "male") as OnboardingInput["sex"],
    weightKg: String(profile.weight_kg ?? ""),
    heightCm: String(profile.height_cm ?? ""),
    activityLevel: (profile.activity_level ?? "moderate") as OnboardingInput["activityLevel"],
    goal: (profile.goal ?? "maintain") as OnboardingInput["goal"],
    allergies: profile.allergies ?? [],
    dietaryRestrictions: profile.dietary_restrictions ?? [],
    restrictionsNotes: profile.restrictions_notes ?? "",
    medicalConditions: profile.medical_conditions ?? "",
    timeAvailableMinutes: String(profile.time_available_minutes ?? ""),
    equipmentSetting: (profile.equipment_setting ?? "home") as OnboardingInput["equipmentSetting"],
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleInList(key: "allergies" | "dietaryRestrictions", value: string) {
    setForm((prev) => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await submitOnboarding({
      fullName: form.fullName,
      age: Number(form.age),
      sex: form.sex,
      weightKg: Number(form.weightKg),
      heightCm: Number(form.heightCm),
      activityLevel: form.activityLevel,
      goal: form.goal,
      allergies: form.allergies,
      dietaryRestrictions: form.dietaryRestrictions,
      restrictionsNotes: form.restrictionsNotes,
      medicalConditions: form.medicalConditions,
      timeAvailableMinutes: Number(form.timeAvailableMinutes),
      equipmentSetting: form.equipmentSetting,
    });

    if (result.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card className="flex flex-col gap-4">
        <div>
          <Label htmlFor="fullName">{t.profile.title}</Label>
          <Input id="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age">{t.onboarding.age}</Label>
            <Input id="age" type="number" value={form.age} onChange={(e) => update("age", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sex">{t.onboarding.sex}</Label>
            <Select id="sex" value={form.sex} onChange={(e) => update("sex", e.target.value as OnboardingInput["sex"])}>
              <option value="male">{t.onboarding.sexMale}</option>
              <option value="female">{t.onboarding.sexFemale}</option>
              <option value="other">{t.onboarding.sexOther}</option>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight">{t.onboarding.weight}</Label>
            <Input id="weight" type="number" value={form.weightKg} onChange={(e) => update("weightKg", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="height">{t.onboarding.height}</Label>
            <Input id="height" type="number" value={form.heightCm} onChange={(e) => update("heightCm", e.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div>
          <Label htmlFor="activityLevel">{t.onboarding.activityLevel}</Label>
          <Select
            id="activityLevel"
            value={form.activityLevel}
            onChange={(e) => update("activityLevel", e.target.value as OnboardingInput["activityLevel"])}
          >
            <option value="sedentary">{t.onboarding.activitySedentary}</option>
            <option value="light">{t.onboarding.activityLight}</option>
            <option value="moderate">{t.onboarding.activityModerate}</option>
            <option value="active">{t.onboarding.activityActive}</option>
            <option value="very_active">{t.onboarding.activityVeryActive}</option>
          </Select>
        </div>
        <div>
          <Label>{t.onboarding.goal}</Label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["lose_weight", t.onboarding.goalLose],
                ["gain_weight", t.onboarding.goalGain],
                ["maintain", t.onboarding.goalMaintain],
                ["build_muscle", t.onboarding.goalMuscle],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => update("goal", value)}
                className={`rounded-2xl p-3 text-left text-sm font-semibold transition-all ${
                  form.goal === value ? "soft-pressed text-[var(--color-accent)]" : "soft-raised"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div>
          <Label>{t.onboarding.allergies}</Label>
          <ChipGroup>
            {ALLERGY_OPTIONS.map((allergy) => (
              <Chip
                key={allergy}
                type="button"
                selected={form.allergies.includes(allergy)}
                onClick={() => toggleInList("allergies", allergy)}
              >
                {t.allergens[allergy]}
              </Chip>
            ))}
          </ChipGroup>
        </div>
        <div>
          <Label>{t.onboarding.dietaryRestrictions}</Label>
          <ChipGroup>
            {RESTRICTION_OPTIONS.map((restriction) => (
              <Chip
                key={restriction}
                type="button"
                selected={form.dietaryRestrictions.includes(restriction)}
                onClick={() => toggleInList("dietaryRestrictions", restriction)}
              >
                {t.dietaryTags[restriction]}
              </Chip>
            ))}
          </ChipGroup>
        </div>
        <div>
          <Label htmlFor="restrictionsNotes">{t.onboarding.restrictionsNotes}</Label>
          <Textarea
            id="restrictionsNotes"
            rows={2}
            value={form.restrictionsNotes}
            onChange={(e) => update("restrictionsNotes", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="medicalConditions">{t.onboarding.medicalConditions}</Label>
          <Textarea
            id="medicalConditions"
            rows={2}
            value={form.medicalConditions}
            onChange={(e) => update("medicalConditions", e.target.value)}
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div>
          <Label htmlFor="timeAvailable">{t.onboarding.timeAvailable}</Label>
          <Input
            id="timeAvailable"
            type="number"
            value={form.timeAvailableMinutes}
            onChange={(e) => update("timeAvailableMinutes", e.target.value)}
          />
        </div>
        <div>
          <Label>{t.onboarding.equipmentSetting}</Label>
          <div className="flex flex-col gap-2">
            {(
              [
                ["home", t.onboarding.equipmentHome],
                ["gym", t.onboarding.equipmentGym],
                ["both", t.onboarding.equipmentBoth],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => update("equipmentSetting", value)}
                className={`rounded-2xl p-3.5 text-left text-sm font-semibold transition-all ${
                  form.equipmentSetting === value ? "soft-pressed text-[var(--color-accent)]" : "soft-raised"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {error && <p className="text-sm font-medium text-[var(--color-accent)]">{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? t.common.loading : t.common.save}
      </Button>
    </form>
  );
}
