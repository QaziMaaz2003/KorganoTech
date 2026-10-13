"use client";

import { useQuery } from "@tanstack/react-query";
import { Banknote, CheckCircle2, PackageSearch } from "lucide-react";
import { get } from "@/lib/client-api";
import type { Order } from "@/lib/types";
import { money } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button-link";
import { OrderTotals } from "@/components/shop/cart-view";
import { formatAddress } from "./address-form";

export function OrderConfirmation({ number }: { number: string }) {
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", number],
    queryFn: () => get<Order>(`/orders/me/${encodeURIComponent(number)}`),
  });

  if (isLoading) return <div className="mx-auto h-96 max-w-2xl animate-pulse rounded-2xl bg-white" />;
  if (error || !order) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-xl font-bold text-primary">We couldn&apos;t find that order</p>
        <p className="mt-2 text-muted-foreground">Sign in with the account you ordered from to see it.</p>
        <ButtonLink href="/account/orders" className="mt-6">My orders</ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-16 text-emerald-600" />
        <p className="eyebrow mt-5">Order placed</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">Thank you for your order!</h1>
        <p className="mt-3 text-muted-foreground">
          Your order <span className="font-bold text-foreground">{order.orderNumber}</span> has been received and is
          pending confirmation. You can follow its status any time from your account.
        </p>
      </div>

      <div className="mt-8 flex gap-4 rounded-2xl bg-gradient-brand p-6 text-white shadow-lift">
        <Banknote className="size-8 shrink-0" />
        <div>
          <p className="text-lg font-bold">Pay {money(order.total)} on delivery</p>
          <p className="text-sm text-white/80">Please have the exact amount ready in cash when the courier arrives.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="surface-card p-6">
          <p className="text-sm font-bold text-primary">Delivering to</p>
          <p className="mt-2 text-sm font-semibold">{order.shipFullName}</p>
          <p className="text-sm text-muted-foreground">
            {formatAddress({
              line1: order.shipLine1,
              line2: order.shipLine2,
              city: order.shipCity,
              state: order.shipState,
              postalCode: order.shipPostalCode,
              country: order.shipCountry,
            })}
          </p>
          <p className="text-sm text-muted-foreground">{order.shipPhone}</p>
        </div>
        <div className="surface-card p-6">
          <p className="text-sm font-bold text-primary">Summary</p>
          <ul className="mt-2 space-y-1 text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="truncate">
                  {i.quantity} × {i.productName} <span className="text-muted-foreground">({i.variantLabel})</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-lavender pt-3">
            <OrderTotals cart={order} />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href={`/account/orders/${order.orderNumber}`}>
          <PackageSearch className="size-4" /> Track this order
        </ButtonLink>
        <ButtonLink href="/shop" variant="outline">Continue shopping</ButtonLink>
      </div>
    </div>
  );
}
