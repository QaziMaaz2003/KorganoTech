"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { ApiError, get, post } from "@/lib/client-api";
import type { BusinessFilterLine, MyBusiness, ReorderResult } from "@/lib/types";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { ButtonLink } from "@/components/ui/button-link";
import { ProductImage } from "@/components/shop/product-image";
import { CustomFilterThumb } from "@/components/shop/custom-filter-thumb";

const BUSINESS_KEY = ["business", "me"];

function lineTitle(l: BusinessFilterLine) {
  return l.label || l.product?.name || (l.custom ? "Custom-size filter" : "Air filter");
}

function lineDetail(l: BusinessFilterLine) {
  if (l.variant) return l.variant.label;
  if (l.custom) {
    const { width, height, depth, mervRating, packQuantity } = l.custom;
    return `${width}×${height}×${depth} · MERV ${mervRating} · ${packQuantity}-pack`;
  }
  return "";
}

export function BusinessReorder() {
  const qc = useQueryClient();
  const openCart = useCartStore((s) => s.setDrawerOpen);
  const { data, isLoading, error } = useQuery({
    queryKey: BUSINESS_KEY,
    queryFn: () => get<MyBusiness>("/business/me"),
    retry: false,
  });

  // Only the user's changes are stored; everything else falls back to the saved quantity / availability.
  const [qtyEdits, setQtyEdits] = useState<Record<string, number>>({});
  const [pickEdits, setPickEdits] = useState<Record<string, boolean>>({});
  const qtyOf = (f: BusinessFilterLine) => qtyEdits[f.id] ?? Math.max(1, f.quantity);
  const isPicked = (f: BusinessFilterLine) => f.available && (pickEdits[f.id] ?? true);

  const reorder = useMutation({
    mutationFn: (items: { filterId: string; quantity: number }[]) =>
      post<ReorderResult>("/business/me/reorder", { items }),
    onSuccess: (res) => {
      qc.setQueryData(["cart", "server"], res.cart);
      for (const s of res.skipped) toast.error(s.reason);
      if (res.added > 0) {
        toast.success(`${res.added} ${res.added === 1 ? "filter" : "filters"} added to your cart`);
        openCart(true);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const selected = (data?.filters ?? []).filter(isPicked);
  const total = selected.reduce((n, f) => n + f.unitPrice * qtyOf(f), 0);

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    const notLinked = error instanceof ApiError && (error.status === 404 || error.status === 403);
    return (
      <div className="surface-card flex flex-col items-center p-10 text-center">
        <Building2 className="size-12 text-brand" />
        <h2 className="mt-4 text-xl font-extrabold text-primary">
          {notLinked ? "No business account on this login" : "We couldn't load your filters"}
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {notLinked
            ? "Business accounts are set up by our team. Request one for free and we'll add your filter sizes so you can reorder in a few clicks."
            : error.message}
        </p>
        {notLinked ? <ButtonLink href="/business-account" className="mt-6">Request a business account</ButtonLink> : null}
      </div>
    );
  }

  if (!data) return null;
  const { business, filters } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">{business.name}</h1>
        <p className="mt-1 text-muted-foreground">
          Your saved filter sizes. Choose what you need this time, adjust the quantities and add them to your cart.
        </p>
      </div>

      {filters.length === 0 ? (
        <div className="rounded-xl bg-muted/60 p-8 text-center text-sm text-muted-foreground">
          Your filter list isn&apos;t set up yet. Our team will add your sizes shortly — or{" "}
          <Link href="/contact" className="font-semibold text-brand hover:underline">contact us</Link> to speed things up.
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {filters.map((f) => {
              const n = qtyOf(f);
              const max = Math.max(1, f.maxQuantity || 99);
              return (
                <li
                  key={f.id}
                  className={cn("surface-card flex flex-wrap items-center gap-4 p-4", !f.available && "opacity-70")}
                >
                  <input
                    type="checkbox"
                    aria-label={`Select ${lineTitle(f)}`}
                    className="size-5 accent-[var(--brand)]"
                    checked={isPicked(f)}
                    disabled={!f.available}
                    onChange={(e) => setPickEdits((p) => ({ ...p, [f.id]: e.target.checked }))}
                  />
                  {f.isCustom ? (
                    <CustomFilterThumb spec={f.custom} className="size-16 shrink-0 rounded-xl" />
                  ) : (
                    <ProductImage
                      src={f.product?.image?.url}
                      alt={f.product?.image?.alt ?? lineTitle(f)}
                      sizes="64px"
                      className="size-16 shrink-0 rounded-xl"
                    />
                  )}
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate font-bold text-primary">{lineTitle(f)}</p>
                    <p className="text-sm text-muted-foreground">{lineDetail(f)}</p>
                    {f.issue ? <p className="mt-1 text-xs font-semibold text-destructive">{f.issue}</p> : null}
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-input bg-white p-1">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={!f.available || n <= 1}
                      className="grid size-8 place-items-center rounded-full hover:bg-accent disabled:opacity-40"
                      onClick={() => setQtyEdits((q) => ({ ...q, [f.id]: Math.max(1, n - 1) }))}
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums" aria-live="polite">{n}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={!f.available || n >= max}
                      className="grid size-8 place-items-center rounded-full hover:bg-accent disabled:opacity-40"
                      onClick={() => setQtyEdits((q) => ({ ...q, [f.id]: Math.min(max, n + 1) }))}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <p className="w-24 text-right font-bold text-primary tabular-nums">{money(f.unitPrice * n)}</p>
                </li>
              );
            })}
          </ul>

          <div className="surface-card sticky bottom-4 flex flex-wrap items-center justify-between gap-4 p-4">
            <p className="text-sm text-muted-foreground">
              {selected.length} selected · <span className="font-bold text-primary tabular-nums">{money(total)}</span>
            </p>
            <button
              type="button"
              disabled={selected.length === 0 || reorder.isPending}
              onClick={() =>
                reorder.mutate(selected.map((f) => ({ filterId: f.id, quantity: qtyOf(f) })))
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-brand px-8 font-semibold text-white shadow-card transition hover:shadow-lift disabled:opacity-50"
            >
              {reorder.isPending ? <Loader2 className="size-4 animate-spin" /> : <ShoppingCart className="size-4" />}
              Add selected to cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}
