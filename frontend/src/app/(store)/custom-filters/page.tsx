import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, PackageCheck, Ruler, Truck } from "lucide-react";
import { PageHero } from "@/components/content/page-hero";
import { CustomFilterOrder } from "@/components/shop/custom-filter-order";

export const metadata: Metadata = {
  title: "Custom Size Air Filters",
  description:
    "Order MERV 11 or MERV 13 pleated air filters made to your exact size. Enter your dimensions, see your price instantly and pay securely by card.",
};

const steps = [
  { icon: Ruler, title: "Measure your opening", body: "Enter the exact width and height in inches, to the nearest 1/8\"." },
  { icon: Calculator, title: "See your price", body: "Pick depth, MERV rating and pack size. Your price updates instantly — no waiting for a quote." },
  { icon: PackageCheck, title: "We make it", body: "Your filters are built to your measurements and checked before they leave our Livermore facility." },
  { icon: Truck, title: "Delivered to you", body: "Track your order from your account, with the carrier and tracking number once it ships." },
];

const tips = [
  { title: "Measure the opening, not the old filter", body: "Old filters shrink and bend. Measure the slot the filter slides into: width, height and the depth available." },
  { title: "Use actual sizes", body: "Standard filters are labeled with rounded nominal sizes. For a custom filter, enter the real measurement." },
  { title: "Check the depth", body: "Most systems take a 1\" filter. Deeper 2\" and 4\" filters need a slot built for them." },
];

export default function CustomFiltersPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Custom Filters" }]}
        eyebrow="Custom sizes"
        title="Air filters made to"
        accent="your exact size"
        body="Odd-size opening? Enter your measurements and get an instant price on a MERV 11 or MERV 13 pleated filter built to fit."
      />

      <section className="container-page py-12 sm:py-16">
        <CustomFilterOrder />
      </section>

      <section className="bg-gradient-soft py-14 sm:py-16">
        <div className="container-page">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">How custom ordering works</h2>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="surface-card p-6">
                <span className="grid size-12 place-items-center rounded-xl bg-gradient-brand text-white">
                  <Icon className="size-6" />
                </span>
                <p className="mt-4 text-xs font-bold tracking-wide text-brand uppercase">Step {i + 1}</p>
                <h3 className="mt-1 text-lg font-bold text-primary">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary">Measuring tips</h2>
            <ul className="mt-6 space-y-4">
              {tips.map((t) => (
                <li key={t.title} className="surface-card p-5">
                  <p className="font-bold text-primary">{t.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.75rem] bg-gradient-brand p-8 text-white">
            <h2 className="text-2xl font-extrabold tracking-tight">Ordering for a building or fleet?</h2>
            <p className="mt-3 text-white/80">
              Schools, farms and commercial buildings can talk to our sales team about large or recurring orders.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex h-12 items-center rounded-full bg-white px-7 text-sm font-semibold text-night transition hover:bg-lavender"
            >
              Contact sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
