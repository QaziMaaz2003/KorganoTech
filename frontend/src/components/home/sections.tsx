import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Factory,
  HeartPulse,
  Home as HomeIcon,
  MapPin,
  Ruler,
  School,
  ShieldCheck,
  Store,
  Tractor,
  X,
} from "lucide-react";
import { serverGetOr } from "@/lib/api";
import type { FilterSize } from "@/lib/types";
import { aboutCopy, brand, programs } from "@/lib/site";
import { SectionHeading } from "@/components/site/section-heading";
import { ButtonLink } from "@/components/ui/button-link";
import { SizeTabs } from "./size-tabs";
import { cn } from "@/lib/utils";

// ─── HVAC air filter sizes (live from the catalog) ─────────────────────────

export async function SizesSection() {
  const sizes = await serverGetOr<FilterSize[]>("/products/sizes", []);
  return <SizeTabs sizes={sizes} />;
}

export function SizesSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-14 animate-pulse rounded-2xl bg-white shadow-card" />
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-lavender sm:grid-cols-4">
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} className="h-12 bg-white" />
        ))}
      </div>
    </div>
  );
}

// ─── Shop by product (FilterKing: "Shop by brand") ──────────────────────────

export function ShopByProduct() {
  return (
    <section aria-labelledby="by-product" className="container-page py-20">
      <SectionHeading
        title={<span id="by-product">Shop by product</span>}
        body="KorganoTech designs air filters engineered for precise fit and dependable filtration — with two next-generation programs in active development."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {programs.map((p) => (
          <Link
            key={p.slug}
            href={p.href}
            className="group overflow-hidden rounded-2xl border border-lavender bg-white text-center shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-card">
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <span
                className={cn(
                  "absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur",
                  p.available ? "bg-white/90 text-emerald-700" : "bg-white/90 text-primary",
                )}
              >
                {p.status}
              </span>
            </div>
            <div className="px-5 py-5">
              <p className="font-bold text-primary underline decoration-primary/30 underline-offset-4 group-hover:decoration-brand">
                {p.name}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Shop by MERV rating ────────────────────────────────────────────────────

const mervCards = [
  {
    title: "MERV 11",
    tag: "Advanced",
    body: "Advanced filtration for homes with pets, kids or mild allergies — captures fine dust, pollen, mold spores and pet dander.",
    href: "/shop?merv=11",
    tone: "bg-gradient-brand text-white",
  },
  {
    title: "MERV 13",
    tag: "Superior",
    body: "Our highest-efficiency pleated filter for households with allergies or sensitivities — traps smaller particles such as smoke and fine dust.",
    href: "/shop?merv=13",
    tone: "bg-night text-white",
  },
  {
    title: "CUSTOM",
    tag: "Made to order",
    body: "Non-standard dimensions or a large order for a school, farm or building? Our sales team quotes custom sizes and bulk volumes.",
    href: "/contact",
    tone: "bg-lavender text-primary",
  },
  {
    title: "PATHOGEN",
    tag: "In development",
    body: "A nanotechnology-based filter designed to capture and neutralize airborne pathogens. Not yet commercially available.",
    href: "/pathogen-air-filters",
    tone: "bg-[linear-gradient(135deg,oklch(30%_0.12_300),oklch(45%_0.2_300))] text-white",
  },
];

export function ShopByMerv() {
  return (
    <section aria-labelledby="by-merv" className="container-page pb-20">
      <SectionHeading
        title={<span id="by-merv">Shop by MERV rating</span>}
        body="MERV ratings measure how much your filter captures — from everyday dust to fine particles. Find the right level for your home or building below."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {mervCards.map((m) => (
          <Link
            key={m.title}
            href={m.href}
            className="group rounded-2xl border border-lavender bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <div className={cn("grid h-36 place-items-center rounded-xl text-4xl font-extrabold tracking-tight italic", m.tone)}>
              {m.title}
            </div>
            <p className="mt-5 text-lg font-bold text-primary">{m.tag}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              Shop now <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Guide ──────────────────────────────────────────────────────────────────

export function Guide() {
  return (
    <section aria-labelledby="guide-title" className="bg-white">
      <div className="container-page grid items-center gap-10 py-20 lg:grid-cols-2">
        <div>
          <p className="eyebrow italic">Guide</p>
          <h2 id="guide-title" className="mt-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            How often to change an air filter
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
            For most homes with a 1-inch filter, 60–90 days is a reliable baseline. Filter type, thickness, pets,
            allergies and local conditions can all shift that window. Read our guide to find the right schedule for your
            home or building.
          </p>
          <ButtonLink href="/resources/understanding-hvac-air-filters" variant="outline" className="mt-7">
            Read the guide <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-card shadow-lift">
          <Image
            src="/images/filter-hvac.jpg"
            alt="KorganoTech pleated HVAC air filter"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

// ─── Where clean air matters (FilterKing: delivery map) ─────────────────────

const places = [
  { icon: School, title: "Schools", body: "Classrooms and gyms with high occupancy and long HVAC run times." },
  { icon: HeartPulse, title: "Senior centers", body: "Residents who are more sensitive to airborne particulates." },
  { icon: Tractor, title: "Poultry & animal farms", body: "Dusty, high-load environments where air quality affects health." },
  { icon: Building2, title: "Commercial buildings", body: "Offices and facilities running large air-handling systems." },
  { icon: HomeIcon, title: "Homes", body: "Furnaces, air conditioners and residential HVAC systems." },
  { icon: Factory, title: "Environmental sites", body: "Landfill-gas capture technology in development with LLNL." },
];

export function WhereCleanAirMatters() {
  return (
    <section aria-labelledby="places-title" className="bg-gradient-soft">
      <div className="container-page py-20">
        <SectionHeading
          title={<span id="places-title">Built for the places clean air matters most</span>}
          body={aboutCopy.mission}
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_340px]">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {places.map(({ icon: Icon, title, body }) => (
              <li key={title} className="surface-card p-6 hover:-translate-y-0.5 hover:shadow-lift">
                <span className="grid size-12 place-items-center rounded-xl bg-accent text-primary">
                  <Icon className="size-6" />
                </span>
                <p className="mt-4 font-bold text-primary">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
          <div className="flex flex-col justify-between rounded-2xl bg-night p-7 text-white shadow-lift">
            <div>
              <MapPin className="size-8 text-[oklch(80%_0.1_298)]" />
              <p className="mt-4 text-2xl font-extrabold tracking-tight">Based in Livermore, California</p>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                KorganoTech designs and manufactures air filters from its home at {brand.address}.
              </p>
            </div>
            <dl className="mt-8 space-y-3 border-t border-white/15 pt-6 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">EPA Establishment No.</dt>
                <dd className="font-semibold">{brand.epaEstablishment}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">U.S. trademark</dt>
                <dd className="font-semibold">#{brand.trademark}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Why choose KorganoTech ─────────────────────────────────────────────────

const reasons = [
  {
    icon: BadgeCheck,
    title: "A U.S.-based filter manufacturer",
    body: "KorganoTech manufactures high-performance pleated HVAC air filters from Livermore, California, and sells them on Walmart.com.",
  },
  {
    icon: ShieldCheck,
    title: "MERV 11 & MERV 13 melt-blown media",
    body: "High-performance filters engineered to improve indoor air quality by reducing airborne pollutants and other harmful particulates.",
  },
  {
    icon: Ruler,
    title: "Standard sizes, custom sizes and bulk",
    body: "Order common 1\", 2\" and 4\" sizes online, or contact sales for custom dimensions and bulk orders for your facility.",
  },
];

export function WhyChoose() {
  return (
    <section aria-labelledby="why-title" className="bg-[oklch(97%_0.012_290)]">
      <div className="container-page grid items-center gap-10 py-20 lg:grid-cols-2">
        <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-gradient-card shadow-lift">
          <Image
            src="/images/hero-filter.jpg"
            alt="Clean air flowing through a KorganoTech filter"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 id="why-title" className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            Why choose KorganoTech
          </h2>
          <ul className="mt-8 divide-y divide-lavender">
            {reasons.map(({ icon: Icon, title, body }) => (
              <li key={title} className="py-6 first:pt-0">
                <p className="flex items-center gap-3 text-lg font-bold text-primary">
                  <Icon className="size-7 shrink-0 text-brand" /> {title}
                </p>
                <p className="mt-2 leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── Trusted (mission & commitment, original copy) ──────────────────────────

const pillars = [
  { title: "Our mission", body: aboutCopy.mission },
  { title: "What we make", body: aboutCopy.about[0] },
  { title: "Our commitment", body: aboutCopy.commitment[0] },
  { title: "Why it matters", body: aboutCopy.motivation[2] },
];

export function Trusted() {
  return (
    <section aria-labelledby="trusted-title" className="container-page py-20">
      <SectionHeading title={<span id="trusted-title">Trusted where clean air matters</span>} />
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a
          href={brand.walmartUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-xl border border-lavender bg-white px-5 py-3 shadow-card transition hover:shadow-lift"
        >
          <Store className="size-6 text-[#0071dc]" />
          <span className="text-left text-sm">
            <span className="block font-bold text-foreground">Available at Walmart.com</span>
            <span className="text-muted-foreground">America&apos;s #1 Pleated HVAC Air Filter</span>
          </span>
        </a>
        <div className="inline-flex items-center gap-3 rounded-xl border border-lavender bg-white px-5 py-3 shadow-card">
          <BadgeCheck className="size-6 text-brand" />
          <span className="text-left text-sm">
            <span className="block font-bold text-foreground">U.S. registered trademark</span>
            <span className="text-muted-foreground">#{brand.trademark}</span>
          </span>
        </div>
      </div>
      <ul className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:thin] lg:grid lg:grid-cols-4 lg:overflow-visible">
        {pillars.map((p) => (
          <li key={p.title} className="surface-card w-[82%] shrink-0 snap-start p-6 sm:w-[46%] lg:w-auto">
            <p className="font-bold text-primary">{p.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">&ldquo;{p.body}&rdquo;</p>
            <p className="mt-4 text-sm font-semibold text-foreground">— KorganoTech</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 text-center">
        <Link href="/about" className="text-sm font-semibold text-primary underline underline-offset-4 hover:text-brand">
          Read more about us
        </Link>
      </div>
    </section>
  );
}

// ─── Bulk orders comparison (FilterKing: auto-delivery) ─────────────────────

export function BulkCompare() {
  return (
    <section aria-labelledby="bulk-title" className="container-page">
      <div className="relative isolate overflow-hidden rounded-[1.75rem] px-5 py-14 sm:px-10">
        <Image src="/images/hero-filter.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover blur-[3px]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-night/80" />
        <div className="mx-auto max-w-2xl text-center text-white">
          <h2 id="bulk-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Buying for a school, farm or building?
          </h2>
          <p className="mt-3 text-white/80">
            For bulk purchases of KorganoTech Traditional Air Filters, contact our sales team for a quote.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-5 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6">
            <p className="text-center text-lg font-bold text-muted-foreground">Ordering filter by filter</p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {[
                "Reorder pack by pack whenever you run out",
                "Mixed sizes across buildings to track yourself",
                "Late changes mean clogged filters and higher energy use",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <X className="mt-0.5 size-4 shrink-0 rounded bg-red-500 p-0.5 text-white" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-6 ring-2 ring-brand">
            <p className="text-center text-lg font-bold text-primary">
              With a bulk order <span className="text-emerald-600">(quoted to your volume)</span>
            </p>
            <ul className="mt-5 space-y-3 text-sm text-foreground">
              {[
                "MERV 11, MERV 13 or custom sizes in one order",
                "One point of contact for repeat orders",
                "Quotes tailored to schools, farms and commercial buildings",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 rounded bg-emerald-600 p-0.5 text-white" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <ButtonLink href="/contact" variant="light" size="lg">
            Contact sales <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
