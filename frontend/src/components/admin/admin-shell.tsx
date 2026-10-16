"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Boxes,
  ExternalLink,
  FolderTree,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useLogout, useMe } from "@/hooks/use-auth";
import { get } from "@/lib/client-api";
import type { AdminStats } from "@/lib/admin-types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, badge: "pending" as const },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes, badge: "lowStock" as const },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, badge: "newInquiries" as const },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const itemCls = (active: boolean) =>
  cn(
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
    active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
  );

function NavItems({ badges, onNavigate }: { badges?: AdminStats["totals"]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {nav.map(({ href, label, icon: Icon, exact, badge }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const count = badge && badges ? badges[badge] : 0;
        return (
          <Link key={href} href={href} onClick={onNavigate} className={itemCls(active)}>
            <Icon className="size-4.5" />
            <span className="flex-1">{label}</span>
            {count ? (
              <span className="rounded-full bg-[oklch(80%_0.1_298)] px-2 py-0.5 text-[11px] font-bold text-night tabular-nums">{count}</span>
            ) : null}
          </Link>
        );
      })}
    </>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { data } = useQuery({ queryKey: ["admin", "stats"], queryFn: () => get<AdminStats>("/admin/stats"), staleTime: 30_000 });
  return (
    <div className="flex h-full flex-col bg-night p-4 text-white">
      <Link href="/admin" className="mb-6 flex items-center gap-3 rounded-xl bg-white px-3 py-2" onClick={onNavigate}>
        <Image src="/images/korganotech-logo.png" alt="KorganoTech" width={912} height={200} className="h-10 w-auto" />
      </Link>
      <p className="mb-2 px-3 text-[11px] font-bold tracking-[0.18em] text-white/40 uppercase">Store admin</p>
      <nav aria-label="Admin" className="flex flex-1 flex-col gap-1">
        <Suspense
          fallback={nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={itemCls(false)}>
              <Icon className="size-4.5" /> {label}
            </Link>
          ))}
        >
          <NavItems badges={data?.totals} onNavigate={onNavigate} />
        </Suspense>
      </nav>
      <Link href="/" target="_blank" className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white">
        <ExternalLink className="size-4" /> View store
      </Link>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // The layout renders straight away (pages show their own skeletons); the
  // proxy has already screened the role claim and the API enforces it.
  if (!isLoading && (!user || user.role !== "ADMIN")) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gradient-hero p-6 text-center">
        <ShieldAlert className="size-12 text-brand" />
        <h1 className="text-2xl font-extrabold text-primary">Admins only</h1>
        <p className="max-w-sm text-muted-foreground">Sign in with an administrator account to manage the store.</p>
        <ButtonLink href="/login?next=/admin">Sign in</ButtonLink>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[oklch(97.5%_0.008_300)] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden bg-night lg:block">
        <div className="sticky top-0 h-dvh">
          <Sidebar />
        </div>
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0" showCloseButton={false}>
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
          </SheetHeader>
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-lavender bg-white/90 px-4 backdrop-blur sm:px-6">
          <button type="button" aria-label="Open navigation" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-lg hover:bg-accent lg:hidden">
            <Menu className="size-5" />
          </button>
          {user ? (
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-semibold text-foreground">{user.firstName} {user.lastName}</span>
            </p>
          ) : (
            <span className="h-4 w-40 animate-pulse rounded bg-muted" aria-hidden />
          )}
          <button
            type="button"
            onClick={() =>
              logout.mutate(undefined, {
                onSettled: () => {
                  router.push("/login");
                  router.refresh();
                },
              })
            }
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-primary"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </header>
        <main className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
