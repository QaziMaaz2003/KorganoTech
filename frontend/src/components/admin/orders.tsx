"use client";

import Link from "next/link";
import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Loader2, Mail, MapPin, Phone, ShoppingBag, Truck, User } from "lucide-react";
import { get, patch, qs } from "@/lib/client-api";
import type { AdminOrder, AdminOrderRow, Paged } from "@/lib/admin-types";
import type { OrderStatus, PaymentStatus } from "@/lib/types";
import { dateTime, money, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EmptyState, inputCls, Label, PageHeader, Pagination, Panel, SearchInput, TableSkeleton, Tabs, btn, td, th } from "./admin-ui";
import { OrderItemsTable, OrderTimeline, OrderTracker, PaymentBadge, StatusBadge } from "@/components/orders/order-ui";
import { OrderTotals } from "@/components/shop/cart-view";
import { formatAddress } from "@/components/account/address-form";
import { NativeSelect } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type StatusTab = "ALL" | OrderStatus;
const STATUS_TABS: StatusTab[] = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export function AdminOrders({ initialStatus }: { initialStatus?: string }) {
  const [status, setStatus] = useState<StatusTab>(
    STATUS_TABS.includes(initialStatus as StatusTab) ? (initialStatus as StatusTab) : "ALL",
  );
  const [payment, setPayment] = useState<"" | PaymentStatus>("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders", status, payment, q, page],
    queryFn: () =>
      get<Paged<AdminOrderRow> & { statusCounts: Partial<Record<OrderStatus, number>> }>(
        `/admin/orders${qs({ status: status === "ALL" ? null : status, paymentStatus: payment || null, q, page })}`,
      ),
    placeholderData: keepPreviousData,
  });

  const counts = data?.statusCounts ?? {};
  const all = Object.values(counts).reduce((n, c) => n + (c ?? 0), 0);

  return (
    <div>
      <PageHeader title="Orders" description="Fulfil, ship and track paid orders." />
      <div className="mb-4 space-y-3">
        <Tabs
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          items={STATUS_TABS.map((s) => ({
            value: s,
            label: s === "ALL" ? "All" : ORDER_STATUS_LABEL[s],
            count: s === "ALL" ? all : (counts[s] ?? 0),
          }))}
        />
        <div className="flex flex-wrap gap-3">
          <SearchInput
            value={q}
            onChange={(v) => {
              setQ(v);
              setPage(1);
            }}
            placeholder="Search order #, email, name, phone or tracking"
            className="min-w-64 flex-1"
          />
          <NativeSelect
            value={payment}
            onChange={(e) => {
              setPayment(e.target.value as "" | PaymentStatus);
              setPage(1);
            }}
            wrapperClassName="w-44"
            aria-label="Payment status"
          >
            <option value="">All payments</option>
            <option value="UNPAID">Awaiting payment</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </NativeSelect>
        </div>
      </div>

      <Panel bodyClassName="p-0">
        {isLoading ? (
          <TableSkeleton />
        ) : data && data.items.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="border-b border-lavender">
                  <tr>
                    <th className={th}>Order</th>
                    <th className={th}>Placed</th>
                    <th className={th}>Customer</th>
                    <th className={th}>Items</th>
                    <th className={th}>Status</th>
                    <th className={th}>Payment</th>
                    <th className={`${th} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lavender">
                  {data.items.map((o) => (
                    <tr key={o.id} className="hover:bg-accent/30">
                      <td className={td}>
                        <Link href={`/admin/orders/${o.id}`} className="font-semibold text-primary hover:underline">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className={cn(td, "whitespace-nowrap text-muted-foreground")}>{dateTime(o.placedAt)}</td>
                      <td className={td}>
                        <p className="font-medium">{o.shipFullName}</p>
                        <p className="text-xs text-muted-foreground">{o.email}</p>
                      </td>
                      <td className={cn(td, "tabular-nums")}>{o._count.items}</td>
                      <td className={td}><StatusBadge status={o.status} /></td>
                      <td className={td}><PaymentBadge status={o.paymentStatus} /></td>
                      <td className={cn(td, "text-right font-semibold tabular-nums")}>{money(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pageCount={data.pageCount} total={data.total} onPage={setPage} />
          </>
        ) : (
          <EmptyState icon={ShoppingBag} title="No orders found" body="Orders placed on the storefront appear here." />
        )}
      </Panel>
    </div>
  );
}

// ─── Order detail ────────────────────────────────────────────────────────────

const ACTION_LABEL: Record<OrderStatus, string> = {
  PENDING: "Mark pending",
  CONFIRMED: "Confirm order",
  PROCESSING: "Start processing",
  SHIPPED: "Mark as shipped",
  DELIVERED: "Mark as delivered",
  CANCELLED: "Cancel order",
};

export function AdminOrderDetail({ id }: { id: string }) {
  const qc = useQueryClient();
  const key = ["admin", "order", id];
  const { data: order, isLoading } = useQuery({ queryKey: key, queryFn: () => get<AdminOrder>(`/admin/orders/${id}`) });
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState("");
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");

  const onSaved = (o: AdminOrder) => {
    qc.setQueryData(key, o);
    qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    qc.invalidateQueries({ queryKey: ["admin", "stats"] });
  };

  const transition = useMutation({
    mutationFn: (status: OrderStatus) =>
      patch<AdminOrder>(`/admin/orders/${id}/status`, {
        status,
        note: note || undefined,
        carrier: status === "SHIPPED" ? carrier : undefined,
        trackingNumber: status === "SHIPPED" ? tracking : undefined,
      }),
    onSuccess: (o) => {
      onSaved(o);
      setPending(null);
      setNote("");
      toast.success(`Order ${o.orderNumber} is now ${ORDER_STATUS_LABEL[o.status].toLowerCase()}.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const payment = useMutation({
    mutationFn: (paymentStatus: PaymentStatus) => patch<AdminOrder>(`/admin/orders/${id}/payment`, { paymentStatus }),
    onSuccess: (o) => {
      onSaved(o);
      toast.success("Payment status updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !order) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  const openAction = (s: OrderStatus) => {
    setCarrier(order.carrier ?? "");
    setTracking(order.trackingNumber ?? "");
    setNote("");
    setPending(s);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            Order {order.orderNumber}
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
          </span>
        }
        description={`Placed ${dateTime(order.placedAt)} · ${PAYMENT_METHOD_LABEL[order.paymentMethod]}`}
        actions={order.allowedTransitions.map((s) => (
          <button key={s} type="button" className={s === "CANCELLED" ? btn.danger : btn.primary} onClick={() => openAction(s)}>
            {ACTION_LABEL[s]}
          </button>
        ))}
      />

      <Panel>
        <OrderTracker order={order} />
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Panel title={`Items (${order.items.length})`} bodyClassName="px-5 py-0">
            <OrderItemsTable order={order} />
            <div className="border-t border-lavender py-4">
              <OrderTotals cart={order} />
            </div>
          </Panel>
          <Panel title="History">
            <OrderTimeline history={order.history} showActor />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Customer">
            {order.user ? (
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 font-semibold">
                  <User className="size-4 text-brand" />
                  <Link href={`/admin/customers/${order.user.id}`} className="hover:underline">
                    {order.user.firstName} {order.user.lastName}
                  </Link>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" /> {order.user.email}</p>
                <p className="text-xs text-muted-foreground">{order.user._count.orders} order(s) in total</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Customer account deleted · {order.email}</p>
            )}
          </Panel>
          <Panel title="Ship to">
            <div className="space-y-1.5 text-sm">
              <p className="font-semibold">{order.shipFullName}</p>
              <p className="flex gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {formatAddress({ line1: order.shipLine1, line2: order.shipLine2, city: order.shipCity, state: order.shipState, postalCode: order.shipPostalCode, country: order.shipCountry })}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" /> <a href={`tel:${order.shipPhone}`} className="hover:underline">{order.shipPhone}</a>
              </p>
              {order.customerNote ? <p className="mt-3 rounded-lg bg-amber-50 p-3 text-amber-900">“{order.customerNote}”</p> : null}
            </div>
          </Panel>
          <Panel title="Payment">
            <p className="flex items-center gap-2 text-sm">
              <CreditCard className="size-4 text-brand" /> {PAYMENT_METHOD_LABEL[order.paymentMethod]} · <span className="font-semibold">{money(order.total)}</span>
            </p>
            {order.stripePaymentIntentId ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Stripe payment <span className="font-mono">{order.stripePaymentIntentId}</span>
              </p>
            ) : null}
            <label className="mt-4 block">
              <Label hint={order.paidAt ? `Paid ${dateTime(order.paidAt)}` : undefined}>Payment status</Label>
              <NativeSelect
                value={order.paymentStatus}
                disabled={payment.isPending}
                onChange={(e) => payment.mutate(e.target.value as PaymentStatus)}
              >
                <option value="UNPAID">{order.paymentMethod === "COD" ? "Unpaid — collect on delivery" : "Awaiting payment"}</option>
                <option value="PAID">{order.paymentMethod === "COD" ? "Paid — cash collected" : "Paid"}</option>
                <option value="REFUNDED">Refunded</option>
              </NativeSelect>
            </label>
            <p className="mt-2 text-xs text-muted-foreground">
              {order.paymentMethod === "COD"
                ? "Marking an order delivered sets it to paid automatically."
                : "Card payments are marked paid automatically when Stripe confirms them. Changing this by hand does not move money; use Stripe for manual refunds."}
            </p>
          </Panel>
          <TrackingForm key={`${order.id}:${order.carrier}:${order.trackingNumber}`} order={order} onSaved={onSaved} />
        </div>
      </div>

      <Dialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pending ? ACTION_LABEL[pending] : ""} — {order.orderNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {pending === "SHIPPED" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <Label>Carrier</Label>
                  <input className={inputCls} value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="UPS" />
                </label>
                <label>
                  <Label>Tracking number</Label>
                  <input className={inputCls} value={tracking} onChange={(e) => setTracking(e.target.value)} />
                </label>
              </div>
            ) : null}
            {pending === "CANCELLED" ? (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                Cancelling returns every item&apos;s quantity to stock
                {order.paymentMethod === "CARD" && order.paymentStatus === "PAID" ? " and refunds the customer's card automatically" : ""}.
              </p>
            ) : null}
            {pending === "DELIVERED" && order.paymentStatus === "UNPAID" && order.paymentMethod === "COD" ? (
              <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">The order will also be marked as paid (cash collected).</p>
            ) : null}
            <label className="block">
              <Label hint="Shown to the customer in their order history">Note (optional)</Label>
              <textarea rows={3} className={cn(inputCls, "h-auto py-2")} value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
          </div>
          <DialogFooter>
            <button type="button" className={btn.secondary} onClick={() => setPending(null)}>Back</button>
            <button
              type="button"
              className={pending === "CANCELLED" ? btn.danger : btn.primary}
              disabled={transition.isPending}
              onClick={() => pending && transition.mutate(pending)}
            >
              {transition.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {pending ? ACTION_LABEL[pending] : ""}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TrackingForm({ order, onSaved }: { order: AdminOrder; onSaved: (o: AdminOrder) => void }) {
  const [carrier, setCarrier] = useState(order.carrier ?? "");
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const save = useMutation({
    mutationFn: () => patch<AdminOrder>(`/admin/orders/${order.id}/tracking`, { carrier, trackingNumber: tracking }),
    onSuccess: (o) => {
      onSaved(o);
      toast.success("Tracking details saved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Panel title={<span className="inline-flex items-center gap-2"><Truck className="size-4" /> Shipping</span>}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <label className="block">
          <Label>Carrier</Label>
          <input className={inputCls} value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="e.g. UPS, FedEx, USPS" />
        </label>
        <label className="block">
          <Label>Tracking number</Label>
          <input className={inputCls} value={tracking} onChange={(e) => setTracking(e.target.value)} />
        </label>
        <button type="submit" className={btn.secondary} disabled={save.isPending}>
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Save tracking
        </button>
      </form>
    </Panel>
  );
}
