import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { serverGetOr } from "@/lib/api";
import type { CategoryWithProducts } from "@/lib/types";
import { money } from "@/lib/format";

/**
 * Products the admin publishes in the "environmental" category, styled to
 * match the ported Environmental Filters page.
 */
export async function EnvLiveProducts() {
  const category = await serverGetOr<CategoryWithProducts | null>("/categories/environmental", null);
  const items = category?.products ?? [];
  if (!items.length) return null;

  return (
    <div className="mt-16 rounded-[2rem] border border-line bg-white p-6 sm:p-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-co2">Availability</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">Environmental Filters products</h3>
        </div>
        <p className="max-w-md text-sm text-muted">
          {items.some((p) => p.isPurchasable)
            ? "Order online or contact us about your site."
            : "In development for landfill applications — register your interest below."}
        </p>
      </div>
      <ul className="mt-8 grid gap-6 md:grid-cols-2">
        {items.map((p) => (
          <li key={p.id} className="group flex gap-5 rounded-[1.5rem] border border-line bg-bg p-4 transition hover:border-co2/40">
            <div className="relative size-32 shrink-0 overflow-hidden rounded-2xl bg-linear-to-br from-mist to-tint">
              {p.image ? (
                <Image src={p.image.url} alt={p.image.alt ?? p.name} fill sizes="128px" className="object-cover transition duration-700 group-hover:scale-105" />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="w-fit rounded-full bg-co2/10 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-co2 uppercase">
                {p.isPurchasable ? "Available" : (p.badge ?? "In development")}
              </span>
              <p className="mt-2 font-display text-xl font-semibold text-ink">{p.name}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{p.availabilityNote ?? p.shortDescription}</p>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                {p.isPurchasable && p.priceFrom !== null ? (
                  <span className="font-display text-lg font-semibold text-deep">from {money(p.priceFrom)}</span>
                ) : null}
                <Link href={`/products/${p.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-co2 hover:underline">
                  {p.isPurchasable ? "View product" : "Product details"} <ArrowUpRight className="size-4" />
                </Link>
                {!p.isPurchasable ? (
                  <a href="#contact" className="text-sm font-semibold text-flare hover:underline">
                    Request information
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
