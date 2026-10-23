"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { post } from "@/lib/client-api";
import type { Order } from "@/lib/types";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

/** An unpaid card order that can still be paid. */
export const needsPayment = (o: Pick<Order, "paymentMethod" | "paymentStatus" | "status">) =>
  o.paymentMethod === "CARD" && o.paymentStatus === "UNPAID" && o.status === "PENDING";

export function useOrderPayment(number: string) {
  const qc = useQueryClient();
  const base = `/orders/me/${encodeURIComponent(number)}`;

  /** Asks the server to check the payment with Stripe and returns the fresh order. */
  const sync = useMutation({
    mutationFn: () => post<Order>(`${base}/sync-payment`),
    onSuccess: (o) => {
      qc.setQueryData(["order", number], o);
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const payNow = useMutation({
    mutationFn: () => post<{ url?: string; paid?: boolean }>(`${base}/pay`),
    onSuccess: async (r) => {
      if (r.url) window.location.assign(r.url);
      else await sync.mutateAsync();
    },
    onError: (e: Error) => {
      toast.error(e.message);
      sync.mutate();
    },
  });

  return { sync, payNow };
}

export function PayNowButton({
  order,
  pending,
  onClick,
  className,
}: {
  order: Pick<Order, "total">;
  pending: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 text-base font-bold text-white shadow-card transition hover:shadow-lift disabled:opacity-60",
        className,
      )}
    >
      {pending ? <Loader2 className="size-5 animate-spin" /> : <CreditCard className="size-5" />}
      {pending ? "Opening secure payment…" : `Pay ${money(order.total)} by card`}
    </button>
  );
}

/** When the items for an unpaid order stop being held. */
export function holdUntil(order: Pick<Order, "paymentExpiresAt">) {
  return order.paymentExpiresAt
    ? new Date(order.paymentExpiresAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : null;
}
