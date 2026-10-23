"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2, PackageSearch, XCircle } from "lucide-react";
import { get } from "@/lib/client-api";
import type { Order } from "@/lib/types";
import { money } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button-link";
import { OrderTotals } from "@/components/shop/cart-view";
import { holdUntil, needsPayment, PayNowButton, useOrderPayment } from "@/components/orders/order-payment";
import { formatAddress } from "./address-form";

export function OrderConfirmation({ number }: { number: string }) {
  const params = useSearchParams();
  const returnedFromStripe = params.has("session_id");
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", number],
    queryFn: () => get<Order>(`/orders/me/${encodeURIComponent(number)}`),
  });
  const { sync, payNow } = useOrderPayment(number);

  // Coming back from Stripe: ask the server for the real payment result right away
  // rather than waiting for the webhook.
  const checked = useRef(false);
  useEffect(() => {
    if (order && needsPayment(order) && !checked.current) {
      checked.current = true;
      sync.mutate();
    }
  }, [order, sync]);

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

  const confirming = sync.isPending && needsPayment(order);
  const unpaid = needsPayment(order) && !confirming;
  const cancelled = order.status === "CANCELLED";
  const until = holdUntil(order);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        {confirming ? (
          <Loader2 className="mx-auto size-16 animate-spin text-brand" />
        ) : cancelled ? (
          <XCircle className="mx-auto size-16 text-zinc-500" />
        ) : unpaid ? (
          <Clock className="mx-auto size-16 text-amber-600" />
        ) : (
          <CheckCircle2 className="mx-auto size-16 text-emerald-600" />
        )}

        {confirming ? (
          <>
            <p className="eyebrow mt-5">One moment</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">Confirming your payment…</h1>
            <p className="mt-3 text-muted-foreground">We&apos;re checking with Stripe. This only takes a few seconds.</p>
          </>
        ) : cancelled ? (
          <>
            <p className="eyebrow mt-5">Order cancelled</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
              {order.orderNumber} was cancelled
            </h1>
            <p className="mt-3 text-muted-foreground">
              {order.paymentStatus === "REFUNDED"
                ? "Your payment has been refunded to your card."
                : "No payment was taken. You can place a new order any time."}
            </p>
          </>
        ) : unpaid ? (
          <>
            <p className="eyebrow mt-5">Payment needed</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
              {returnedFromStripe ? "We haven't received your payment yet" : "Finish paying for your order"}
            </h1>
            <p className="mt-3 text-muted-foreground">
              Order <span className="font-bold text-foreground">{order.orderNumber}</span> is saved
              {until ? ` and your items are reserved until ${until}` : ""}. Pay {money(order.total)} by card to confirm it.
              {returnedFromStripe ? " If you've just paid, give it a moment and check again." : ""}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <PayNowButton order={order} pending={payNow.isPending} onClick={() => payNow.mutate()} />
              {returnedFromStripe ? (
                <button
                  type="button"
                  onClick={() => sync.mutate()}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-white px-5 text-sm font-semibold text-primary hover:bg-accent"
                >
                  I&apos;ve paid — check again
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow mt-5">{order.paymentStatus === "PAID" ? "Payment received" : "Order placed"}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">Thank you for your order!</h1>
            <p className="mt-3 text-muted-foreground">
              Your order <span className="font-bold text-foreground">{order.orderNumber}</span>{" "}
              {order.paymentStatus === "PAID"
                ? `is confirmed — we received your payment of ${money(order.total)}.`
                : "has been received."}{" "}
              You can follow its status any time from your account.
            </p>
          </>
        )}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
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
