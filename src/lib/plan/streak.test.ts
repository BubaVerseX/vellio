import { test } from "node:test";
import assert from "node:assert/strict";
import { computeWorkoutStreak } from "./streak.ts";

test("no logs means no streak", () => {
  assert.equal(computeWorkoutStreak([], "2026-08-18"), 0);
});

test("counts consecutive completed days ending yesterday when today is unlogged", () => {
  const logs = [
    { date: "2026-08-15", workout_completed: true },
    { date: "2026-08-16", workout_completed: true },
    { date: "2026-08-17", workout_completed: true },
  ];
  assert.equal(computeWorkoutStreak(logs, "2026-08-18"), 3);
});

test("includes today when today is already completed", () => {
  const logs = [
    { date: "2026-08-17", workout_completed: true },
    { date: "2026-08-18", workout_completed: true },
  ];
  assert.equal(computeWorkoutStreak(logs, "2026-08-18"), 2);
});

test("a gap day breaks the streak", () => {
  const logs = [
    { date: "2026-08-14", workout_completed: true },
    { date: "2026-08-16", workout_completed: true },
    { date: "2026-08-17", workout_completed: true },
  ];
  assert.equal(computeWorkoutStreak(logs, "2026-08-18"), 2);
});

test("a false (explicit rest/skip) breaks the streak just like a missing day", () => {
  const logs = [
    { date: "2026-08-16", workout_completed: false },
    { date: "2026-08-17", workout_completed: true },
  ];
  assert.equal(computeWorkoutStreak(logs, "2026-08-18"), 1);
});
