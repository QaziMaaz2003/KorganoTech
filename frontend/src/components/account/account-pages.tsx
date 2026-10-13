"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Banknote, Loader2, MapPin, Package, PackageCheck, Pencil, Plus, ShoppingCart, Star, Trash2, Truck, Wallet } from "lucide-react";
import { del, get, patch, post } from "@/lib/client-api";
import type { Address, Order, OrderSummary, User } from "@/lib/types";
import { date, money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMe, ME_KEY } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useCartStore } from "@/lib/cart-store";
import { ButtonLink } from "@/components/ui/button-link";
import { OrderItemsTable, OrderTimeline, OrderTracker, PaymentBadge, StatusBadge } from "@/components/orders/order-ui";
import { OrderTotals } from "@/components/shop/cart-view";
import { ProductImage } from "@/components/shop/product-image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddressFields, emptyAddress, formatAddress, type AddressInput } from "./address-form";
import { Field, fieldCls } from "./auth-form";

type Filter = "all" | "active" | "delivered" | "cancelled" | "paid";

function useMyOrders(status: Filter = "all") {
  return useQuery({
    queryKey: ["orders", "mine", status],
    queryFn: () => get<OrderSummary[]>(`/orders/me${status === "all" ? "" : `?status=${status}`}`),
  });
}

function PageTitle({ title, body }: { title: string; body?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-primary">{title}</h1>
      {body ? <p className="mt-1 text-muted-foreground">{body}</p> : null}
    </div>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────

export function AccountOverview() {
  const { data: user } = useMe();
  const { data: orders = [], isLoading } = useMyOrders();
  const { cart, count } = useCart();
  const openCart = useCartStore((s) => s.setDrawerOpen);

  const active = orders.filter((o) => ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(o.status));
  const delivered = orders.filter((o) => o.status === "DELIVERED");
  const paidTotal = orders.filter((o) => o.paymentStatus === "PAID").reduce((n, o) => n + o.total, 0);

  const stats = [
    { label: "Orders in progress", value: active.length, icon: Truck },
    { label: "Delivered", value: delivered.length, icon: PackageCheck },
    { label: "Total paid", value: money(paidTotal), icon: Wallet },
    { label: "Items in cart", value: count, icon: ShoppingCart },
  ];

  return (
    <div className="space-y-8">
      <PageTitle title={`Hi, ${user?.firstName ?? ""}`} body="Here's what's happening with your KorganoTech orders." />
      <ul className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <li key={label} className="surface-card p-5">
            <Icon className="size-5 text-brand" />
            <p className="mt-3 text-2xl font-extrabold text-primary tabular-nums">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </li>
        ))}
      </ul>

      <section className="surface-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">Recent orders</h2>
          <Link href="/account/orders" className="text-sm font-semibold text-brand hover:underline">View all</Link>
        </div>
        {isLoading ? (
          <div className="mt-4 h-32 animate-pulse rounded-xl bg-muted" />
        ) : orders.length ? (
          <ul className="mt-4 divide-y divide-lavender">
            {orders.slice(0, 4).map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-xl bg-muted/60 p-6 text-center text-sm text-muted-foreground">
            You haven&apos;t placed any orders yet.{" "}
            <Link href="/shop" className="font-semibold text-brand hover:underline">Start shopping</Link>
          </div>
        )}
      </section>

      <section className="surface-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">Your cart</h2>
          {count ? (
            <button type="button" onClick={() => openCart(true)} className="text-sm font-semibold text-brand hover:underline">
              Open cart
            </button>
          ) : null}
        </div>
        {cart && cart.lines.length ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex -space-x-3">
              {cart.lines.slice(0, 5).map((l) => (
                <ProductImage key={l.id} src={l.product?.image?.url} alt="" sizes="56px" className="size-14 rounded-xl ring-2 ring-white" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {count} item{count === 1 ? "" : "s"} · <span className="font-semibold text-foreground">{money(cart.total)}</span>
            </p>
            <ButtonLink href="/checkout" size="sm">Checkout <ArrowRight className="size-4" /></ButtonLink>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Your cart is empty.</p>
        )}
      </section>
    </div>
  );
}

function OrderRow({ order: o }: { order: OrderSummary }) {
  return (
    <li>
      <Link href={`/account/orders/${o.orderNumber}`} className="flex flex-wrap items-center gap-4 py-4 transition hover:bg-accent/30 sm:flex-nowrap">
        <div className="flex -space-x-2">
          {(o.previewImages.length ? o.previewImages : [null]).slice(0, 3).map((src, i) => (
            <ProductImage key={i} src={src} alt="" sizes="48px" className="size-12 rounded-lg ring-2 ring-white" />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{o.orderNumber}</p>
          <p className="truncate text-sm text-muted-foreground">
            {date(o.placedAt)} · {o.itemCount} item{o.itemCount === 1 ? "" : "s"}
            {o.firstItemName ? ` · ${o.firstItemName}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={o.status} />
          <PaymentBadge status={o.paymentStatus} />
        </div>
        <p className="w-24 text-right font-bold tabular-nums">{money(o.total)}</p>
      </Link>
    </li>
  );
}

// ─── Orders list ─────────────────────────────────────────────────────────────

const tabs: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "In progress" },
  { key: "delivered", label: "Delivered" },
  { key: "paid", label: "Paid" },
  { key: "cancelled", label: "Cancelled" },
];

export function MyOrders() {
  const [tab, setTab] = useState<Filter>("all");
  const { data: orders = [], isLoading } = useMyOrders(tab);
  return (
    <div>
      <PageTitle title="My orders" body="Track deliveries and review everything you've ordered." />
      <div role="tablist" className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-card">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition",
              tab === t.key ? "bg-gradient-brand text-white" : "text-muted-foreground hover:bg-accent hover:text-primary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-lavender bg-white px-5 shadow-card">
        {isLoading ? (
          <div className="my-5 h-40 animate-pulse rounded-xl bg-muted" />
        ) : orders.length ? (
          <ul className="divide-y divide-lavender">
            {orders.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center py-14 text-center">
            <Package className="size-10 text-brand" />
            <p className="mt-3 font-bold text-primary">No orders here yet</p>
            <ButtonLink href="/shop" className="mt-5" size="sm">Shop filters</ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Order detail ────────────────────────────────────────────────────────────

export function MyOrderDetail({ number }: { number: string }) {
  const qc = useQueryClient();
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", number],
    queryFn: () => get<Order>(`/orders/me/${encodeURIComponent(number)}`),
  });
  const cancel = useMutation({
    mutationFn: () => post<Order>(`/orders/me/${encodeURIComponent(number)}/cancel`),
    onSuccess: (o) => {
      qc.setQueryData(["order", number], o);
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Your order was cancelled.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;
  if (error || !order) {
    return (
      <div className="py-16 text-center">
        <p className="text-xl font-bold text-primary">Order not found</p>
        <ButtonLink href="/account/orders" className="mt-5">Back to my orders</ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/account/orders" className="text-sm font-semibold text-brand hover:underline">← My orders</Link>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-primary">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Placed {date(order.placedAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.status} className="text-sm" />
          <PaymentBadge status={order.paymentStatus} className="text-sm" />
        </div>
      </div>

      <section className="surface-card p-6">
        <OrderTracker order={order} />
        {order.trackingNumber || order.carrier ? (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-accent/60 p-4 text-sm">
            <Truck className="size-5 text-brand" />
            <span>
              Shipped with <span className="font-semibold">{order.carrier ?? "our courier"}</span>
              {order.trackingNumber ? (
                <>
                  {" "}· Tracking number <span className="font-mono font-semibold">{order.trackingNumber}</span>
                </>
              ) : null}
            </span>
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="surface-card px-6 py-2">
          <h2 className="pt-4 text-lg font-bold text-primary">Items</h2>
          <OrderItemsTable order={order} />
        </section>
        <div className="space-y-6">
          <section className="surface-card p-6">
            <h2 className="text-lg font-bold text-primary">Payment</h2>
            <p className="mt-3 flex items-center gap-2 text-sm">
              <Banknote className="size-4.5 text-brand" /> Cash on Delivery
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.paymentStatus === "PAID"
                ? `Paid ${date(order.paidAt)}`
                : order.status === "CANCELLED"
                  ? "No payment due"
                  : `Pay ${money(order.total)} in cash on delivery`}
            </p>
            <div className="mt-4 border-t border-lavender pt-4">
              <OrderTotals cart={order} />
            </div>
          </section>
          <section className="surface-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary">
              <MapPin className="size-4.5" /> Delivery address
            </h2>
            <p className="mt-3 text-sm font-semibold">{order.shipFullName}</p>
            <p className="text-sm text-muted-foreground">
              {formatAddress({ line1: order.shipLine1, line2: order.shipLine2, city: order.shipCity, state: order.shipState, postalCode: order.shipPostalCode, country: order.shipCountry })}
            </p>
            <p className="text-sm text-muted-foreground">{order.shipPhone}</p>
            {order.customerNote ? <p className="mt-3 rounded-lg bg-muted p-3 text-sm">“{order.customerNote}”</p> : null}
          </section>
        </div>
      </div>

      <section className="surface-card p-6">
        <h2 className="mb-5 text-lg font-bold text-primary">Order history</h2>
        <OrderTimeline history={order.history} />
      </section>

      {order.status === "PENDING" ? (
        <AlertDialog>
          <AlertDialogTrigger className="text-sm font-semibold text-destructive hover:underline">Cancel this order</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel order {order.orderNumber}?</AlertDialogTitle>
              <AlertDialogDescription>
                This can&apos;t be undone. Orders can be cancelled online until they are confirmed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep order</AlertDialogCancel>
              <AlertDialogAction onClick={() => cancel.mutate()} className="bg-destructive text-white hover:bg-destructive/90">
                {cancel.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Cancel order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}

// ─── Addresses ───────────────────────────────────────────────────────────────

export function MyAddresses() {
  const qc = useQueryClient();
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => get<Address[]>("/account/addresses"),
  });
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [form, setForm] = useState<AddressInput>(emptyAddress);

  const save = useMutation({
    mutationFn: () =>
      editing && editing !== "new"
        ? patch<Address>(`/account/addresses/${editing.id}`, form)
        : post<Address>("/account/addresses", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
      setEditing(null);
      toast.success("Address saved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del(`/account/addresses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const makeDefault = useMutation({
    mutationFn: (id: string) => patch(`/account/addresses/${id}`, { isDefault: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });

  const open = (a: Address | "new") => {
    setEditing(a);
    setForm(
      a === "new"
        ? emptyAddress
        : { label: a.label ?? "", fullName: a.fullName, phone: a.phone, line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state, postalCode: a.postalCode, country: a.country },
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle title="Addresses" body="Saved delivery addresses for faster checkout." />
        <button type="button" onClick={() => open("new")} className="mb-6 inline-flex h-10 items-center gap-2 rounded-full bg-gradient-brand px-5 text-sm font-semibold text-white shadow-card">
          <Plus className="size-4" /> Add address
        </button>
      </div>
      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white" />
      ) : addresses.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className={cn("surface-card p-5", a.isDefault && "ring-2 ring-brand")}>
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold">
                  {a.fullName}
                  {a.label ? <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{a.label}</span> : null}
                </p>
                {a.isDefault ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                    <Star className="size-3 fill-current" /> Default
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{formatAddress(a)}</p>
              <p className="text-sm text-muted-foreground">{a.phone}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <button type="button" onClick={() => open(a)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-primary hover:bg-accent">
                  <Pencil className="size-3.5" /> Edit
                </button>
                {!a.isDefault ? (
                  <button type="button" onClick={() => makeDefault.mutate(a.id)} className="rounded-lg px-2 py-1 font-semibold text-primary hover:bg-accent">
                    Make default
                  </button>
                ) : null}
                <button type="button" onClick={() => remove.mutate(a.id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-destructive hover:bg-destructive/10">
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          No saved addresses yet. Addresses you use at checkout can be saved here.
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Add address" : "Edit address"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
            className="space-y-5"
          >
            <AddressFields value={form} onChange={setForm} showLabel />
            <button type="submit" disabled={save.isPending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand font-semibold text-white disabled:opacity-60">
              {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Save address
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Settings ────────────────────────────────────────────────────────────────

export function AccountSettings() {
  const qc = useQueryClient();
  const { data: user } = useMe();
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; phone: string } | null>(null);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });

  const p = profile ?? { firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", phone: user?.phone ?? "" };

  const saveProfile = useMutation({
    mutationFn: () => patch<{ user: User }>("/account/profile", p),
    onSuccess: ({ user: u }) => {
      qc.setQueryData(ME_KEY, u);
      setProfile(null);
      toast.success("Profile updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const changePw = useMutation({
    mutationFn: () => post("/account/password", pw),
    onSuccess: () => {
      setPw({ currentPassword: "", newPassword: "" });
      toast.success("Password changed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageTitle title="Account settings" />
      <form
        className="surface-card space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          saveProfile.mutate();
        }}
      >
        <h2 className="text-lg font-bold text-primary">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input required className={fieldCls} value={p.firstName} onChange={(e) => setProfile({ ...p, firstName: e.target.value })} />
          </Field>
          <Field label="Last name">
            <input required className={fieldCls} value={p.lastName} onChange={(e) => setProfile({ ...p, lastName: e.target.value })} />
          </Field>
          <Field label="Email" hint="Contact us to change your email address.">
            <input disabled className={cn(fieldCls, "bg-muted")} value={user?.email ?? ""} />
          </Field>
          <Field label="Phone">
            <input type="tel" className={fieldCls} value={p.phone} onChange={(e) => setProfile({ ...p, phone: e.target.value })} />
          </Field>
        </div>
        <button type="submit" disabled={saveProfile.isPending || !profile} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-brand px-6 text-sm font-semibold text-white disabled:opacity-50">
          {saveProfile.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Save changes
        </button>
      </form>

      <form
        className="surface-card space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          changePw.mutate();
        }}
      >
        <h2 className="text-lg font-bold text-primary">Change password</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Current password">
            <input required type="password" autoComplete="current-password" className={fieldCls} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </Field>
          <Field label="New password" hint="At least 8 characters, with a letter and a number.">
            <input required type="password" minLength={8} autoComplete="new-password" className={fieldCls} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </Field>
        </div>
        <button type="submit" disabled={changePw.isPending} className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-6 text-sm font-semibold text-primary hover:bg-accent disabled:opacity-50">
          {changePw.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Update password
        </button>
      </form>
    </div>
  );
}
