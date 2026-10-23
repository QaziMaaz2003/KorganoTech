"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Building2, LayoutDashboard, LogOut, MapPin, Package, Settings, ShoppingCart } from "lucide-react";
import { useLogout, useMe } from "@/hooks/use-auth";
import { useCartStore } from "@/lib/cart-store";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "My orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/settings", label: "Account settings", icon: Settings },
];

const businessLink = { href: "/account/business", label: "Business filters", icon: Building2, exact: false };

const linkCls = (active: boolean) =>
  cn(
    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition",
    active ? "bg-gradient-brand text-white shadow-card" : "text-foreground hover:bg-accent",
  );

function NavLinks() {
  const pathname = usePathname();
  const { data: user } = useMe();
  const all = user?.business ? [...links.slice(0, 2), businessLink, ...links.slice(2)] : links;
  return (
    <>
      {all.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={linkCls(active)}>
            <Icon className="size-4.5" /> {label}
          </Link>
        );
      })}
    </>
  );
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();
  const router = useRouter();
  const openCart = useCartStore((s) => s.setDrawerOpen);

  // Render the layout immediately; pages show their own skeletons while loading.
  if (!isLoading && !user) {
    return (
      <div className="container-page flex flex-col items-center py-20 text-center">
        <h1 className="text-2xl font-extrabold text-primary">Please sign in</h1>
        <p className="mt-2 text-muted-foreground">Sign in to see your orders, cart and saved addresses.</p>
        <ButtonLink href="/login?next=/account" className="mt-6">Sign in</ButtonLink>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[250px_1fr]">
      <aside className="lg:sticky lg:top-36 lg:self-start">
        <div className="surface-card p-4">
          <div className="flex items-center gap-3 border-b border-lavender px-1 pb-4">
            {user ? (
              <>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-brand font-bold text-white">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-bold text-primary">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                </span>
              </>
            ) : (
              <>
                <span className="size-11 shrink-0 animate-pulse rounded-full bg-muted" aria-hidden />
                <span className="h-4 w-32 animate-pulse rounded bg-muted" aria-hidden />
              </>
            )}
          </div>
          <nav aria-label="Account" className="mt-3 flex gap-1 overflow-x-auto lg:flex-col">
            <Suspense
              fallback={links.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={linkCls(false)}>
                  <Icon className="size-4.5" /> {label}
                </Link>
              ))}
            >
              <NavLinks />
            </Suspense>
            <button type="button" onClick={() => openCart(true)} className={linkCls(false)}>
              <ShoppingCart className="size-4.5" /> My cart
            </button>
            {user?.role === "ADMIN" ? (
              <Link href="/admin" className={linkCls(false)}>
                <LayoutDashboard className="size-4.5" /> Admin dashboard
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() =>
                logout.mutate(undefined, {
                  onSettled: () => {
                    router.push("/");
                    router.refresh();
                  },
                })
              }
              className={cn(linkCls(false), "text-destructive hover:bg-destructive/10")}
            >
              <LogOut className="size-4.5" /> Sign out
            </button>
          </nav>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
