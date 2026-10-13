import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Building2, Check, Flame, Snowflake, Store, ThermometerSun, Wind } from "lucide-react";
import { brand, hvacCopy } from "@/lib/site";
import { MERV_INFO } from "@/lib/merv";
import { PageHero } from "@/components/content/page-hero";
import { CategoryProducts, CategoryProductsSkeleton } from "@/components/content/category-products";
import { SizeFinder } from "@/components/home/size-finder";
import { SectionHeading } from "@/components/site/section-heading";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Traditional HVAC Air Filters — MERV 11 & MERV 13",
  description: hvacCopy.body,
};

const uses = [
  { icon: Flame, label: "Furnaces" },
  { icon: Snowflake, label: "Air conditioners" },
  { icon: ThermometerSun, label: "Heating systems" },
  { icon: Wind, label: "HVAC systems" },
];

export default function HvacPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Products" }, { label: "Traditional HVAC Air Filters" }]}
        eyebrow="Available Now"
        title="Traditional HVAC"
        accent="Air Filters"
        image="/images/filter-hvac.jpg"
        imageAlt="KorganoTech pleated HVAC air filter"
        body={
          <>
            <p className="font-semibold text-primary">{hvacCopy.headline} · {hvacCopy.availability}</p>
            <p className="mt-3">{hvacCopy.body}</p>
          </>
        }
      >
        <ButtonLink href="/shop?category=hvac" size="lg">
          Shop HVAC filters <ArrowRight className="size-4" />
        </ButtonLink>
        <ButtonLink href={brand.walmartUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="lg">
          <Store className="size-4" /> Buy on Walmart.com
        </ButtonLink>
      </PageHero>

      <section className="container-page grid gap-6 py-16 md:grid-cols-2">
        <div className="surface-card p-7">
          <h2 className="text-xl font-bold text-primary">{hvacCopy.title}</h2>
          <ul className="mt-5 space-y-3">
            {hvacCopy.points.map((p) => (
              <li key={p} className="flex gap-3 text-muted-foreground">
                <Check className="mt-0.5 size-5 shrink-0 text-emerald-600" /> {p}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-semibold text-foreground">{hvacCopy.trademarkNote}</p>
        </div>
        <div className="surface-card p-7">
          <h2 className="text-xl font-bold text-primary">Suitable for</h2>
          <ul className="mt-5 grid grid-cols-2 gap-3">
            {uses.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 rounded-xl bg-accent/50 p-4 font-semibold text-primary">
                <Icon className="size-5 text-brand" /> {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="hvac-products" className="container-page">
        <SectionHeading eyebrow="Shop" title={<span id="hvac-products">Shop Traditional HVAC Filters</span>} body="Find the right filter for your HVAC system." />
        <div className="mt-10">
          <Suspense fallback={<CategoryProductsSkeleton />}>
            <CategoryProducts slug="hvac" />
          </Suspense>
        </div>
      </section>

      <SizeFinder className="mt-20" />

      <section aria-labelledby="merv-levels" className="container-page py-20">
        <SectionHeading title={<span id="merv-levels">Choose your MERV level</span>} body="KorganoTech manufactures high-performance MERV 11 and MERV 13 air filters." />
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          {[11, 13].map((m) => (
            <Link key={m} href={`/shop?merv=${m}`} className="surface-card overflow-hidden hover:-translate-y-1 hover:shadow-lift">
              <div className={`grid h-28 place-items-center text-4xl font-extrabold italic ${MERV_INFO[m].tone}`}>MERV {m}</div>
              <div className="p-6">
                <p className="text-lg font-bold text-primary">{MERV_INFO[m].tag}</p>
                <p className="mt-1 text-sm text-muted-foreground">{MERV_INFO[m].summary}</p>
                <p className="mt-3 text-xs font-semibold text-brand">Recommended for: {MERV_INFO[m].recommended}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[1.75rem] bg-night p-8 text-white sm:p-12 lg:flex-row lg:items-center">
          <div className="flex gap-5">
            <Building2 className="size-10 shrink-0 text-[oklch(80%_0.1_298)]" />
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">For Bulk Purchases of KorganoTech Traditional Air Filters</h2>
              <p className="mt-2 text-white/75">Please fill out our Contact Form and our sales team will follow up.</p>
            </div>
          </div>
          <ButtonLink href="/contact" variant="light" size="lg">Contact Form <ArrowRight className="size-4" /></ButtonLink>
        </div>
      </section>
    </>
  );
}
