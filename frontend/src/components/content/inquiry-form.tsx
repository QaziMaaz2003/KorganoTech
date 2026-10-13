"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { post } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { Field, fieldCls } from "@/components/account/auth-form";
import { NativeSelect } from "@/components/ui/native-select";

const PRODUCT_TYPES = ["MERV 13", "MERV 11", "Custom Size", "Other"] as const;

/**
 * Mirrors the original korganotech.com forms:
 * - "sales": Contact Sales / Bulk Order (Name, Email, Email confirmation,
 *   Phone, Company, Product Type, Comment)
 * - "franchise": Investor / franchise form (… "Why do you want to own a franchise")
 */
export function InquiryForm({ variant }: { variant: "sales" | "franchise" }) {
  const [f, setF] = useState({
    topic: variant === "sales" ? "CONTACT_SALES" : "FRANCHISE",
    name: "",
    email: "",
    emailConfirm: "",
    phone: "",
    company: "",
    productType: "" as "" | (typeof PRODUCT_TYPES)[number],
    message: "",
    website: "",
  });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const mismatch = f.emailConfirm.length > 0 && f.email.trim().toLowerCase() !== f.emailConfirm.trim().toLowerCase();

  if (state === "done") {
    return (
      <div className="surface-card flex flex-col items-center p-10 text-center">
        <CheckCircle2 className="size-12 text-emerald-600" />
        <p className="mt-4 text-xl font-bold text-primary">Thank you — message sent.</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {variant === "sales"
            ? "Our sales team will get back to you about your order."
            : "We’ll review your application and get in touch to schedule an interview."}
        </p>
      </div>
    );
  }

  return (
    <form
      className="surface-card space-y-5 p-6 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        if (mismatch) return;
        setError(null);
        setState("busy");
        try {
          await post("/inquiries", {
            type: f.topic,
            name: f.name,
            email: f.email,
            phone: f.phone || undefined,
            company: f.company || undefined,
            productType: variant === "sales" && f.productType ? f.productType : undefined,
            message: f.message,
            website: f.website || undefined,
          });
          setState("done");
        } catch (err) {
          setError((err as Error).message);
          setState("idle");
        }
      }}
    >
      {variant === "sales" ? (
        <Field label="Topic">
          <NativeSelect size="lg" className="h-11" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>
            <option value="CONTACT_SALES">Contact Sales — bulk order</option>
            <option value="GENERAL">General question</option>
          </NativeSelect>
        </Field>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name">
          <input required autoComplete="name" className={fieldCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <Field label="Phone number">
          <input type="tel" autoComplete="tel" className={fieldCls} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        </Field>
        <Field label="Email">
          <input required type="email" autoComplete="email" className={fieldCls} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </Field>
        <Field label="Email confirmation" error={mismatch ? "Emails don't match." : null}>
          <input
            required
            type="email"
            aria-invalid={mismatch}
            className={fieldCls}
            value={f.emailConfirm}
            onChange={(e) => setF({ ...f, emailConfirm: e.target.value })}
          />
        </Field>
        {variant === "sales" ? (
          <Field label="Company" className="sm:col-span-2">
            <input autoComplete="organization" className={fieldCls} value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} />
          </Field>
        ) : null}
      </div>

      {variant === "sales" && f.topic === "CONTACT_SALES" ? (
        <fieldset>
          <legend className="text-sm font-semibold">Product Type</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRODUCT_TYPES.map((p) => (
              <label
                key={p}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition",
                  f.productType === p ? "border-brand bg-brand text-white" : "border-border bg-white hover:border-brand/50",
                )}
              >
                <input type="radio" name="productType" value={p} checked={f.productType === p} onChange={() => setF({ ...f, productType: p })} className="sr-only" />
                {p}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <Field label={variant === "sales" ? "Comment" : "Why do you want to own a franchise"}>
        <textarea
          required
          rows={6}
          maxLength={5000}
          className={cn(fieldCls, "h-auto py-2.5")}
          placeholder={
            variant === "sales"
              ? "Sizes, quantities, delivery location and timeline"
              : "Tell us about yourself, your community and your sales experience"
          }
          value={f.message}
          onChange={(e) => setF({ ...f, message: e.target.value })}
        />
      </Field>

      {/* Honeypot: hidden from people, irresistible to bots */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
        value={f.website}
        onChange={(e) => setF({ ...f, website: e.target.value })}
      />

      {error ? <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</p> : null}
      <button
        type="submit"
        disabled={state === "busy" || mismatch}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-brand px-8 font-semibold text-white shadow-card transition hover:shadow-lift disabled:opacity-60"
      >
        {state === "busy" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Send
      </button>
    </form>
  );
}
