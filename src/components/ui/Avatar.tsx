import { cn } from "@/lib/utils";

interface AvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, imageUrl, size = 40, className }: AvatarProps) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name ?? "Avatar"}
        style={{ width: size, height: size }}
        className={cn("rounded-none object-cover", className)}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "flex items-center justify-center rounded-none bg-[var(--color-accent)] font-extrabold text-[var(--color-bg)]",
        className
      )}
    >
      {initial}
    </div>
  );
}
