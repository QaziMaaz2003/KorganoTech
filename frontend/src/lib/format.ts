import type { InquiryType, OrderStatus, PaymentStatus } from "./types";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const money = (n: number | null | undefined) => usd.format(Number(n ?? 0));

export const date = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

export const dateTime = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

/** "16x25x1" → "16 x 25 x 1" */
export const sizeLabel = (size: string) => size.replace(/x/gi, " x ");

export const packLabel = (n: number) => (n === 1 ? "Single" : `${n}-pack`);

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

/** Tailwind classes for status pills. */
export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  CONFIRMED: "bg-sky-50 text-sky-800 ring-sky-200",
  PROCESSING: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  SHIPPED: "bg-violet-50 text-violet-800 ring-violet-200",
  DELIVERED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  CANCELLED: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid · COD",
  PAID: "Paid",
  REFUNDED: "Refunded",
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, string> = {
  UNPAID: "bg-orange-50 text-orange-800 ring-orange-200",
  PAID: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  REFUNDED: "bg-zinc-100 text-zinc-700 ring-zinc-200",
};

export const INQUIRY_TYPE_LABEL: Record<InquiryType, string> = {
  CONTACT_SALES: "Contact sales / bulk",
  FRANCHISE: "Franchise",
  PRODUCT_INTEREST: "Notify me",
  GENERAL: "General",
};

export const ORDER_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
