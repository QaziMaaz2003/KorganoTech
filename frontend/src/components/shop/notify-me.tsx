"use client";

import { useState } from "react";
import { BellRing, CheckCircle2 } from "lucide-react";
import { post } from "@/lib/client-api";
import { useMe } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const inputCls =
  "h-11 w-full rounded-xl border border-input bg-white px-3.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-3 focus:ring-brand/15";

/** "Notify me / Request info" for products that aren't purchasable yet. */
export function NotifyMe({
  productId,
  productName,
  note,
  className,
}: {
  productId?: string;
  productName: string;
  note?: string | null;
  className?: string;
}) {
  const { data: user } = useMe();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const name = form.name || (user ? `${user.firstName} ${user.lastName}` : "");
  const email = form.email || user?.email || "";

  if (state === "done") {
    return (
      <div className={cn("rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center", className)}>
        <CheckCircle2 className="mx-auto size-8 text-emerald-600" />
        <p className="mt-3 font-bold text-emerald-900">Thanks — we&apos;ll be in touch.</p>
        <p className="mt-1 text-sm text-emerald-800">
          We&apos;ll email {email} with updates about the {productName}.
        </p>
      </div>
    );
  }

  return (
    <form
      className={cn("surface-card space-y-3 p-6", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setState("busy");
        try {
          await post("/inquiries", {
            type: "PRODUCT_INTEREST",
            name,
            email,
            productId,
            message: form.message || `Please notify me when the ${productName} becomes available.`,
          });
          setState("done");
        } catch (err) {
          setError((err as Error).message);
          setState("idle");
        }
      }}
    >
      <p className="flex items-center gap-2 text-lg font-bold text-primary">
        <BellRing className="size-5 text-brand" /> Not yet available
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {note ?? "This product is not available for purchase yet."} Leave your details and we&apos;ll let you know when it
        is — or ask us anything about it.
      </p>
      <label className="block">
        <span className="sr-only">Name</span>
        <input required className={inputCls} placeholder="Name" value={name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <label className="block">
        <span className="sr-only">Email</span>
        <input required type="email" className={inputCls} placeholder="Email" value={email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </label>
      <label className="block">
        <span className="sr-only">Message (optional)</span>
        <textarea
          rows={3}
          className={cn(inputCls, "h-auto py-2.5")}
          placeholder="Message (optional) — e.g. quantities, facility type"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </label>
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      <button
        type="submit"
        disabled={state === "busy"}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-brand font-semibold text-white shadow-card transition hover:shadow-lift disabled:opacity-60"
      >
        {state === "busy" ? "Sending…" : "Notify me / Request info"}
      </button>
    </form>
  );
}
