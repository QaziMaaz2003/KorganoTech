"use client";

import Link from "next/link";
import { AlertCircle, Lock, ShoppingCart, Trash2, Truck } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCartStore } from "@/lib/cart-store";
import { money } from "@/lib/format";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { QtyStepper } from "@/components/shop/qty-stepper";
import { ProductImage } from "@/components/shop/product-image";
import { CustomFilterThumb } from "@/components/shop/custom-filter-thumb";
import type { Cart } from "@/lib/types";

export function FreeShippingMeter({ cart }: { cart: Cart }) {
  if (cart.freeShippingThreshold === null) return null;
  const pct = Math.min(100, (cart.subtotal / cart.freeShippingThreshold) * 100);
  return (
    <div className="rounded-xl bg-accent/60 p-3">
      <p className="flex items-center gap-2 text-sm font-medium text-primary">
        <Truck className="size-4 text-brand" />
        {cart.freeShippingRemaining && cart.freeShippingRemaining > 0 ? (
          <>
            Add <strong>{money(cart.freeShippingRemaining)}</strong> more for free shipping
          </>
        ) : (
          <>You&apos;ve unlocked <strong>free shipping</strong></>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-gradient-brand transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CartLines({ cart, compact = false }: { cart: Cart; compact?: boolean }) {
  const { update, remove } = useCart();
  return (
    <ul className="divide-y divide-lavender">
      {cart.lines.map((line) => (
        <li key={line.id} className="flex gap-4 py-4">
          {line.isCustom ? (
            <CustomFilterThumb
              spec={line.custom}
              className={compact ? "size-20 shrink-0 rounded-xl" : "size-24 shrink-0 rounded-xl"}
            />
          ) : (
            <ProductImage
              src={line.product?.image?.url}
              alt={line.product?.name ?? "Product"}
              sizes="96px"
              className={compact ? "size-20 shrink-0 rounded-xl" : "size-24 shrink-0 rounded-xl"}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {line.product?.slug ? (
                  <Link href={`/products/${line.product.slug}`} className="line-clamp-2 font-semibold text-foreground hover:text-brand">
                    {line.product.name}
                  </Link>
                ) : line.product ? (
                  <p className="line-clamp-2 font-semibold text-foreground">{line.product.name}</p>
                ) : (
                  <p className="font-semibold text-muted-foreground">Unavailable item</p>
                )}
                {line.variant ? <p className="mt-0.5 text-sm text-muted-foreground">{line.variant.label}</p> : null}
              </div>
              <p className="shrink-0 font-semibold tabular-nums">{money(line.lineTotal)}</p>
            </div>
            {line.issue ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                <AlertCircle className="size-3.5" /> {line.issue}
              </p>
            ) : null}
            <div className="mt-3 flex items-center justify-between gap-2">
              {line.available ? (
                <QtyStepper
                  size="sm"
                  value={line.quantity}
                  max={Math.max(1, line.maxQuantity)}
                  disabled={update.isPending}
                  onChange={(q) => update.mutate({ lineId: line.id, quantity: q })}
                />
              ) : (
                <span className="text-xs text-muted-foreground">Remove to continue</span>
              )}
              <button
                type="button"
                onClick={() => remove.mutate(line.id)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            </div>
            {!compact ? (
              <p className="mt-2 text-xs text-muted-foreground">{money(line.unitPrice)} each pack</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CartDrawer() {
  const open = useCartStore((s) => s.drawerOpen);
  const setOpen = useCartStore((s) => s.setDrawerOpen);
  const { cart, count, isEmpty, isLoading } = useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-lavender p-5">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-primary">
            <ShoppingCart className="size-5" /> Your cart
            <span className="text-sm font-medium text-muted-foreground">({count})</span>
          </SheetTitle>
        </SheetHeader>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-accent text-primary">
              <ShoppingCart className="size-7" />
            </div>
            <p className="text-lg font-bold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Find the right filter for your HVAC system by size or MERV rating.</p>
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-card"
            >
              Shop filters
            </Link>
          </div>
        ) : !cart || isLoading ? (
          <div className="space-y-4 p-5">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="flex gap-4">
                <div className="size-20 animate-pulse rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <div className="pt-4">
                <FreeShippingMeter cart={cart} />
              </div>
              <CartLines cart={cart} compact />
            </div>
            <SheetFooter className="gap-3 border-t border-lavender bg-muted/40 p-5">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold tabular-nums">{money(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold tabular-nums">
                    {cart.shippingFee === 0 ? "Free" : money(cart.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-lavender pt-2 text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-bold tabular-nums">{money(cart.total)}</span>
                </div>
              </div>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="size-4 text-brand" /> Secure card payment — you&apos;ll pay on the next step.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-border bg-white py-3 text-center text-sm font-semibold text-primary transition hover:bg-accent"
                >
                  View cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-gradient-brand py-3 text-center text-sm font-semibold text-white shadow-card transition hover:shadow-lift"
                >
                  Checkout
                </Link>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
