// Proves the AI regeneration cap described in AGENTS.md's v2.0 spec:
// ensureAiPlan (lib/ai/ensureAiPlan.ts) only calls the paid Claude API when
// hasChangedMeaningfully() returns true. This file tests that gate directly
// — the pure decision function every call site funnels through, extracted
// into regenerationCap.ts specifically so it's testable without a Next.js
// runtime — plus the structural claim (checked by grep in the code review,
// not here) that ensureAiPlan has exactly one caller (generatePlan), which
// itself is only reached from getOrCreateWeekPlans when no meal_plans/
// workout_plans row exists yet for the current week. Run with `npm test`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { hasChangedMeaningfully, sameSet, type ProfileSnapshot } from "./regenerationCap.ts";

const BASE: ProfileSnapshot = {
  goal: "lose_weight",
  weight_kg: 80,
  activity_level: "moderate",
  height_cm: 178,
  age: 30,
  sex: "male",
  allergies: ["nuts"],
  dietary_restrictions: ["vegetarian"],
  equipment_setting: "home",
  time_available_minutes: 30,
};

function withChange(overrides: Partial<ProfileSnapshot>): ProfileSnapshot {
  return { ...BASE, ...overrides };
}

test("identical snapshot never triggers regeneration", () => {
  assert.equal(hasChangedMeaningfully(BASE, { ...BASE }), false);
});

test("height and age drift alone does not trigger regeneration (not part of the cap)", () => {
  assert.equal(hasChangedMeaningfully(BASE, withChange({ height_cm: 179, age: 31 })), false);
});

test("goal change triggers regeneration", () => {
  assert.equal(hasChangedMeaningfully(BASE, withChange({ goal: "build_muscle" })), true);
});

test("equipment change triggers regeneration", () => {
  assert.equal(hasChangedMeaningfully(BASE, withChange({ equipment_setting: "gym" })), true);
});

test("activity level change triggers regeneration", () => {
  assert.equal(hasChangedMeaningfully(BASE, withChange({ activity_level: "active" })), true);
});

test("sex change triggers regeneration", () => {
  assert.equal(hasChangedMeaningfully(BASE, withChange({ sex: "female" })), true);
});

test("allergy set change triggers regeneration", () => {
  assert.equal(hasChangedMeaningfully(BASE, withChange({ allergies: ["nuts", "dairy"] })), true);
});

test("allergy list re-ordered (same set) does not trigger regeneration", () => {
  const reordered = withChange({ allergies: ["nuts"] });
  assert.equal(hasChangedMeaningfully(withChange({ allergies: ["nuts"] }), reordered), false);
  assert.equal(sameSet(["nuts", "dairy"], ["dairy", "nuts"]), true);
});

test("dietary restriction change triggers regeneration", () => {
  assert.equal(hasChangedMeaningfully(BASE, withChange({ dietary_restrictions: ["vegan"] })), true);
});

test("weight change under the 3kg threshold does not trigger regeneration", () => {
  assert.equal(hasChangedMeaningfully(BASE, withChange({ weight_kg: 82.9 })), false);
});

test("weight change exactly at the 3kg threshold triggers regeneration", () => {
  assert.equal(hasChangedMeaningfully(BASE, withChange({ weight_kg: 83 })), true);
});

test("weight change over the 3kg threshold triggers regeneration", () => {
  assert.equal(hasChangedMeaningfully(BASE, withChange({ weight_kg: 75 })), true);
});

test("weight going from a value to null triggers regeneration", () => {
  assert.equal(hasChangedMeaningfully(BASE, withChange({ weight_kg: null })), true);
});

test("weight going from null to a value triggers regeneration", () => {
  const noWeight = withChange({ weight_kg: null });
  assert.equal(hasChangedMeaningfully(noWeight, BASE), true);
});

test("time budget change under the 20min threshold does not trigger regeneration", () => {
  assert.equal(hasChangedMeaningfully(BASE, withChange({ time_available_minutes: 49 })), false);
});

test("time budget change exactly at the 20min threshold triggers regeneration", () => {
  assert.equal(hasChangedMeaningfully(BASE, withChange({ time_available_minutes: 50 })), true);
});

test("time budget going from a value to null triggers regeneration", () => {
  assert.equal(hasChangedMeaningfully(BASE, withChange({ time_available_minutes: null })), true);
});

test("time budget going from null to a value triggers regeneration", () => {
  const noTime = withChange({ time_available_minutes: null });
  assert.equal(hasChangedMeaningfully(noTime, BASE), true);
});

test("both weight and time staying null across snapshots does not trigger regeneration", () => {
  const noneSet = withChange({ weight_kg: null, time_available_minutes: null });
  assert.equal(hasChangedMeaningfully(noneSet, { ...noneSet }), false);
});
