import Link from "next/link";
import { Check, CircleDot, Package, PackageCheck, Truck, XCircle, ClipboardCheck, Clock } from "lucide-react";
import type { Order, OrderHistoryEntry, OrderStatus, PaymentStatus } from "@/lib/types";
import {
  dateTime,
  money,
  ORDER_FLOW,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_TONE,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/shop/product-image";
import { CustomFilterThumb } from "@/components/shop/custom-filter-thumb";

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", ORDER_STATUS_TONE[status], className)}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export function PaymentBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", PAYMENT_STATUS_TONE[status], className)}>
      {PAYMENT_STATUS_LABEL[status]}
    </span>
  );
}

const stepIcons: Record<OrderStatus, typeof Check> = {
  PENDING: Clock,
  CONFIRMED: ClipboardCheck,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: PackageCheck,
  CANCELLED: XCircle,
};

const stepTime = (o: Order, s: OrderStatus) =>
  s === "PENDING" ? o.placedAt : s === "CONFIRMED" ? o.confirmedAt : s === "SHIPPED" ? o.shippedAt : s === "DELIVERED" ? o.deliveredAt : null;

/** Pending → Confirmed → Processing → Shipped → Delivered progress bar. */
export function OrderTracker({ order }: { order: Order }) {
  if (order.status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-zinc-100 p-5">
        <XCircle className="size-6 text-zinc-500" />
        <div>
          <p className="font-bold text-zinc-800">This order was cancelled</p>
          <p className="text-sm text-zinc-600">{dateTime(order.cancelledAt)}</p>
        </div>
      </div>
    );
  }
  const reached = ORDER_FLOW.indexOf(order.status);
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Order progress">
      {ORDER_FLOW.map((s, i) => {
        const Icon = stepIcons[s];
        const done = i <= reached;
        const current = i === reached;
        const t = stepTime(order, s);
        return (
          <li key={s} className="relative flex flex-col items-center text-center" aria-current={current ? "step" : undefined}>
            {i > 0 ? (
              <span
                aria-hidden
                className={cn("absolute top-5 right-1/2 h-1 w-full -translate-y-1/2 rounded-full", i <= reached ? "bg-gradient-brand" : "bg-lavender")}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 grid size-10 place-items-center rounded-full border-2 transition",
                done ? "border-transparent bg-gradient-brand text-white shadow-card" : "border-lavender bg-white text-muted-foreground",
                current && "ring-4 ring-brand/20",
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className={cn("mt-2 text-xs font-semibold sm:text-sm", done ? "text-primary" : "text-muted-foreground")}>
              {ORDER_STATUS_LABEL[s]}
            </span>
            {t && done ? <span className="hidden text-[11px] text-muted-foreground sm:block">{dateTime(t)}</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function OrderItemsTable({ order, linkProducts = true }: { order: Order; linkProducts?: boolean }) {
  return (
    <ul className="divide-y divide-lavender">
      {order.items.map((i) => (
        <li key={i.id} className="flex gap-4 py-4">
          {i.isCustom ? (
            <CustomFilterThumb spec={i.customSpec} className="size-20 shrink-0 rounded-xl" />
          ) : (
            <ProductImage src={i.imageUrl} alt={i.productName} sizes="80px" className="size-20 shrink-0 rounded-xl" />
          )}
          <div className="min-w-0 flex-1">
            {linkProducts && i.productSlug ? (
              <Link href={`/products/${i.productSlug}`} className="font-semibold hover:text-brand">
                {i.productName}
              </Link>
            ) : (
              <p className="font-semibold">{i.productName}</p>
            )}
            <p className="text-sm text-muted-foreground">{i.variantLabel}</p>
            {i.isCustom ? (
              <p className="mt-1 inline-flex rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary">
                Made to order · exact size {i.customSpec ? `${i.customSpec.width}" × ${i.customSpec.height}" × ${i.customSpec.depth}"` : ""}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">SKU {i.sku}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold tabular-nums">{money(i.lineTotal)}</p>
            <p className="text-muted-foreground tabular-nums">
              {i.quantity} × {money(i.unitPrice)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function OrderTimeline({ history, showActor = false }: { history: OrderHistoryEntry[]; showActor?: boolean }) {
  return (
    <ol className="relative space-y-5 border-l-2 border-lavender pl-6">
      {[...history].reverse().map((h) => (
        <li key={h.id} className="relative">
          <span className="absolute top-0.5 -left-[33px] grid size-4 place-items-center rounded-full bg-white">
            <CircleDot className="size-4 text-brand" />
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={h.status} />
            <span className="text-xs text-muted-foreground">{dateTime(h.createdAt)}</span>
          </div>
          {h.note ? <p className="mt-1.5 text-sm">{h.note}</p> : null}
          {showActor && h.changedBy ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              by {h.changedBy.firstName} {h.changedBy.lastName}
              {h.changedBy.role === "ADMIN" ? " (admin)" : ""}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
