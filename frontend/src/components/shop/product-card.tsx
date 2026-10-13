"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { money, packLabel } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";

export function productHref(p: ProductSummary) {
  if (!p.match) return `/products/${p.slug}`;
  const sp = new URLSearchParams({ size: p.match.size });
  if (p.match.mervRating) sp.set("merv", String(p.match.mervRating));
  return `/products/${p.slug}?${sp}`;
}

export function ProductCard({ product: p, priority }: { product: ProductSummary; priority?: boolean }) {
  const { add } = useCart();
  const href = productHref(p);
  const canQuickAdd = p.isPurchasable && p.match && p.match.stock > 0;

  const subtitle = p.match
    ? [p.match.size, p.match.mervRating ? `MERV ${p.match.mervRating}` : null, packLabel(p.match.packQuantity)]
        .filter(Boolean)
        .join(" · ")
    : [
        p.sizeCount > 1 ? `${p.sizeCount} sizes` : p.sizes[0],
        p.mervRatings.length ? `MERV ${p.mervRatings.join(" / ")}` : null,
      ]
        .filter(Boolean)
        .join(" · ");

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-lavender bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={href} className="relative block aspect-square" tabIndex={-1} aria-hidden>
        <ProductImage
          src={p.image?.url}
          alt={p.image?.alt ?? p.name}
          priority={priority}
          className="absolute inset-0"
          imgClassName="transition duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {p.badge ? (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-primary shadow-sm">{p.badge}</span>
          ) : null}
          {!p.isPurchasable ? (
            <span className="rounded-full bg-night/90 px-2.5 py-1 text-[11px] font-semibold text-white">Coming soon</span>
          ) : !p.inStock ? (
            <span className="rounded-full bg-zinc-800/90 px-2.5 py-1 text-[11px] font-semibold text-white">Out of stock</span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">{p.category.name}</p>
        <h3 className="mt-1.5 font-bold leading-snug text-foreground">
          <Link href={href} className="hover:text-brand">
            {p.name}
          </Link>
        </h3>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}

        <div className="mt-4 flex-1">
          {!p.isPurchasable ? (
            <p className="text-sm font-medium text-primary">{p.availabilityNote ?? "Not yet available for purchase"}</p>
          ) : p.match ? (
            <p className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-primary">{money(p.match.price)}</span>
              <span className="text-xs text-muted-foreground">
                {money(p.match.price / p.match.packQuantity)} per filter
              </span>
            </p>
          ) : p.priceFrom !== null ? (
            <p className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground">From</span>
              <span className="text-xl font-extrabold text-primary">{money(p.priceFrom)}</span>
              {p.pricePerFilterFrom ? (
                <span className="text-xs text-muted-foreground">({money(p.pricePerFilterFrom)}/filter)</span>
              ) : null}
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid gap-2">
          {canQuickAdd ? (
            <button
              type="button"
              disabled={add.isPending}
              onClick={() => add.mutate({ variantId: p.match!.variantId, quantity: 1 })}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-brand text-sm font-semibold text-white shadow-card transition hover:shadow-lift disabled:opacity-60"
            >
              <Plus className="size-4" /> {add.isPending ? "Adding…" : "Add to Cart"}
            </button>
          ) : (
            <Link
              href={href}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-xl text-sm font-semibold transition",
                p.isPurchasable
                  ? "bg-gradient-brand text-white shadow-card hover:shadow-lift"
                  : "bg-accent text-primary hover:bg-lavender",
              )}
            >
              {p.isPurchasable ? "Choose size & MERV" : "Learn more"}
            </Link>
          )}
          <Link
            href={href}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            View Product
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-lavender bg-white" aria-hidden>
      <div className="aspect-square animate-pulse bg-gradient-card" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-6 w-20 animate-pulse rounded bg-muted" />
        <div className="h-10 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
