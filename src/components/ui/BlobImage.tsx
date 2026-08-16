import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlobImageProps {
  src?: string | null;
  alt: string;
  icon?: LucideIcon;
  variant?: 1 | 2 | 3;
  className?: string;
}

const GRADIENTS = [
  "linear-gradient(135deg, #ff5722 0%, #ff8a50 100%)",
  "linear-gradient(135deg, #0d6efd 0%, #4c9aff 100%)",
  "linear-gradient(135deg, #ff5722 0%, #0d6efd 100%)",
];

export function BlobImage({ src, alt, icon: Icon, variant = 1, className }: BlobImageProps) {
  const blobClass = variant === 2 ? "blob-variant-2" : variant === 3 ? "blob-variant-3" : "";

  return (
    <div
      className={cn("soft-raised blob-mask flex items-center justify-center", blobClass, className)}
      style={!src ? { background: GRADIENTS[variant - 1] } : undefined}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : Icon ? (
        <Icon strokeWidth={1.8} className="h-[38%] w-[38%] text-white/90" />
      ) : null}
    </div>
  );
}
