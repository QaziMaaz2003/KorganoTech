import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { serverGetOr } from "@/lib/api";
import type { FilterSize } from "@/lib/types";
import { groupByWidth, shopSizeHref } from "@/lib/sizes";
import { money } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Air Filter Sizes",
  description: "Every KorganoTech HVAC air filter size in stock, grouped by depth. Find your 1\", 2\" or 4\" filter.",
};

async function SizeIndex() {
  const sizes = await serverGetOr<FilterSize[]>("/products/sizes", []);
  const depths = [...new Set(sizes.map((s) => s.depth))];
  if (!sizes.length) {
    return <p className="text-muted-foreground">Sizes will appear here once products are published.</p>;
  }
  return (
    <div className="space-y-12">
      {depths.map((d) => (
        <section key={d} aria-labelledby={`depth-${d}`}>
          <h2 id={`depth-${d}`} className="mb-5 text-2xl font-extrabold tracking-tight text-primary">
            {d}&quot; air filters
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {groupByWidth(sizes.filter((s) => s.depth === d)).map((g) => (
              <div key={g.label} className="surface-card p-5">
                <p className="mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">{g.label}</p>
                <ul className="divide-y divide-lavender">
                  {g.items.map((s) => (
                    <li key={s.size}>
                      <Link href={shopSizeHref(s.size)} className="flex items-center justify-between py-2.5 text-sm font-semibold hover:text-brand">
                        {s.size}
                        <span className="text-xs font-medium text-muted-foreground">from {money(s.pricePerFilterFrom)} / filter</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function SizesPage() {
  return (
    <div className="container-page py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link> / <Link href="/shop" className="hover:text-primary">Shop</Link> /{" "}
        <span className="text-foreground">Sizes</span>
      </nav>
      <div className="mt-4 mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Shop by size</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">Air filter sizes</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Sizes are listed as nominal width × length × depth in inches — the numbers printed on your current filter&apos;s
            frame.
          </p>
        </div>
        <ButtonLink href="/contact" variant="outline">Need a custom size?</ButtonLink>
      </div>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
        <SizeIndex />
      </Suspense>
    </div>
  );
}
