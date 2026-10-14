import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Dog, Baby, Ruler, Wind } from "lucide-react";
import { articles } from "@/lib/resources";
import { MERV_INFO } from "@/lib/merv";
import { PageHero } from "@/components/content/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Learn More About Air Filtration",
  description: "Guides and background reading on filtration, sizing, and the technology behind it.",
};

const schedule = [
  { icon: Wind, who: "Asthma or allergies", every: "Every 6 weeks", note: "Replace more often to keep pollen, dust and dander from recirculating." },
  { icon: Dog, who: "Pets in the home", every: "Every 2 months", note: "Pet hair and dander load a filter faster, especially with several pets." },
  { icon: Baby, who: "Young children", every: "Every 2–3 months", note: "A fresh filter helps keep airborne particles down in busy households." },
  { icon: Ruler, who: "Typical household", every: "Every 60–90 days", note: "A reliable baseline for a 1-inch filter; deeper filters often last longer." },
];

const sizeExamples = [
  { nominal: "16x20x1", actual: "15.5 x 19.5 x 0.75" },
  { nominal: "16x25x1", actual: "15.5 x 24.5 x 0.75" },
  { nominal: "20x25x1", actual: "19.5 x 24.5 x 0.75" },
  { nominal: "20x25x4", actual: "19.5 x 24.5 x 3.75" },
];

const topics = ["All guides", "HVAC Basics", "Buying Guide", "Technology", "Indoor Air", "Innovation"];

export default function ResourcesPage() {
  const [featured, ...rest] = articles;
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Resources" }]}
        eyebrow="Resources"
        title="Learn More About"
        accent="Air Filtration"
        body="Guides and background reading on filtration, sizing, and the technology behind it — from choosing the right filter size to understanding what MERV ratings really mean."
        image="/images/unsplash/resources-books.jpg"
        imageAlt="An open book on a desk in front of a bookshelf"
      />

      <section className="container-page pt-14">
        <ul className="flex flex-wrap gap-2" aria-label="Topics covered">
          {topics.map((t, i) => (
            <li key={t} className={i === 0 ? "rounded-full bg-gradient-brand px-4 py-1.5 text-sm font-semibold text-white" : "rounded-full border border-lavender bg-white px-4 py-1.5 text-sm font-medium text-primary"}>
              {t}
            </li>
          ))}
        </ul>

        <Link href={`/resources/${featured.slug}`} className="group surface-card mt-8 grid overflow-hidden hover:-translate-y-1 hover:shadow-lift lg:grid-cols-[1.2fr_1fr]">
          <div className="relative aspect-[16/10] bg-gradient-card lg:aspect-auto lg:min-h-80">
            <Image src={featured.image} alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <p className="eyebrow">Featured guide · {featured.category}</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-primary">{featured.title}</h2>
            <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
            <p className="mt-6 flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Clock className="size-4" /> {featured.minutes} min read</span>
              <span className="inline-flex items-center gap-1 font-semibold text-brand">Read the guide <ArrowRight className="size-4 transition group-hover:translate-x-0.5" /></span>
            </p>
          </div>
        </Link>

        <ul className="mt-6 grid gap-6 md:grid-cols-2">
          {rest.map((a) => (
            <li key={a.slug}>
              <Link href={`/resources/${a.slug}`} className="group surface-card flex h-full flex-col overflow-hidden hover:-translate-y-1 hover:shadow-lift sm:flex-row">
                <div className="relative aspect-[16/10] shrink-0 bg-gradient-card sm:aspect-auto sm:w-56">
                  <Image src={a.image} alt="" fill sizes="(min-width: 640px) 224px, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="eyebrow">{a.category}</p>
                  <h2 className="mt-2 text-xl font-bold text-primary">{a.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{a.excerpt}</p>
                  <p className="mt-4 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Clock className="size-4" /> {a.minutes} min read</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-brand">Read More <ArrowRight className="size-4 transition group-hover:translate-x-0.5" /></span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="schedule-title" className="container-page py-20">
        <SectionHeading
          eyebrow="Quick reference"
          title={<span id="schedule-title">How often should you change your filter?</span>}
          body="A filter can only hold so much. Use these baselines as a starting point and change it sooner if you notice dust building up."
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {schedule.map(({ icon: Icon, who, every, note }) => (
            <li key={who} className="surface-card p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-gradient-brand text-white"><Icon className="size-6" /></span>
              <p className="mt-5 font-bold text-primary">{who}</p>
              <p className="font-semibold text-brand">{every}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-gradient-soft">
        <div className="container-page grid gap-8 py-20 lg:grid-cols-2">
          <div className="surface-card p-7">
            <p className="eyebrow">Sizing cheat sheet</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-primary">Nominal vs. actual size</h2>
            <p className="mt-2 text-sm text-muted-foreground">Filters are sold by nominal size but measure slightly smaller so they slide into the slot.</p>
            <table className="mt-5 w-full text-sm">
              <thead>
                <tr className="border-b border-lavender text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="py-2 font-semibold">Nominal (printed)</th>
                  <th className="py-2 font-semibold">Actual (inches)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lavender">
                {sizeExamples.map((r) => (
                  <tr key={r.nominal}>
                    <td className="py-3 font-semibold">{r.nominal}</td>
                    <td className="py-3 text-muted-foreground">{r.actual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link href="/resources/choosing-the-right-filter-size" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
              Full sizing guide <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="surface-card p-7">
            <p className="eyebrow">MERV quick guide</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-primary">Which rating fits you?</h2>
            <ul className="mt-5 space-y-4">
              {[11, 13].map((m) => (
                <li key={m} className="flex gap-4">
                  <span className={`grid h-14 w-24 shrink-0 place-items-center rounded-xl text-lg font-extrabold italic ${MERV_INFO[m].tone}`}>MERV {m}</span>
                  <span>
                    <span className="block font-bold text-primary">{MERV_INFO[m].tag}</span>
                    <span className="block text-sm text-muted-foreground">{MERV_INFO[m].summary}</span>
                    <span className="mt-1 block text-xs font-semibold text-brand">Best for: {MERV_INFO[m].recommended}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/resources/merv-ratings-explained" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
              MERV ratings explained <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[1.75rem] bg-night p-8 text-white sm:p-12 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Ready to find your filter?</h2>
            <p className="mt-2 max-w-xl text-white/75">Use the size finder, pick MERV 11 or MERV 13, and pay on delivery. Need something unusual? Our team takes custom sizes and bulk orders.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/shop" variant="light" size="lg">Shop filters <ArrowRight className="size-4" /></ButtonLink>
            <ButtonLink href="/contact" variant="ghostLight" size="lg">Contact sales</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
