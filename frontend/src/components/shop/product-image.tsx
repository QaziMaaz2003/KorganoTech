import Image from "next/image";
import { Wind } from "lucide-react";
import { cn } from "@/lib/utils";

/** Cloudinary-hosted product image on the lavender product backdrop. */
export function ProductImage({
  src,
  alt,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  className,
  imgClassName,
  priority,
}: {
  src?: string | null;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-gradient-card", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          className={cn("object-cover", imgClassName)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-primary/30">
          <Wind className="size-1/3" aria-hidden />
        </div>
      )}
    </div>
  );
}
