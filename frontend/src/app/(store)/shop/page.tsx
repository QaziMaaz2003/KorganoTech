import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, SearchX, SlidersHorizontal, X } from "lucide-react";
import { serverGet } from "@/lib/api";
import type { ProductList } from "@/lib/types";
import { programs } from "@/lib/site";
import { ProductCard, ProductCardSkeleton } from "@/components/shop/product-card";
import { SortSelect } from "@/components/shop/sort-select";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop Air Filters",
  description:
    "Shop KorganoTech MERV 11 and MERV 13 pleated HVAC air filters by size, depth and MERV rating. Secure card checkout.",
};

type SP = Record<string, string | string[] | undefined>;
const FILTER_KEYS = ["category", "size", "width", "height", "depth", "merv", "type", "q", "sort"] as const;

function pick(sp: SP) {
  const out: Record<string, string> = {};
  for (const k of [...FILTER_KEYS, "page"]) {
    const v = sp[k];
    const s = Array.isArray(v) ? v[0] : v;
    if (s) out[k] = s;
  }
  return out;
}

function hrefWith(current: Record<string, string>, changes: Record<string, string | null>) {
  const next = { ...current };
  delete next.page;
  for (const [k, v] of Object.entries(changes)) {
    if (v === null) delete next[k];
    else next[k] = v;
  }
  // A concrete size replaces the W/H/D from the size finder and vice versa.
  if ("size" in changes) {
    delete next.width;
    delete next.height;
    if (changes.size) delete next.depth;
  }
  const s = new URLSearchParams(next).toString();
  return s ? `/shop?${s}` : "/shop";
}

function FacetLink({ active, href, children }: { active: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition",
        active ? "border-brand bg-brand text-white" : "border-border bg-white text-foreground hover:border-brand/50 hover:text-brand",
      )}
    >
      {children}
    </Link>
  );
}

async function ShopResults({ searchParams }: { searchParams: Promise<SP> }) {
  const current = pick(await searchParams);
  const apiQuery = new URLSearchParams({ ...current, pageSize: "24" }).toString();
  const data = await serverGet<ProductList>(`/products?${apiQuery}`);
  const page = Number(current.page ?? 1);

  const sizeLabel =
    data.appliedSize ??
    (current.depth ? `${current.depth}" filters` : null);

  const chips: { label: string; href: string }[] = [];
  if (current.category) {
    chips.push({
      label: programs.find((p) => p.slug === current.category)?.short ?? current.category,
      href: hrefWith(current, { category: null }),
    });
  }
  if (data.appliedSize) chips.push({ label: data.appliedSize, href: hrefWith(current, { size: null, depth: null }) });
  else if (current.depth) chips.push({ label: `${current.depth}" depth`, href: hrefWith(current, { depth: null }) });
  if (current.merv) chips.push({ label: `MERV ${current.merv}`, href: hrefWith(current, { merv: null }) });
  if (current.type) chips.push({ label: current.type, href: hrefWith(current, { type: null }) });
  if (current.q) chips.push({ label: `“${current.q}”`, href: hrefWith(current, { q: null }) });

  const sizesByDepth = data.facets.depths.map((d) => ({
    depth: d,
    sizes: data.facets.sizes.filter((s) => s.endsWith(`x${d}`)),
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside aria-label="Filters" className="space-y-7 lg:sticky lg:top-36 lg:self-start">
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <SlidersHorizontal className="size-4" /> Filters
        </div>
        <div>
          <p className="eyebrow mb-3">Product</p>
          <div className="flex flex-wrap gap-2">
            <FacetLink active={!current.category} href={hrefWith(current, { category: null })}>All</FacetLink>
            {programs.map((p) => (
              <FacetLink key={p.slug} active={current.category === p.slug} href={hrefWith(current, { category: p.slug })}>
                {p.slug === "hvac" ? "HVAC" : p.slug === "pathogen" ? "Pathogen" : "Environmental"}
              </FacetLink>
            ))}
          </div>
        </div>
        {data.facets.mervRatings.length ? (
          <div>
            <p className="eyebrow mb-3">MERV rating</p>
            <div className="flex flex-wrap gap-2">
              {data.facets.mervRatings.map((m) => (
                <FacetLink
                  key={m}
                  active={current.merv === String(m)}
                  href={hrefWith(current, { merv: current.merv === String(m) ? null : String(m) })}
                >
                  MERV {m}
                </FacetLink>
              ))}
            </div>
          </div>
        ) : null}
        {data.facets.depths.length ? (
          <div>
            <p className="eyebrow mb-3">Depth</p>
            <div className="flex flex-wrap gap-2">
              {data.facets.depths.map((d) => (
                <FacetLink
                  key={d}
                  active={current.depth === String(d) && !data.appliedSize}
                  href={hrefWith(current, { size: null, depth: current.depth === String(d) && !data.appliedSize ? null : String(d) })}
                >
                  {d}&quot;
                </FacetLink>
              ))}
            </div>
          </div>
        ) : null}
        {sizesByDepth.map((g) => (
          <div key={g.depth}>
            <p className="eyebrow mb-3">{g.depth}&quot; sizes</p>
            <div className="flex flex-wrap gap-1.5">
              {g.sizes.map((s) => (
                <FacetLink key={s} active={data.appliedSize === s} href={hrefWith(current, { size: data.appliedSize === s ? null : s })}>
                  {s}
                </FacetLink>
              ))}
            </div>
          </div>
        ))}
        <div className="rounded-2xl bg-gradient-brand p-5 text-white">
          <p className="font-bold">Need a custom size?</p>
          <p className="mt-1 text-sm text-white/80">We take custom-size and bulk orders.</p>
          <Link href="/contact" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">
            Contact sales <ArrowRight className="size-4" />
          </Link>
        </div>
      </aside>

      <div>
        <div className="flex flex-col gap-4 border-b border-lavender pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {data.total} product{data.total === 1 ? "" : "s"}
              {sizeLabel ? <> for <strong className="text-foreground">{sizeLabel}</strong></> : null}
            </p>
            {chips.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {chips.map((c) => (
                  <Link key={c.label} href={c.href} scroll={false} className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary hover:bg-lavender">
                    {c.label} <X className="size-3" />
                  </Link>
                ))}
                <Link href="/shop" className="px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-primary">
                  Clear all
                </Link>
              </div>
            ) : null}
          </div>
          <SortSelect query={new URLSearchParams(current).toString()} value={current.sort ?? "featured"} />
        </div>

        {data.items.length ? (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {data.items.map((p, i) => (
              <li key={p.id}>
                <ProductCard product={p} priority={i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
            <SearchX className="size-10 text-brand" />
            <p className="mt-4 text-xl font-bold text-primary">
              {data.appliedSize ? `No ${data.appliedSize} filters in stock yet` : "No filters match these filters"}
            </p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              We make custom sizes to order. Send us the dimensions and quantity and our sales team will get back to you.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/contact">Request this size</ButtonLink>
              <ButtonLink href="/shop/sizes" variant="outline">Browse all sizes</ButtonLink>
            </div>
          </div>
        )}

        {data.pageCount > 1 ? (
          <nav aria-label="Pagination" className="mt-10 flex justify-center gap-2">
            {Array.from({ length: data.pageCount }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={hrefWith(current, { page: n === 1 ? null : String(n) })}
                aria-current={n === page ? "page" : undefined}
                className={cn(
                  "grid size-10 place-items-center rounded-xl text-sm font-semibold",
                  n === page ? "bg-gradient-brand text-white" : "border border-border bg-white hover:bg-accent",
                )}
              >
                {n}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div className="hidden space-y-4 lg:block" aria-hidden>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <div className="container-page py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link> / <span className="text-foreground">Shop</span>
      </nav>
      <div className="mt-4 mb-10 flex flex-col gap-2">
        <p className="eyebrow">Shop</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">Shop air filters</h1>
        <p className="max-w-2xl text-muted-foreground">
          MERV 11 and MERV 13 pleated HVAC air filters made with traditional melt blown filtration media. Pick your size,
          choose your MERV rating, and check out securely by card. Need an odd size?{" "}
          <Link href="/custom-filters" className="font-semibold text-brand underline">Order a custom size</Link>.
        </p>
      </div>
      <Suspense fallback={<ShopSkeleton />}>
        <ShopResults searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
