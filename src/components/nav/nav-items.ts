import { Home, UtensilsCrossed, Dumbbell, TrendingUp, User } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/home", key: "home" as const, icon: Home },
  { href: "/meals", key: "meals" as const, icon: UtensilsCrossed },
  { href: "/workouts", key: "workouts" as const, icon: Dumbbell },
  { href: "/progress", key: "progress" as const, icon: TrendingUp },
  { href: "/profile", key: "profile" as const, icon: User },
];
