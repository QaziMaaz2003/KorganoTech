"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, CreditCard, Loader2, Lock, MapPin, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useMe } from "@/hooks/use-auth";
import { get, post } from "@/lib/client-api";
import type { Address, Order } from "@/lib/types";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AuthForm, Field, fieldCls } from "@/components/account/auth-form";
import { AddressFields, emptyAddress, formatAddress, type AddressInput } from "@/components/account/address-form";
import { ProductImage } from "./product-image";
import { OrderTotals } from "./cart-view";
import { ButtonLink } from "@/components/ui/button-link";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-lavender bg-white p-6 shadow-card sm:p-7">
      <h2 className="flex items-center gap-3 text-lg font-bold text-primary">
        <span className="grid size-7 place-items-center rounded-full bg-gradient-brand text-sm text-white">{n}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: user, isLoading: userLoading } = useMe();
  const { cart, isEmpty, isLoading } = useCart();

  const addresses = useQuery({
    queryKey: ["addresses"],
    queryFn: () => get<Address[]>("/account/addresses"),
    enabled: Boolean(user),
  });

  const [addressId, setAddressId] = useState<string | "new" | null>(null);
  const [address, setAddress] = useState<AddressInput>(emptyAddress);
  const [save, setSave] = useState(true);
  const [note, setNote] = useState("");

  // Default to the saved default address, or a new one prefilled from the profile.
  useEffect(() => {
    if (!addresses.data || addressId !== null) return;
    const def = addresses.data.find((a) => a.isDefault) ?? addresses.data[0];
    setAddressId(def ? def.id : "new");
  }, [addresses.data, addressId]);
  useEffect(() => {
    if (user && !address.fullName) {
      setAddress((a) => ({ ...a, fullName: `${user.firstName} ${user.lastName}`, phone: user.phone ?? "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const place = useMutation({
    mutationFn: () =>
      post<Order>("/orders", {
        paymentMethod: "COD",
        note: note || undefined,
        ...(addressId && addressId !== "new" ? { addressId } : { address, saveAddress: save }),
      }),
    onSuccess: async (order) => {
      qc.setQueryData(["order", order.orderNumber], order);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["cart"] }),
        qc.invalidateQueries({ queryKey: ["orders"] }),
        qc.invalidateQueries({ queryKey: ["addresses"] }),
      ]);
      router.push(`/order-confirmation/${order.orderNumber}`);
    },
  });

  if (userLoading) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  if (!user) {
    return (
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-lavender bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-primary">Sign in to check out</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            An account lets you track your order status and see everything you&apos;ve bought. Your cart comes with you.
          </p>
          <AuthForm mode="login" switchable onDone={() => router.refresh()} />
        </div>
        <CheckoutSummary />
      </div>
    );
  }

  if (isEmpty && !place.isPending && !place.isSuccess) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <ShoppingBag className="size-12 text-brand" />
        <h1 className="mt-4 text-2xl font-extrabold text-primary">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some filters before checking out.</p>
        <ButtonLink href="/shop" className="mt-6">Shop filters</ButtonLink>
      </div>
    );
  }

  const blocked = !cart || isLoading || cart.lines.some((l) => !l.available);

  return (
    <form
      className="grid gap-8 lg:grid-cols-[1fr_400px]"
      onSubmit={(e) => {
        e.preventDefault();
        place.mutate();
      }}
    >
      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">Checkout</h1>

        <Step n={1} title="Contact">
          <p className="text-sm">
            Ordering as <span className="font-semibold">{user.firstName} {user.lastName}</span> ({user.email})
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Order updates go to this email.</p>
        </Step>

        <Step n={2} title="Delivery address">
          {addresses.isLoading ? (
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
          ) : (
            <div className="space-y-3">
              {addresses.data?.map((a) => (
                <label
                  key={a.id}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition",
                    addressId === a.id ? "border-brand bg-accent/40" : "border-lavender hover:border-brand/40",
                  )}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={addressId === a.id}
                    onChange={() => setAddressId(a.id)}
                    className="mt-1 size-4 accent-[var(--brand)]"
                  />
                  <span className="text-sm">
                    <span className="font-semibold">
                      {a.fullName}
                      {a.label ? <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{a.label}</span> : null}
                    </span>
                    <span className="block text-muted-foreground">{formatAddress(a)}</span>
                    <span className="block text-muted-foreground">{a.phone}</span>
                  </span>
                </label>
              ))}
              {addresses.data?.length ? (
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 text-sm font-semibold transition",
                    addressId === "new" ? "border-brand bg-accent/40" : "border-lavender hover:border-brand/40",
                  )}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={addressId === "new"}
                    onChange={() => setAddressId("new")}
                    className="size-4 accent-[var(--brand)]"
                  />
                  <MapPin className="size-4 text-brand" /> Use a new address
                </label>
              ) : null}
              {addressId === "new" ? (
                <div className="space-y-4 pt-2">
                  <AddressFields value={address} onChange={setAddress} />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="size-4 accent-[var(--brand)]" />
                    Save this address to my account
                  </label>
                </div>
              ) : null}
            </div>
          )}
        </Step>

        <Step n={3} title="Payment">
          <div className="space-y-3">
            <label className="flex items-start gap-3 rounded-xl border-2 border-brand bg-accent/40 p-4">
              <input type="radio" name="payment" checked readOnly className="mt-1 size-4 accent-[var(--brand)]" />
              <span>
                <span className="flex items-center gap-2 font-semibold">
                  <Banknote className="size-4.5 text-brand" /> Cash on Delivery
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  Pay {cart ? money(cart.total) : "the order total"} in cash when your order is delivered.
                </span>
              </span>
            </label>
            <div className="flex items-start gap-3 rounded-xl border-2 border-dashed border-lavender p-4 opacity-60" aria-disabled>
              <input type="radio" disabled className="mt-1 size-4" aria-label="Card payment (coming soon)" />
              <span>
                <span className="flex items-center gap-2 font-semibold">
                  <CreditCard className="size-4.5" /> Card payment
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">Coming soon</span>
              </span>
            </div>
          </div>
        </Step>

        <Step n={4} title="Order notes (optional)">
          <Field label="Delivery instructions">
            <textarea
              rows={3}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Leave with reception, call on arrival"
              className={cn(fieldCls, "h-auto py-2.5")}
            />
          </Field>
        </Step>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
        <CheckoutSummary />
        {place.error ? (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {place.error.message}{" "}
            <Link href="/cart" className="underline">Review cart</Link>
          </p>
        ) : null}
        <button
          type="submit"
          disabled={blocked || place.isPending || !addressId}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand text-base font-bold text-white shadow-card transition hover:shadow-lift disabled:opacity-50"
        >
          {place.isPending ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-4.5" />}
          {place.isPending ? "Placing order…" : `Place order · ${cart ? money(cart.total) : ""}`}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          By placing your order you agree to our <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/shipping-returns" className="underline">Shipping &amp; Returns</Link> policy.
        </p>
      </aside>
    </form>
  );
}

function CheckoutSummary() {
  const { cart } = useCart();
  if (!cart) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
  return (
    <div className="surface-card p-6">
      <h2 className="text-lg font-bold text-primary">Order summary</h2>
      <ul className="mt-4 max-h-80 divide-y divide-lavender overflow-y-auto">
        {cart.lines.map((l) => (
          <li key={l.id} className="flex gap-3 py-3">
            <div className="relative">
              <ProductImage src={l.product?.image?.url} alt="" sizes="64px" className="size-16 rounded-xl" />
              <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">
                {l.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="line-clamp-1 font-semibold">{l.product?.name ?? "Unavailable item"}</p>
              <p className="text-xs text-muted-foreground">{l.variant?.label}</p>
              {l.issue ? <p className="text-xs font-medium text-amber-700">{l.issue}</p> : null}
            </div>
            <p className="text-sm font-semibold tabular-nums">{money(l.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-lavender pt-4">
        <OrderTotals cart={cart} />
      </div>
    </div>
  );
}
