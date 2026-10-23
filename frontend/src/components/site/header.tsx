"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MapPin,
  Mail,
  Menu,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";
import { Logo } from "./logo";
import { useCart } from "@/hooks/use-cart";
import { useLogout, useMe } from "@/hooks/use-auth";
import { useFilterSizes, useStoreSettings } from "@/hooks/use-store-data";
import { DEPTHS, groupByWidth, shopSizeHref, sizesForDepth } from "@/lib/sizes";
import { brand, mainNav, technologyNav } from "@/lib/site";
import { money } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type MenuKey = "sizes" | "merv" | "technology" | null;

export function AnnouncementBar() {
  const { data } = useStoreSettings();
  const text =
    data?.announcement ??
    "Free shipping on orders over $75";
  return (
    <div className="bg-gradient-brand text-primary-foreground">
      <p className="container-page flex h-9 items-center justify-center gap-2 text-center text-xs font-medium tracking-wide sm:text-[13px]">
        <Sparkles className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">{text}</span>
      </p>
    </div>
  );
}

function SearchBox({ className, onDone }: { className?: string; onDone?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
        onDone?.();
      }}
    >
      <label htmlFor="site-search" className="sr-only">
        Search filters by size
      </label>
      <input
        id="site-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by size, e.g. 16x25x1"
        className="h-11 w-full rounded-xl border border-input bg-white pr-12 pl-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-3 focus:ring-brand/15"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-primary"
      >
        <Search className="size-4.5" />
      </button>
    </form>
  );
}

function AccountMenu() {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();
  const router = useRouter();

  if (isLoading) {
    return <span className="h-9 w-20 animate-pulse rounded-lg bg-muted" aria-hidden />;
  }
  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-primary transition hover:bg-accent"
      >
        <UserRound className="size-4.5" />
        <span className="hidden xl:inline">Log in</span>
      </Link>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-primary outline-none transition hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40">
        <span className="grid size-7 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">
          {user.firstName[0]}
          {user.lastName[0]}
        </span>
        <span className="hidden max-w-28 truncate xl:inline">{user.firstName}</span>
        <ChevronDown className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">
            {user.firstName} {user.lastName}
            <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {user.role === "ADMIN" ? (
          <DropdownMenuItem onClick={() => router.push("/admin")}>
            <LayoutDashboard /> Admin dashboard
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={() => router.push("/account")}>
          <UserRound /> My account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/account/orders")}>
          <Package /> My orders
        </DropdownMenuItem>
        {user.business ? (
          <DropdownMenuItem onClick={() => router.push("/account/business")}>
            <Building2 /> Business filters
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            logout.mutate(undefined, {
              onSettled: () => {
                router.push("/");
                router.refresh();
              },
            })
          }
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CartButton({ compact = false }: { compact?: boolean }) {
  const { count } = useCart();
  const open = useCartStore((s) => s.setDrawerOpen);
  return (
    <button
      type="button"
      onClick={() => open(true)}
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-xl border border-border bg-white font-semibold text-primary shadow-card transition hover:border-brand/40 hover:shadow-lift",
        compact ? "size-11 justify-center" : "h-11 px-4 text-sm",
      )}
    >
      <ShoppingCart className="size-4.5" />
      {compact ? null : <span>Cart</span>}
      {count > 0 ? (
        <span className="absolute -top-2 -right-2 grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white ring-2 ring-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}

function SizesPanel() {
  const { data: sizes = [], isLoading } = useFilterSizes();
  const [depth, setDepth] = useState<number>(1);
  const list = sizesForDepth(sizes, depth);
  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <div className="space-y-1.5">
        <p className="eyebrow mb-3">Filter depth</p>
        {DEPTHS.map((d) => (
          <button
            key={d}
            type="button"
            onMouseEnter={() => setDepth(d)}
            onFocus={() => setDepth(d)}
            onClick={() => setDepth(d)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition",
              depth === d ? "bg-gradient-brand text-white shadow-card" : "text-primary hover:bg-accent",
            )}
          >
            Popular {d}&quot; sizes <ArrowRight className="size-4 opacity-70" />
          </button>
        ))}
        <Link
          href="/shop/sizes"
          className="mt-3 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-brand hover:underline"
        >
          View all sizes <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="space-y-2">
                {Array.from({ length: 6 }, (_, j) => (
                  <div key={j} className="h-4 w-20 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ))
          : groupByWidth(list).map((g) => (
              <div key={g.label}>
                <p className="mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">{g.label}</p>
                <ul className="space-y-1.5">
                  {g.items.map((s) => (
                    <li key={s.size}>
                      <Link
                        href={shopSizeHref(s.size)}
                        className="flex items-baseline justify-between gap-3 rounded-md py-0.5 text-sm font-medium text-foreground hover:text-brand"
                      >
                        {s.size}
                        <span className="text-xs text-muted-foreground">from {money(s.pricePerFilterFrom)}/ea</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        {!isLoading && list.length === 0 ? (
          <p className="text-sm text-muted-foreground sm:col-span-3">
            No {depth}&quot; sizes are stocked right now.{" "}
            <Link href="/contact" className="font-semibold text-brand hover:underline">
              Request a custom size
            </Link>
            .
          </p>
        ) : null}
      </div>
    </div>
  );
}

function MervPanel() {
  const items = [
    {
      merv: 11,
      title: "MERV 11",
      tag: "Advanced",
      body: "Captures fine dust, pollen, mold spores and pet dander for homes with pets or allergies.",
      tone: "bg-gradient-brand",
    },
    {
      merv: 13,
      title: "MERV 13",
      tag: "Superior",
      body: "Our highest-efficiency pleated filter for smaller particles like smoke and fine dust.",
      tone: "bg-night",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((m) => (
        <Link
          key={m.merv}
          href={`/shop?merv=${m.merv}`}
          className="group surface-card overflow-hidden hover:-translate-y-0.5 hover:shadow-lift"
        >
          <div className={cn("grid h-20 place-items-center text-2xl font-extrabold tracking-tight text-white italic", m.tone)}>
            {m.title}
          </div>
          <div className="p-4">
            <p className="font-bold text-primary">{m.tag}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
          </div>
        </Link>
      ))}
      <Link href="/contact" className="group surface-card overflow-hidden hover:-translate-y-0.5 hover:shadow-lift">
        <div className="grid h-20 place-items-center bg-lavender text-2xl font-extrabold tracking-tight text-primary italic">
          CUSTOM
        </div>
        <div className="p-4">
          <p className="font-bold text-primary">Custom sizes &amp; bulk</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Need a non-standard size or a large order? Contact our sales team.
          </p>
        </div>
      </Link>
    </div>
  );
}

function TechnologyPanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
      {technologyNav.map((p) => (
        <Link key={p.slug} href={p.href} className="group surface-card flex gap-4 p-3 hover:-translate-y-0.5 hover:shadow-lift">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-gradient-card">
            <Image src={p.image} alt="" fill sizes="96px" className="object-cover transition duration-500 group-hover:scale-105" />
          </div>
          <div className="min-w-0 py-1">
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                p.available ? "bg-emerald-50 text-emerald-700" : "bg-accent text-primary",
              )}
            >
              {p.status}
            </span>
            <p className="mt-1.5 font-bold leading-snug text-primary">{p.navLabel}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{p.blurb}</p>
          </div>
        </Link>
      ))}
      <Link
        href="/technology"
        className="flex items-center gap-1.5 self-center px-4 py-2 text-sm font-semibold text-brand hover:underline"
      >
        Our technology <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

/** Calls onChange after client-side navigations. Isolated so usePathname stays inside Suspense. */
function RouteChangeListener({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return null;
}

const navLinkCls = (active: boolean) =>
  cn(
    "inline-flex rounded-lg px-2.5 py-2 text-sm font-semibold whitespace-nowrap transition xl:px-3 xl:text-[15px]",
    active ? "text-brand" : "text-foreground hover:text-primary",
  );

function ActiveNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  return (
    <Link href={href} className={navLinkCls(pathname.startsWith(href))}>
      {label}
    </Link>
  );
}

const primaryNav: (
  | { type: "menu"; key: Exclude<MenuKey, null>; label: string }
  | { type: "link"; href: string; label: string }
)[] = [
  { type: "menu", key: "sizes", label: "Shop by size" },
  { type: "menu", key: "merv", label: "Shop by MERV" },
  { type: "link", href: "/custom-filters", label: "Custom Filters" },
  { type: "menu", key: "technology", label: "Clean Air Technology" },
];

const supportHref = brand.supportEmail ? `mailto:${brand.supportEmail}` : "/contact";

export function Header() {
  const [menu, setMenu] = useState<MenuKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: settings } = useStoreSettings();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMenu = (k: MenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(k);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 140);
  };

  const threshold = settings?.freeShippingThreshold;

  return (
    <header className="sticky top-0 z-40 bg-white/95 shadow-nav backdrop-blur-xl">
      <Suspense fallback={null}>
        <RouteChangeListener
          onChange={() => {
            setMenu(null);
            setMobileOpen(false);
          }}
        />
      </Suspense>
      {/* Row 1: logo · search · utilities */}
      <div className="container-page flex h-16 items-center gap-3 sm:h-[4.5rem] lg:gap-6">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="grid size-10 place-items-center rounded-xl text-primary hover:bg-accent lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <Logo />
        <SearchBox className="hidden max-w-xl flex-1 md:block" />
        <nav aria-label="Utility" className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/business-account"
            className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-primary transition hover:bg-accent lg:inline-flex"
          >
            <Building2 className="size-4.5" /> Business Account
          </Link>
          <a
            href={supportHref}
            className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-primary transition hover:bg-accent lg:inline-flex"
          >
            <Mail className="size-4.5" /> {brand.supportEmail || "Support"}
          </a>
          <AccountMenu />
          <div className="hidden sm:block">
            <CartButton />
          </div>
          <div className="sm:hidden">
            <CartButton compact />
          </div>
        </nav>
      </div>

      <div className="container-page pb-3 md:hidden">
        <SearchBox />
      </div>

      {/* Row 2: primary navigation + trust */}
      <div className="relative hidden border-t border-lavender lg:block" onMouseLeave={scheduleClose}>
        <div className="container-page flex h-12 items-center justify-between gap-6">
          <ul className="flex items-center gap-1">
            {primaryNav.map((m) =>
              m.type === "link" ? (
                <li key={m.href} onMouseEnter={scheduleClose}>
                  <Link href={m.href} className={navLinkCls(false)}>
                    {m.label}
                  </Link>
                </li>
              ) : (
                <li key={m.key}>
                  <button
                    type="button"
                    aria-expanded={menu === m.key}
                    onMouseEnter={() => openMenu(m.key)}
                    onClick={() => setMenu(menu === m.key ? null : m.key)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-semibold whitespace-nowrap transition xl:px-3 xl:text-[15px]",
                      menu === m.key ? "bg-accent text-primary" : "text-foreground hover:text-primary",
                    )}
                  >
                    {m.label}
                    <ChevronDown className={cn("size-4 transition", menu === m.key && "rotate-180")} />
                  </button>
                </li>
              ),
            )}
            {mainNav.map((n) => (
              <li key={n.href} onMouseEnter={scheduleClose}>
                <Suspense
                  fallback={
                    <Link href={n.href} className={navLinkCls(false)}>
                      {n.label}
                    </Link>
                  }
                >
                  <ActiveNavLink href={n.href} label={n.label} />
                </Suspense>
              </li>
            ))}
          </ul>
          <ul className="flex items-center gap-4 text-[13px] whitespace-nowrap text-primary xl:gap-5 xl:text-sm">
            <li className="hidden items-center gap-1.5 xl:inline-flex">
              <Truck className="size-4.5 text-brand" />
              {threshold ? `Free shipping over ${money(threshold).replace(".00", "")}` : "Fast shipping"}
            </li>
            <li className="hidden items-center gap-1.5 lg:inline-flex">
              <MapPin className="size-4.5 text-brand" /> Livermore, CA
            </li>
          </ul>
        </div>

        {menu ? (
          <div
            className="absolute inset-x-0 top-full border-t border-lavender bg-white shadow-lift"
            onMouseEnter={() => openMenu(menu)}
          >
            <div className="container-page py-8">
              {menu === "sizes" ? <SizesPanel /> : menu === "merv" ? <MervPanel /> : <TechnologyPanel />}
            </div>
          </div>
        ) : null}
      </div>

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  );
}

function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data: sizes = [] } = useFilterSizes();
  const popular = sizes.filter((s) => s.depth === 1).slice(0, 12);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-0">
        <SheetHeader className="border-b border-lavender p-4">
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-6 p-4">
          <SearchBox onDone={() => onOpenChange(false)} />
          <div>
            <p className="eyebrow mb-2">Clean Air Technology</p>
            <ul className="space-y-1">
              {technologyNav.map((p) => (
                <li key={p.slug}>
                  <Link href={p.href} className="flex items-center justify-between rounded-xl px-3 py-2.5 font-semibold text-primary hover:bg-accent">
                    {p.navLabel}
                    <span className="text-xs font-medium text-muted-foreground">{p.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-2">Popular 1&quot; sizes</p>
            <div className="flex flex-wrap gap-2">
              {popular.map((s) => (
                <Link key={s.size} href={shopSizeHref(s.size)} className="rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:border-brand hover:text-brand">
                  {s.size}
                </Link>
              ))}
              <Link href="/shop/sizes" className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-primary">
                All sizes →
              </Link>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-2">Shop by MERV</p>
            <div className="flex gap-2">
              <Link href="/shop?merv=11" className="flex-1 rounded-xl bg-gradient-brand py-3 text-center font-bold text-white">MERV 11</Link>
              <Link href="/shop?merv=13" className="flex-1 rounded-xl bg-night py-3 text-center font-bold text-white">MERV 13</Link>
            </div>
          </div>
          <ul className="space-y-1 border-t border-lavender pt-4">
            {[{ label: "Shop all filters", href: "/shop" }, { label: "Custom Filters", href: "/custom-filters" }, { label: "Technology", href: "/technology" }, ...mainNav, { label: "Business Account", href: "/business-account" }, { label: "Support", href: supportHref }].map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="block rounded-xl px-3 py-2.5 font-semibold text-foreground hover:bg-accent">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
