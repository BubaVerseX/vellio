import {
  ClipboardList,
  Clock,
  Droplet,
  UtensilsCrossed,
  PieChart,
  Moon,
  Wheat,
  TrendingUp,
  Flame,
  Repeat,
  type LucideIcon,
} from "lucide-react";

export type Tip = {
  id: string;
  icon: LucideIcon;
};

export const TIPS: Tip[] = [
  { id: "reading_labels", icon: ClipboardList },
  { id: "protein_timing", icon: Clock },
  { id: "hydration_workouts", icon: Droplet },
  { id: "eating_out", icon: UtensilsCrossed },
  { id: "understanding_macros", icon: PieChart },
  { id: "sleep_recovery", icon: Moon },
  { id: "fiber_basics", icon: Wheat },
  { id: "reading_progress", icon: TrendingUp },
  { id: "warm_up_basics", icon: Flame },
  { id: "building_habits", icon: Repeat },
];
