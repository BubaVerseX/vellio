import { test } from "node:test";
import assert from "node:assert/strict";
import { caloriesToKhinkali, estimateWorkoutCalories } from "./culturalUnits.ts";

test("converts calories to a round khinkali count", () => {
  assert.equal(caloriesToKhinkali(300), 3);
  assert.equal(caloriesToKhinkali(250), 3);
  assert.equal(caloriesToKhinkali(240), 2);
});

test("never reports zero khinkali for a positive calorie figure", () => {
  assert.equal(caloriesToKhinkali(10), 1);
});

test("estimates workout calories from duration using a fixed rough rate", () => {
  assert.equal(estimateWorkoutCalories(30), 195);
  assert.equal(estimateWorkoutCalories(0), 0);
});
