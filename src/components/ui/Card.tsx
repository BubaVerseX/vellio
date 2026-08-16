import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("soft-raised rounded-3xl p-5", className)}
      {...props}
    />
  );
}

export function SurfaceCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("surface-alt soft-raised rounded-3xl p-5", className)}
      {...props}
    />
  );
}
