"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, FileText, Loader2, MapPin, Send } from "lucide-react";
import { ApiError, get, post } from "@/lib/client-api";
import type { Address, BusinessLine, MyBusiness, Order } from "@/lib/types";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMe } from "@/hooks/use-auth";
import { ButtonLink } from "@/components/ui/button-link";
import { AddressFields, emptyAddress, formatAddress, type AddressInput } from "./address-form";
import { Field, fieldCls } from "./auth-form";

const BUSINESS_KEY = ["business", "me"];

function lineTitle(l: BusinessLine) {
  return `${l.size} · MERV ${l.mervRating}`;
}

export function BusinessOrder() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: user } = useMe();
  const { data, isLoading, error } = useQuery({
    queryKey: BUSINESS_KEY,
    queryFn: () => get<MyBusiness>("/business/me"),
    retry: false,
  });
  const addresses = useQuery({
    queryKey: ["addresses"],
    queryFn: () => get<Address[]>("/account/addresses"),
    enabled: Boolean(user),
  });

  // Only the user's changes are stored; everything else falls back to the saved quantity.
  const [qtyEdits, setQtyEdits] = useState<Record<string, string>>({});
  const [pickEdits, setPickEdits] = useState<Record<string, boolean>>({});
  const [chosenAddress, setAddressId] = useState<string | "new" | null>(null);
  const [address, setAddress] = useState<AddressInput>(emptyAddress);
  const [save, setSave] = useState(true);
  const [note, setNote] = useState("");

  const qtyOf = (l: BusinessLine) => {
    const raw = qtyEdits[l.id];
    if (raw === undefined) return l.quantity;
    const n = Math.floor(Number(raw));
    return Number.isFinite(n) && n > 0 ? Math.min(n, 100000) : 0;
  };
  const orderable = (l: BusinessLine) => l.unitPrice !== null;
  const isPicked = (l: BusinessLine) => orderable(l) && (pickEdits[l.id] ?? false);

  const defaultAddress = addresses.data?.find((a) => a.isDefault) ?? addresses.data?.[0];
  const addressId = chosenAddress ?? (addresses.data ? (defaultAddress?.id ?? "new") : null);
  if (user && addressId === "new" && !address.fullName) {
    // Prefill a new address from the profile once.
    setAddress((a) => ({ ...a, fullName: `${user.firstName} ${user.lastName}`, phone: user.phone ?? "" }));
  }

  const selected = (data?.filters ?? []).filter((l) => isPicked(l) && qtyOf(l) > 0);
  const total = selected.reduce((n, l) => n + (l.unitPrice ?? 0) * qtyOf(l), 0);
  const filterCount = selected.reduce((n, l) => n + qtyOf(l), 0);

  const place = useMutation({
    mutationFn: () =>
      post<Order>("/business/me/order", {
        items: selected.map((l) => ({ filterId: l.id, quantity: qtyOf(l) })),
        note: note || undefined,
        ...(addressId && addressId !== "new" ? { addressId } : { address, saveAddress: save }),
      }),
    onSuccess: async (order) => {
      qc.setQueryData(["order", order.orderNumber], order);
      await Promise.all([qc.invalidateQueries({ queryKey: ["orders"] }), qc.invalidateQueries({ queryKey: ["addresses"] })]);
      router.push(`/order-confirmation/${order.orderNumber}`);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    const notLinked = error instanceof ApiError && (error.status === 404 || error.status === 403);
    return (
      <div className="surface-card flex flex-col items-center p-10 text-center">
        <Building2 className="size-12 text-brand" />
        <h2 className="mt-4 text-xl font-extrabold text-primary">
          {notLinked ? "No business account on this login" : "We couldn't load your filters"}
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {notLinked
            ? "Business accounts are set up by our team. Request one for free and we'll add your filter sizes so you can order in a few clicks."
            : error.message}
        </p>
        {notLinked ? <ButtonLink href="/business-account" className="mt-6">Request a business account</ButtonLink> : null}
      </div>
    );
  }

  if (!data) return null;
  const { business, filters } = data;
  const anyUnpriced = filters.some((l) => !orderable(l));
  const readyToPlace = selected.length > 0 && (addressId !== "new" || (address.fullName && address.line1 && address.city && address.state && address.postalCode && address.phone));

  // Group the list by school / place for easier scanning.
  const groups = new Map<string, BusinessLine[]>();
  for (const l of filters) {
    const key = l.label ?? "Your filters";
    groups.set(key, [...(groups.get(key) ?? []), l]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">{business.name}</h1>
        <p className="mt-1 text-muted-foreground">
          Tick the filters you need and enter how many. We invoice you on delivery ({business.paymentTerms}); there is nothing to pay now.
        </p>
      </div>

      {filters.length === 0 ? (
        <div className="rounded-xl bg-muted/60 p-8 text-center text-sm text-muted-foreground">
          Your filter list isn&apos;t set up yet. Our team will add your sizes shortly, or{" "}
          <Link href="/contact" className="font-semibold text-brand hover:underline">contact us</Link> to speed things up.
        </div>
      ) : (
        <>
          {anyUnpriced ? (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              Some filters don&apos;t have a price yet and can&apos;t be ordered. Email{" "}
              <a href="mailto:Support@KorganoTech.com" className="font-semibold underline">Support@KorganoTech.com</a> and we&apos;ll confirm them.
            </p>
          ) : null}

          <div className="space-y-5">
            {[...groups.entries()].map(([group, lines]) => (
              <section key={group} className="surface-card overflow-hidden">
                <h2 className="border-b border-lavender bg-muted/40 px-5 py-3 text-sm font-bold text-primary">{group}</h2>
                <ul className="divide-y divide-lavender">
                  {lines.map((l) => {
                    const n = qtyOf(l);
                    return (
                      <li key={l.id} className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3", !orderable(l) && "opacity-60")}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${group}: ${lineTitle(l)}`}
                          className="size-5 accent-[var(--brand)]"
                          checked={isPicked(l)}
                          disabled={!orderable(l)}
                          onChange={(e) => setPickEdits((p) => ({ ...p, [l.id]: e.target.checked }))}
                        />
                        <div className="min-w-0 flex-1 basis-52">
                          <p className="font-bold text-primary">{lineTitle(l)}</p>
                          <p className="text-xs text-muted-foreground">
                            {l.sizeType === "EXACT" ? "Exact size" : "Nominal size"} · actual {l.actualSize} in
                          </p>
                          {!orderable(l) ? <p className="text-xs font-semibold text-amber-700">Price to be confirmed</p> : null}
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Qty</span>
                          <input
                            type="number"
                            min={1}
                            max={100000}
                            inputMode="numeric"
                            aria-label={`Quantity for ${group}: ${lineTitle(l)}`}
                            className="h-10 w-24 rounded-lg border border-input bg-white px-3 text-right tabular-nums outline-none focus:border-brand focus:ring-3 focus:ring-brand/15"
                            value={qtyEdits[l.id] ?? String(l.quantity)}
                            disabled={!orderable(l)}
                            onChange={(e) => setQtyEdits((q) => ({ ...q, [l.id]: e.target.value }))}
                          />
                        </label>
                        <p className="w-24 text-right text-sm text-muted-foreground tabular-nums">
                          {l.unitPrice === null ? "—" : `${money(l.unitPrice)} each`}
                        </p>
                        <p className="w-28 text-right font-bold text-primary tabular-nums">
                          {l.unitPrice === null ? "" : money(l.unitPrice * n)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          <section className="surface-card space-y-5 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary">
              <MapPin className="size-5" /> Deliver to
            </h2>
            {addresses.isLoading ? (
              <div className="h-20 animate-pulse rounded-xl bg-muted" />
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
                    <input type="radio" name="biz-address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1 size-4 accent-[var(--brand)]" />
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
                    <input type="radio" name="biz-address" checked={addressId === "new"} onChange={() => setAddressId("new")} className="size-4 accent-[var(--brand)]" />
                    <MapPin className="size-4 text-brand" /> Use a new address (for example another school)
                  </label>
                ) : null}
                {addressId === "new" ? (
                  <div className="space-y-4 pt-2">
                    <AddressFields value={address} onChange={setAddress} showLabel />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="size-4 accent-[var(--brand)]" />
                      Save this address to my account
                    </label>
                  </div>
                ) : null}
              </div>
            )}
            <Field label="Note for KorganoTech (optional)">
              <textarea rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} className={cn(fieldCls, "h-auto py-2.5")} placeholder="e.g. Deliver to building 3 by Friday" />
            </Field>
          </section>

          {place.error ? (
            <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{place.error.message}</p>
          ) : null}

          <div className="surface-card sticky bottom-4 flex flex-wrap items-center justify-between gap-4 p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-primary tabular-nums">{filterCount.toLocaleString()}</span> filters in {selected.length} line{selected.length === 1 ? "" : "s"} ·{" "}
              <span className="font-bold text-primary tabular-nums">{money(total)}</span>
              <span className="ml-2 inline-flex items-center gap-1 text-xs"><FileText className="size-3.5" /> invoiced on delivery, {business.paymentTerms}</span>
            </p>
            <button
              type="button"
              disabled={!readyToPlace || place.isPending}
              onClick={() => place.mutate()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-brand px-8 font-semibold text-white shadow-card transition hover:shadow-lift disabled:opacity-50"
            >
              {place.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Place order
            </button>
          </div>
        </>
      )}
    </div>
  );
}
