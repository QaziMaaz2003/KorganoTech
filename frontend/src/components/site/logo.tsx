import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} aria-label="KorganoTech home" className={cn("inline-flex shrink-0", className)}>
      <Image
        src="/images/korganotech-logo.png"
        alt="KorganoTech — Air filters for healthy living"
        width={387}
        height={100}
        loading="eager"
        className="h-9 w-auto sm:h-11"
      />
    </Link>
  );
}
