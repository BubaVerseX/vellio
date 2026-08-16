import {
  Dumbbell,
  Repeat2,
  Zap,
  Calendar,
  Timer,
  Home,
  Flame,
  Activity,
  type LucideIcon,
} from "lucide-react";

export type WorkoutTemplate = {
  id: string;
  icon: LucideIcon;
  sessionsPerWeek: number;
  minutesPerSession: number;
  equipment: "home" | "gym" | "both";
  difficulty: "beginner" | "intermediate" | "advanced";
  focusSequence: string[];
};

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "push_pull_legs",
    icon: Dumbbell,
    sessionsPerWeek: 6,
    minutesPerSession: 60,
    equipment: "gym",
    difficulty: "advanced",
    focusSequence: ["chest", "back", "legs"],
  },
  {
    id: "upper_lower",
    icon: Repeat2,
    sessionsPerWeek: 4,
    minutesPerSession: 50,
    equipment: "both",
    difficulty: "intermediate",
    focusSequence: ["chest", "legs", "back", "legs"],
  },
  {
    id: "full_body_3day",
    icon: Zap,
    sessionsPerWeek: 3,
    minutesPerSession: 45,
    equipment: "both",
    difficulty: "beginner",
    focusSequence: ["full_body"],
  },
  {
    id: "twice_a_week",
    icon: Calendar,
    sessionsPerWeek: 2,
    minutesPerSession: 40,
    equipment: "both",
    difficulty: "beginner",
    focusSequence: ["full_body"],
  },
  {
    id: "quick_circuits",
    icon: Timer,
    sessionsPerWeek: 4,
    minutesPerSession: 25,
    equipment: "home",
    difficulty: "beginner",
    focusSequence: ["full_body", "cardio"],
  },
  {
    id: "home_bodyweight",
    icon: Home,
    sessionsPerWeek: 4,
    minutesPerSession: 35,
    equipment: "home",
    difficulty: "beginner",
    focusSequence: ["legs", "core", "full_body", "cardio"],
  },
  {
    id: "strength_5day",
    icon: Flame,
    sessionsPerWeek: 5,
    minutesPerSession: 55,
    equipment: "gym",
    difficulty: "advanced",
    focusSequence: ["chest", "back", "legs", "shoulders", "arms"],
  },
  {
    id: "core_cardio",
    icon: Activity,
    sessionsPerWeek: 3,
    minutesPerSession: 30,
    equipment: "both",
    difficulty: "intermediate",
    focusSequence: ["core", "cardio"],
  },
];
