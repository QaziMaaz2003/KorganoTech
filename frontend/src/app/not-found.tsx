import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-hero px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-md text-muted-foreground">The page may have moved, or the product may no longer be available.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/shop" variant="outline">Shop filters</ButtonLink>
      </div>
      <Link href="/contact" className="mt-6 text-sm font-semibold text-brand hover:underline">
        Contact us
      </Link>
    </div>
  );
}
