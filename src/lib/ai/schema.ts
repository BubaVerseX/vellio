import { z } from "zod";

const dayMealSchema = z.object({
  breakfast: z.string().nullable(),
  lunch: z.string().nullable(),
  dinner: z.string().nullable(),
  snacks: z.array(z.string()),
});

const dayWorkoutSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("rest") }),
  z.object({
    type: z.literal("workout"),
    focus: z.enum([
      "chest",
      "back",
      "legs",
      "shoulders",
      "arms",
      "core",
      "full_body",
      "cardio",
    ]),
    exerciseIds: z.array(z.string()),
  }),
]);

const milestoneSchema = z.object({
  weekLabel: z.string(),
  text: z.string(),
});

/** Structured output shape for the AI plan generation call. Mirrors
 * MealPlanData / WorkoutPlanData (lib/plan/mealPlan.ts, workoutPlan.ts) but
 * with plain recipe/exercise id references only — day totals, sets/reps,
 * and portions are all derived server-side from the real recipe/exercise
 * rows, never trusted from the model. */
export const aiPlanSchema = z.object({
  mealPlan: z.object({
    monday: dayMealSchema,
    tuesday: dayMealSchema,
    wednesday: dayMealSchema,
    thursday: dayMealSchema,
    friday: dayMealSchema,
    saturday: dayMealSchema,
    sunday: dayMealSchema,
  }),
  workoutPlan: z.object({
    monday: dayWorkoutSchema,
    tuesday: dayWorkoutSchema,
    wednesday: dayWorkoutSchema,
    thursday: dayWorkoutSchema,
    friday: dayWorkoutSchema,
    saturday: dayWorkoutSchema,
    sunday: dayWorkoutSchema,
  }),
  milestones: z.array(milestoneSchema),
});

export type AiPlanResponse = z.infer<typeof aiPlanSchema>;
