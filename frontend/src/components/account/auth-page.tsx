import Image from "next/image";
import { Suspense } from "react";
import { Banknote, PackageSearch, ShoppingCart } from "lucide-react";
import { AuthForm } from "./auth-form";

/** Only allow same-site relative redirects. */
export function safeNext(v: unknown) {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/account";
}

async function FormWithNext({
  mode,
  searchParams,
}: {
  mode: "login" | "register";
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  return <AuthForm mode={mode} next={safeNext(sp.next)} />;
}

export function AuthPage({
  mode,
  searchParams,
}: {
  mode: "login" | "register";
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="container-page grid items-center gap-12 py-14 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-md">
        <p className="eyebrow">{mode === "login" ? "Welcome back" : "Create your account"}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          {mode === "login" ? "Sign in to KorganoTech" : "Join KorganoTech"}
        </h1>
        <p className="mt-2 mb-8 text-muted-foreground">
          {mode === "login"
            ? "See your cart, track deliveries and review the filters you've ordered."
            : "Save your cart, check out with Cash on Delivery and track every order."}
        </p>
        <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-white" />}>
          <FormWithNext mode={mode} searchParams={searchParams} />
        </Suspense>
      </div>
      <div className="relative hidden overflow-hidden rounded-[1.75rem] bg-night p-10 text-white lg:block">
        <Image src="/images/hero-filter.jpg" alt="" fill sizes="50vw" className="object-cover opacity-30" />
        <div className="relative">
          <p className="text-2xl font-extrabold tracking-tight">Your account, your filters</p>
          <ul className="mt-8 space-y-6">
            {[
              { icon: ShoppingCart, t: "Your cart, everywhere", b: "Items you add are saved to your account across devices." },
              { icon: PackageSearch, t: "Track every order", b: "Follow each order from pending to shipped to delivered." },
              { icon: Banknote, t: "Cash on Delivery", b: "No card needed — pay the courier when your filters arrive." },
            ].map(({ icon: Icon, t, b }) => (
              <li key={t} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block font-bold">{t}</span>
                  <span className="text-sm text-white/75">{b}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
