import Image from "next/image";
import { ArrowRight, BadgeCheck, Banknote, Ruler, ShieldCheck, Truck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

const trust = [
  { icon: Truck, label: "Free shipping over $75" },
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: ShieldCheck, label: "MERV 11 & MERV 13" },
  { icon: Ruler, label: "Standard & custom sizes" },
];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="container-page flex min-h-[calc(100svh-10rem)] flex-col pt-4 pb-6 sm:pt-6 md:min-h-[calc(100svh-7rem)] lg:min-h-[calc(100svh-10rem)]">
      <div className="relative isolate flex flex-1 items-center overflow-hidden rounded-[1.75rem] bg-night">
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
        <div className="max-w-2xl px-6 py-14 sm:px-12 sm:py-16 lg:py-14">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur sm:text-sm">
            <BadgeCheck className="size-4 text-[oklch(80%_0.1_298)]" aria-hidden />
            America&apos;s #1 Pleated HVAC Air Filter
          </p>
          <h1 id="hero-title" className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.6rem] lg:leading-[1.05]">
            Advancing air <span className="text-[oklch(80%_0.1_298)]">filtration</span> for{" "}
            <span className="text-[oklch(86%_0.07_190)]">cleaner</span> environments
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            High-performance MERV 11 and MERV 13 pleated filters for furnaces, air conditioners and HVAC systems. Order
            online and pay on delivery, or buy in bulk for schools, farms and commercial buildings.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/shop" size="lg" className="bg-none bg-white text-primary hover:bg-lavender">
              Shop now <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghostLight" size="lg">
              Bulk orders
            </ButtonLink>
          </div>
        </div>
      </div>

      <ul className="relative z-10 mx-auto -mt-7 shrink-0 grid max-w-5xl grid-cols-2 gap-3 px-2 lg:grid-cols-4">
        {trust.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center justify-center gap-3 rounded-xl border-2 border-navy bg-white px-4 py-4 text-center text-sm font-semibold text-primary shadow-card"
          >
            <Icon className="size-5 shrink-0 text-brand" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
