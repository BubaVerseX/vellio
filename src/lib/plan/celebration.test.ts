import { test } from "node:test";
import assert from "node:assert/strict";
import { computeCelebration } from "./celebration.ts";

const BASE = { workoutStreak: 0, totalWorkoutsCompleted: 0, changeKg: null, goal: null };

test("nothing to celebrate for a brand-new user", () => {
  assert.equal(computeCelebration(BASE), null);
});

test("an active streak of 3+ days takes priority", () => {
  assert.deepEqual(computeCelebration({ ...BASE, workoutStreak: 3, totalWorkoutsCompleted: 10 }), {
    type: "streak",
    days: 3,
  });
});

test("a streak under 3 days does not qualify on its own", () => {
  assert.equal(computeCelebration({ ...BASE, workoutStreak: 2 }), null);
});

test("weight loss toward a lose_weight goal celebrates once past 1kg", () => {
  assert.deepEqual(computeCelebration({ ...BASE, changeKg: -2.4, goal: "lose_weight" }), {
    type: "weight",
    kg: 2.4,
  });
});

test("weight loss under 1kg does not yet celebrate", () => {
  assert.equal(computeCelebration({ ...BASE, changeKg: -0.5, goal: "lose_weight" }), null);
});

test("weight gain in the wrong direction for a lose_weight goal does not celebrate", () => {
  assert.equal(computeCelebration({ ...BASE, changeKg: 2, goal: "lose_weight" }), null);
});

test("weight gain toward a build_muscle goal celebrates", () => {
  assert.deepEqual(computeCelebration({ ...BASE, changeKg: 1.5, goal: "build_muscle" }), {
    type: "weight",
    kg: 1.5,
  });
});

test("falls back to total workouts logged when nothing else qualifies", () => {
  assert.deepEqual(computeCelebration({ ...BASE, totalWorkoutsCompleted: 5 }), {
    type: "workouts",
    count: 5,
  });
});

test("fewer than 5 total workouts does not qualify the fallback", () => {
  assert.equal(computeCelebration({ ...BASE, totalWorkoutsCompleted: 4 }), null);
});
