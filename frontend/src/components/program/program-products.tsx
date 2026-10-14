import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { serverGetOr } from "@/lib/api";
import type { CategoryWithProducts } from "@/lib/types";
import { money } from "@/lib/format";
import { Reveal, Stagger, StaggerItem } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";

/**
 * Live products for a category, styled like the Environmental page.
 * Whatever the admin publishes in this category shows up here.
 */
export async function ProgramProducts({
  slug,
  id = "shop",
  eyebrow,
  title,
  body,
  cta,
  requestHref = "#contact",
}: {
  slug: string;
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
  requestHref?: string;
}) {
  const category = await serverGetOr<CategoryWithProducts | null>(`/categories/${slug}`, null);
  const items = category?.products ?? [];

  return (
    <section id={id} className="relative overflow-hidden bg-bg py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow={eyebrow} title={title} body={body} />
          {cta ? (
            <Reveal delay={0.1}>
              <Link
                href={cta.href}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-flare px-7 py-4 font-semibold text-white shadow-xl shadow-flare/30 transition-all hover:-translate-y-0.5 hover:bg-[#c2561a]"
              >
                {cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          ) : null}
        </div>

        {items.length ? (
          <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.12}>
            {items.map((p) => (
              <StaggerItem
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-line bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-deep/15"
              >
                <Link
                  href={`/products/${p.slug}`}
                  className="relative block aspect-[4/3] overflow-hidden bg-linear-to-br from-mist to-tint"
                  tabIndex={-1}
                  aria-hidden
                >
                  {p.image ? (
                    <Image
                      src={p.image.url}
                      alt={p.image.alt ?? p.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                  <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-deep uppercase shadow">
                    {p.isPurchasable ? (p.badge ?? "Available now") : (p.badge ?? "In development")}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-7">
                  <p className="eyebrow text-muted">{p.filterType ?? p.category.name}</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                    <Link href={`/products/${p.slug}`} className="hover:text-co2">
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    {p.isPurchasable ? p.shortDescription : (p.availabilityNote ?? p.shortDescription)}
                  </p>
                  {p.isPurchasable && p.mervRatings.length ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {p.mervRatings.map((m) => (
                        <li key={m} className="rounded-full bg-co2/10 px-3 py-1 font-mono text-[0.68rem] text-co2">
                          MERV {m}
                        </li>
                      ))}
                      {p.sizeCount > 0 ? (
                        <li className="rounded-full bg-deep/10 px-3 py-1 font-mono text-[0.68rem] text-deep">{p.sizeCount} sizes</li>
                      ) : null}
                    </ul>
                  ) : null}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
                    {p.isPurchasable && p.priceFrom !== null ? (
                      <span className="font-display text-xl font-semibold text-deep">
                        <span className="mr-1 text-sm font-normal text-muted">from</span>
                        {money(p.priceFrom)}
                      </span>
                    ) : (
                      <a href={requestHref} className="text-sm font-semibold text-flare hover:underline">
                        Request information
                      </a>
                    )}
                    <Link href={`/products/${p.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-co2 hover:underline">
                      {p.isPurchasable ? "View & buy" : "Product details"} <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <p className="mt-14 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-muted">
            Products will appear here soon.
          </p>
        )}
      </div>
    </section>
  );
}

export function ProductsSkeleton() {
  return (
    <section className="bg-bg py-24 sm:py-32" aria-hidden>
      <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-96 animate-pulse rounded-[1.75rem] bg-white" />
        ))}
      </div>
    </section>
  );
}
