import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Baby, CalendarClock, Dog, Flame, Thermometer, Wind } from "lucide-react";
import { serverGet, serverGetOr } from "@/lib/api";
import type { ProductDetail } from "@/lib/types";
import { ASHRAE_ROWS, MERV_INFO } from "@/lib/merv";
import { PdpView } from "@/components/product/pdp-view";
import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/site/section-heading";

export async function generateMetadata(props: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await serverGetOr<ProductDetail | null>(`/products/${encodeURIComponent(slug)}`, null);
  if (!p) return { title: "Product not found" };
  return {
    title: p.seoTitle ?? p.name,
    description: p.seoDescription ?? p.shortDescription ?? undefined,
    openGraph: { images: p.images[0] ? [p.images[0].url] : undefined },
  };
}

const replaceTips = [
  { icon: Wind, title: "Asthma or allergies", when: "Every 6 weeks", body: "Replace more often to keep pollen, dust and dander from recirculating." },
  { icon: Dog, title: "Pets", when: "Every 2 months", body: "Pet hair and dander load filters faster, especially with more than one pet." },
  { icon: Baby, title: "Young children", when: "Every 2–3 months", body: "A fresh filter helps keep airborne particles down in busy households." },
];

const neglect = [
  { icon: Flame, title: "Higher energy bills", body: "A clogged filter makes your system work harder to push air through." },
  { icon: Thermometer, title: "Uneven, stuffy rooms", body: "Weak airflow leaves some rooms too warm, too cold or simply stuffy." },
  { icon: CalendarClock, title: "Shorter equipment life", body: "Restricted airflow strains blowers, coils and heat exchangers over time." },
];

async function ProductContent(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const product = await serverGet<ProductDetail>(`/products/${encodeURIComponent(slug)}`);
  const size = typeof sp.size === "string" ? sp.size : undefined;
  const merv = typeof sp.merv === "string" ? Number(sp.merv) : undefined;
  const isHvac = product.category.slug === "hvac";

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link> /{" "}
        <Link href="/shop" className="hover:text-primary">Shop</Link> /{" "}
        <Link
          href={product.category.slug === "hvac" ? "/hvac-air-filters" : product.category.slug === "pathogen" ? "/pathogen-air-filters" : "/environmental-air-filters"}
          className="hover:text-primary"
        >
          {product.category.name}
        </Link>{" "}
        / <span className="text-foreground">{product.name}</span>
      </nav>

      <PdpView key={product.id} product={product} initialSize={size} initialMerv={merv} />

      {isHvac ? (
        <>
          <section aria-labelledby="replace-title" className="py-20">
            <SectionHeading
              title={<span id="replace-title">When to replace your air filter?</span>}
              body="For the best indoor air quality, change your HVAC or furnace filter regularly — how often depends on your household."
            />
            <ul className="mt-12 grid gap-5 md:grid-cols-3">
              {replaceTips.map(({ icon: Icon, title, when, body }) => (
                <li key={title} className="surface-card p-6">
                  <span className="grid size-12 place-items-center rounded-xl bg-gradient-brand text-white">
                    <Icon className="size-6" />
                  </span>
                  <p className="mt-5 text-xl font-bold text-primary">{title}</p>
                  <p className="font-semibold text-brand">{when}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-10 grid items-center gap-8 rounded-2xl bg-gradient-soft p-8 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-primary">What happens if you don&apos;t replace on time?</h3>
                <p className="mt-3 text-muted-foreground">
                  Your filter catches dust every day, but it can only hold so much. Once it&apos;s full, dirty air keeps
                  circulating and your system has to work harder.
                </p>
              </div>
              <ul className="space-y-4 rounded-2xl bg-white p-6 shadow-card">
                {neglect.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-lavender text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-bold text-primary">{title}</span>
                      <span className="text-sm text-muted-foreground">{body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section aria-labelledby="merv-compare" className="pb-8">
            <SectionHeading
              title={<span id="merv-compare">MERV rating comparison</span>}
              body="Minimum particle-capture efficiencies defined by ASHRAE Standard 52.2 for each MERV level."
            />
            <div className="mx-auto mt-10 max-w-4xl overflow-x-auto rounded-2xl border border-lavender bg-white shadow-card">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr>
                    <th className="p-4 text-left font-semibold text-muted-foreground">Particle size</th>
                    {[11, 13].map((m) => (
                      <th key={m} className="p-3">
                        <span className={`block rounded-xl py-3 text-lg font-extrabold italic ${MERV_INFO[m].tone}`}>MERV {m}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-lavender">
                    <th scope="row" className="p-4 text-left font-semibold">Recommended for</th>
                    <td className="p-4 text-center text-muted-foreground">{MERV_INFO[11].recommended}</td>
                    <td className="p-4 text-center text-muted-foreground">{MERV_INFO[13].recommended}</td>
                  </tr>
                  {ASHRAE_ROWS.map((r) => (
                    <tr key={r.band} className="border-t border-lavender">
                      <th scope="row" className="p-4 text-left">
                        <span className="block font-semibold">{r.examples}</span>
                        <span className="text-xs font-normal text-muted-foreground italic">{r.band}</span>
                      </th>
                      <td className="p-4 text-center font-semibold tabular-nums">{r.m11}</td>
                      <td className="p-4 text-center font-semibold tabular-nums">{r.m13}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-lavender">
                    <th scope="row" className="p-4 text-left font-semibold">Shop</th>
                    <td className="p-4 text-center">
                      <Link href="/shop?merv=11" className="font-semibold text-brand underline-offset-4 hover:underline">MERV 11 filters</Link>
                    </td>
                    <td className="p-4 text-center">
                      <Link href="/shop?merv=13" className="font-semibold text-brand underline-offset-4 hover:underline">MERV 13 filters</Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {product.related.length ? (
        <section aria-labelledby="related-title" className="pt-16">
          <h2 id="related-title" className="text-2xl font-extrabold tracking-tight text-primary">You may also like</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {product.related.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function PdpSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-12" aria-hidden>
      <div className="aspect-square animate-pulse rounded-2xl bg-gradient-card lg:col-span-5" />
      <div className="space-y-4 lg:col-span-4">
        <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-12 animate-pulse rounded-xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-white lg:col-span-3" />
    </div>
  );
}

export default function ProductPage(props: PageProps<"/products/[slug]">) {
  return (
    <div className="container-page py-8">
      <Suspense fallback={<PdpSkeleton />}>
        <ProductContent {...props} />
      </Suspense>
    </div>
  );
}
