"use client";

import Link from "next/link";
import { ArrowRight, Banknote, Lock, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { money } from "@/lib/format";
import { CartLines, FreeShippingMeter } from "@/components/site/cart-drawer";
import { ButtonLink } from "@/components/ui/button-link";
import type { Cart } from "@/lib/types";

export function OrderTotals({ cart }: { cart: Pick<Cart, "subtotal" | "shippingFee" | "tax" | "total"> }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="font-semibold tabular-nums">{money(cart.subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Shipping</dt>
        <dd className="font-semibold tabular-nums">{cart.shippingFee === 0 ? "Free" : money(cart.shippingFee)}</dd>
      </div>
      {cart.tax > 0 ? (
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tax</dt>
          <dd className="font-semibold tabular-nums">{money(cart.tax)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between border-t border-lavender pt-3 text-base">
        <dt className="font-bold">Total</dt>
        <dd className="text-xl font-extrabold text-primary tabular-nums">{money(cart.total)}</dd>
      </div>
    </dl>
  );
}

export function CartView() {
  const { cart, isEmpty, isLoading, count } = useCart();

  if (isEmpty) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-accent text-primary">
          <ShoppingCart className="size-9" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-primary">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Find your filter by size, depth or MERV rating.</p>
        <div className="mt-6 flex gap-3">
          <ButtonLink href="/shop">Shop filters</ButtonLink>
          <ButtonLink href="/#find-your-size" variant="outline">Find my size</ButtonLink>
        </div>
      </div>
    );
  }

  if (!cart || isLoading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-white" aria-busy />;
  }

  const blocked = cart.lines.some((l) => !l.available);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          Your cart <span className="text-lg font-semibold text-muted-foreground">({count} items)</span>
        </h1>
        <div className="mt-6 rounded-2xl border border-lavender bg-white px-5 shadow-card sm:px-6">
          <CartLines cart={cart} />
        </div>
        <Link href="/shop" className="mt-4 inline-flex text-sm font-semibold text-brand hover:underline">
          ← Continue shopping
        </Link>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
        <div className="surface-card space-y-5 p-6">
          <h2 className="text-lg font-bold text-primary">Order summary</h2>
          <FreeShippingMeter cart={cart} />
          <OrderTotals cart={cart} />
          {blocked ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Remove unavailable items to continue.
            </p>
          ) : null}
          <ButtonLink
            href={blocked ? "#" : "/checkout"}
            aria-disabled={blocked}
            className={blocked ? "pointer-events-none w-full opacity-50" : "w-full"}
            size="lg"
          >
            Proceed to checkout <ArrowRight className="size-4" />
          </ButtonLink>
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5" /> Prices and stock are confirmed at checkout
          </p>
        </div>
        <div className="flex gap-3 rounded-2xl bg-accent/60 p-4 text-sm">
          <Banknote className="size-5 shrink-0 text-brand" />
          <p>
            <span className="font-semibold text-primary">Cash on Delivery.</span>{" "}
            <span className="text-muted-foreground">Pay the courier when your order arrives — no card needed.</span>
          </p>
        </div>
      </aside>
    </div>
  );
}
