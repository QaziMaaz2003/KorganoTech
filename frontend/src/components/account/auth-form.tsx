"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const fieldCls =
  "h-11 w-full rounded-xl border border-input bg-white px-3.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-3 focus:ring-brand/15 aria-invalid:border-destructive";

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
      {error ? <span className="block text-xs font-medium text-destructive">{error}</span> : hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

function PasswordInput(props: React.ComponentProps<"input">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? "text" : "password"} className={cn(fieldCls, "pr-11")} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-accent"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

/** Sign-in / create-account form. `onDone` overrides the default redirect. */
export function AuthForm({
  mode,
  next = "/account",
  onDone,
  switchable = false,
}: {
  mode: "login" | "register";
  next?: string;
  onDone?: () => void;
  switchable?: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(mode);
  const login = useLogin();
  const register = useRegister();
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const busy = login.isPending || register.isPending;
  const error = (current === "login" ? login.error : register.error)?.message;

  const finish = (role: string) => {
    if (onDone) return onDone();
    router.push(role === "ADMIN" && next === "/account" ? "/admin" : next);
    router.refresh();
  };

  return (
    <div>
      {switchable ? (
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setCurrent(m)}
              className={cn(
                "rounded-lg py-2 text-sm font-semibold transition",
                current === m ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary",
              )}
            >
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (current === "login") {
            login.mutate({ email: f.email, password: f.password }, { onSuccess: ({ user }) => finish(user.role) });
          } else {
            register.mutate(
              { firstName: f.firstName, lastName: f.lastName, email: f.email, phone: f.phone || undefined, password: f.password },
              { onSuccess: ({ user }) => finish(user.role) },
            );
          }
        }}
      >
        {current === "register" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <input required autoComplete="given-name" className={fieldCls} value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} />
            </Field>
            <Field label="Last name">
              <input required autoComplete="family-name" className={fieldCls} value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} />
            </Field>
          </div>
        ) : null}
        <Field label="Email">
          <input required type="email" autoComplete="email" className={fieldCls} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </Field>
        {current === "register" ? (
          <Field label="Phone (optional)" hint="Used by the courier for Cash on Delivery.">
            <input type="tel" autoComplete="tel" className={fieldCls} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          </Field>
        ) : null}
        <Field label="Password" hint={current === "register" ? "At least 8 characters, with a letter and a number." : undefined}>
          <PasswordInput
            required
            minLength={current === "register" ? 8 : 1}
            autoComplete={current === "login" ? "current-password" : "new-password"}
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
          />
        </Field>
        {error ? (
          <p role="alert" className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand font-semibold text-white shadow-card transition hover:shadow-lift disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {current === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      {!switchable ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {current === "login" ? (
            <>
              New to KorganoTech?{" "}
              <Link href={`/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand hover:underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      ) : null}
    </div>
  );
}
