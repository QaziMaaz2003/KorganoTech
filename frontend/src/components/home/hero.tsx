import Image from "next/image";
import { ArrowRight, BadgeCheck, CreditCard, Ruler, ShieldCheck, Truck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

const trust = [
  { icon: Truck, label: "Free shipping over $75" },
  { icon: CreditCard, label: "Secure card checkout" },
  { icon: ShieldCheck, label: "MERV 11 & MERV 13" },
  { icon: Ruler, label: "Standard & custom sizes" },
];

/**
 * Fills exactly the space below the sticky header (100svh − --header-h), so the
 * whole hero — copy, buttons and the trust boxes — is visible without scrolling.
 * Type, gaps and paddings scale with the viewport height (svh) so short windows
 * shrink the content instead of pushing it off screen.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="container-page flex min-h-[calc(100svh-var(--header-h))] flex-col pt-[clamp(0.5rem,1.6svh,1.5rem)] pb-[clamp(0.5rem,1.8svh,1.5rem)]"
    >
      <div className="relative isolate flex min-h-0 flex-1 items-center overflow-hidden rounded-[1.75rem] bg-night">
        <Image
          src="/images/hero-filter.jpg"
          alt="KorganoTech pleated air filter with flowing air"
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1360px) 1360px, 100vw"
          className="-z-10 object-cover object-[70%_center] sm:object-right"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,oklch(22%_0.07_296/0.96)_0%,oklch(26%_0.08_296/0.86)_38%,oklch(30%_0.08_296/0.25)_70%,transparent_100%)]"
        />
        {/* Bottom padding clears the 1.75rem the trust boxes overlap the card by. */}
        <div className="max-w-2xl px-6 pt-[clamp(0.75rem,3.2svh,3.5rem)] pb-[calc(1.75rem+clamp(0.75rem,3.2svh,2.5rem))] sm:px-12">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-[clamp(0.25rem,1svh,0.5rem)] text-xs font-semibold text-white backdrop-blur sm:text-sm">
            <BadgeCheck className="size-4 text-[oklch(80%_0.1_298)]" aria-hidden />
            America&apos;s #1 Pleated HVAC Air Filter
          </p>
          <h1
            id="hero-title"
            className="mt-[clamp(0.5rem,2.4svh,1.5rem)] text-[clamp(1.6rem,min(6.4svh,8.4vw),3.6rem)] leading-[1.08] font-extrabold tracking-tight text-white"
          >
            Advancing air <span className="text-[oklch(80%_0.1_298)]">filtration</span> for{" "}
            <span className="text-[oklch(86%_0.07_190)]">cleaner</span> environments
          </h1>
          <p className="mt-[clamp(0.5rem,2svh,1.25rem)] max-w-xl text-[clamp(0.85rem,min(2.1svh,3.9vw),1.125rem)] leading-relaxed text-white/85">
            High-performance MERV 11 and MERV 13 pleated filters for furnaces, air conditioners and HVAC systems. Order
            online and pay on delivery, or buy in bulk for schools, farms and commercial buildings.
          </p>
          <div className="mt-[clamp(0.75rem,3svh,2rem)] flex flex-wrap gap-3">
            <ButtonLink href="/shop" size="lg" className="h-[clamp(2.5rem,6svh,3.25rem)] bg-none bg-white text-primary hover:bg-lavender">
              Shop now <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghostLight" size="lg" className="h-[clamp(2.5rem,6svh,3.25rem)]">
              Bulk orders
            </ButtonLink>
          </div>
        </div>
      </div>

      <ul className="relative z-10 mx-auto -mt-7 grid w-full max-w-5xl shrink-0 grid-cols-2 gap-2 px-2 sm:gap-3 lg:grid-cols-4">
        {trust.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-navy bg-white px-3 py-[clamp(0.4rem,1.6svh,1rem)] text-center text-xs font-semibold text-primary shadow-card sm:gap-3 sm:px-4 sm:text-sm"
          >
            <Icon className="size-4 shrink-0 text-brand sm:size-5" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
