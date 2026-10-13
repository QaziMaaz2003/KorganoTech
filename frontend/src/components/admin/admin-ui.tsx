"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const inputCls =
  "h-10 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-3 focus:ring-brand/15 disabled:bg-muted disabled:text-muted-foreground";

export const btn = {
  primary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-brand px-4 text-sm font-semibold text-white shadow-card transition hover:shadow-lift disabled:pointer-events-none disabled:opacity-50",
  secondary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-foreground transition hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
  danger:
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-destructive/10 px-4 text-sm font-semibold text-destructive transition hover:bg-destructive/15 disabled:pointer-events-none disabled:opacity-50",
  ghost:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-primary disabled:pointer-events-none disabled:opacity-50",
};

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back ? (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            <ChevronLeft className="size-4" /> {back.label}
          </Link>
        ) : null}
        <h1 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-lavender bg-white shadow-card", className)}>
      {title || actions ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lavender px-5 py-4">
          {title ? <h2 className="font-bold text-primary">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [local, setLocal] = useState(value);
  const [synced, setSynced] = useState(value);
  // Follow external resets of `value` (adjusting state during render, not in an effect).
  if (value !== synced) {
    setSynced(value);
    setLocal(value);
  }
  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className={cn(inputCls, "pl-9")}
      />
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPage: (p: number) => void;
}) {
  if (pageCount <= 1) return <p className="px-5 py-3 text-xs text-muted-foreground">{total} total</p>;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-lavender px-5 py-3 text-sm">
      <p className="text-muted-foreground">
        Page {page} of {pageCount} · {total} total
      </p>
      <div className="flex gap-1">
        <button type="button" className={btn.ghost} disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft className="size-4" /> Prev
        </button>
        <button type="button" className={btn.ghost} disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
          Next <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string; count?: number }[];
}) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto rounded-xl border border-lavender bg-white p-1">
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          role="tab"
          aria-selected={value === it.value}
          onClick={() => onChange(it.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition",
            value === it.value ? "bg-gradient-brand text-white" : "text-muted-foreground hover:bg-accent hover:text-primary",
          )}
        >
          {it.label}
          {it.count !== undefined ? (
            <span
              className={cn(
                "rounded-full px-1.5 text-[11px] tabular-nums",
                value === it.value ? "bg-white/20" : "bg-muted",
              )}
            >
              {it.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }: { icon: React.ElementType; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-accent text-primary">
        <Icon className="size-6" />
      </span>
      <p className="mt-4 font-bold text-primary">{title}</p>
      {body ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-5" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-11 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

export const th = "px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase";
export const td = "px-4 py-3 align-middle";

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-semibold text-foreground">
      {children}
      {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
    </span>
  );
}
