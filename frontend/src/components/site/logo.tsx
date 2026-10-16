import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} aria-label="KorganoTech home" className={cn("inline-flex shrink-0", className)}>
      <Image
        src="/images/korganotech-logo.png"
        alt="KorganoTech — Clean Air is Our Passion"
        width={912}
        height={200}
        loading="eager"
        className="h-11 w-auto sm:h-14"
      />
    </Link>
  );
}
