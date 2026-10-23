"use client";

import Link from "next/link";
import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Clock, Loader2, Lock, Ruler, ShoppingCart, TriangleAlert } from "lucide-react";
import { get, post } from "@/lib/client-api";
import type { CustomFilterOptions, CustomQuote, CustomSpec } from "@/lib/types";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { QtyStepper } from "./qty-stepper";
import { CustomFilterThumb } from "./custom-filter-thumb";

/**
 * Reads a measurement the way people write it: 20, 20.5, 1/2, "20 1/2" or "20-1/2".
 * Returns null when it is not a number.
 */
export function parseInches(raw: string): number | null {
  const s = raw.trim().replace(/["”″]|in(ches)?$/gi, "").trim();
  if (!s) return null;
  const mixed = /^(\d+)\s*[-\s]\s*(\d+)\s*\/\s*(\d+)$/.exec(s);
  if (mixed) return Number(mixed[3]) ? Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]) : null;
  const frac = /^(\d+)\s*\/\s*(\d+)$/.exec(s);
  if (frac) return Number(frac[2]) ? Number(frac[1]) / Number(frac[2]) : null;
  if (/^\d*\.?\d+$/.test(s)) return Number(s);
  return null;
}

const MERV_NOTE: Record<number, string> = {
  8: "Basic · dust and lint",
  11: "Advanced · pollen, mold, pet dander",
  13: "Superior · smoke and fine particles",
};

const trim = (n: number) => String(Number(n.toFixed(3)));

/** Returns an error message for one side, or null when it is fine. */
function sideError(label: string, value: number | null, raw: string, cfg: CustomFilterOptions): string | null {
  if (!raw.trim()) return null; // not typed yet
  if (value === null) return `Enter ${label.toLowerCase()} in inches, like 20 or 20 1/2.`;
  if (value < cfg.minDimension || value > cfg.maxDimension) {
    return `${label} must be between ${trim(cfg.minDimension)}" and ${trim(cfg.maxDimension)}".`;
  }
  const steps = value / cfg.step;
  if (Math.abs(steps - Math.round(steps)) > 1e-9) {
    return `Round to the nearest ${cfg.step === 0.125 ? "1/8" : trim(cfg.step)}".`;
  }
  return null;
}

function Choice<T extends number>({
  legend,
  options,
  value,
  onChange,
  columns,
}: {
  legend: string;
  options: { value: T; label: string; note?: string; badge?: string }[];
  value: T | null;
  onChange: (v: T) => void;
  columns: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-primary">{legend}</legend>
      <div className={cn("mt-2 grid gap-2", columns)}>
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "relative flex cursor-pointer flex-col rounded-xl border-2 p-3 transition has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40",
              value === o.value ? "border-brand bg-accent/40" : "border-lavender bg-white hover:border-brand/40",
            )}
          >
            <input
              type="radio"
              name={legend}
              className="sr-only"
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            <span className="text-base font-bold text-primary">{o.label}</span>
            {o.note ? <span className="mt-0.5 text-xs leading-snug text-muted-foreground">{o.note}</span> : null}
            {o.badge ? (
              <span className="mt-2 w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200 ring-inset">
                {o.badge}
              </span>
            ) : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SizeField({
  id,
  label,
  raw,
  onChange,
  parsed,
  error,
}: {
  id: string;
  label: string;
  raw: string;
  onChange: (v: string) => void;
  parsed: number | null;
  error: string | null;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-primary">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder="e.g. 20 or 20 1/2"
          value={raw}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-help`}
          className={cn(
            "h-12 w-full rounded-xl border bg-white pr-10 pl-4 text-base font-semibold tabular-nums outline-none transition placeholder:font-normal placeholder:text-muted-foreground focus:border-brand focus:ring-3 focus:ring-brand/15",
            error ? "border-destructive" : "border-input",
          )}
        />
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">in</span>
      </div>
      <p id={`${id}-help`} className={cn("mt-1.5 min-h-5 text-xs", error ? "font-medium text-destructive" : "text-muted-foreground")}>
        {error ?? (parsed !== null && raw.includes("/") ? `= ${trim(parsed)}"` : "")}
      </p>
    </div>
  );
}

export function CustomFilterOrder() {
  const { add } = useCart();
  const config = useQuery({
    queryKey: ["custom-filters", "config"],
    queryFn: () => get<CustomFilterOptions>("/custom-filters/config"),
    staleTime: 5 * 60_000,
  });

  const [wRaw, setWRaw] = useState("");
  const [hRaw, setHRaw] = useState("");
  const [depth, setDepth] = useState<number | null>(null);
  const [merv, setMerv] = useState<number | null>(null);
  const [pack, setPack] = useState<number | null>(null);
  const [qty, setQty] = useState(1);

  const cfg = config.data;
  // Sensible starting choices once the options are known.
  const depthV = depth ?? cfg?.depths[0] ?? null;
  const mervV = merv ?? (cfg ? (cfg.mervRatings.includes(13) ? 13 : cfg.mervRatings[cfg.mervRatings.length - 1]) : null);
  const packV = pack ?? cfg?.packs[0]?.quantity ?? null;

  const width = parseInches(wRaw);
  const height = parseInches(hRaw);
  const wErr = cfg ? sideError("Width", width, wRaw, cfg) : null;
  const hErr = cfg ? sideError("Height", height, hRaw, cfg) : null;
  const spec: CustomSpec | null =
    cfg && width !== null && height !== null && !sideError("Width", width, wRaw, cfg) && !sideError("Height", height, hRaw, cfg) && depthV && mervV && packV
      ? { width, height, depth: depthV, mervRating: mervV, packQuantity: packV }
      : null;

  const quote = useQuery({
    queryKey: ["custom-filters", "quote", spec],
    queryFn: () => post<CustomQuote>("/custom-filters/quote", spec),
    enabled: spec !== null,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: false,
  });

  if (config.isLoading) return <div className="h-[34rem] animate-pulse rounded-2xl bg-white" aria-busy />;
  if (!cfg) {
    return (
      <div className="surface-card p-8 text-center">
        <p className="text-lg font-bold text-primary">Custom sizes can&apos;t be loaded right now</p>
        <p className="mt-2 text-sm text-muted-foreground">Please try again in a moment, or <Link href="/contact" className="font-semibold text-brand underline">contact our team</Link>.</p>
      </div>
    );
  }
  if (!cfg.enabled) {
    return (
      <div className="surface-card p-8 text-center">
        <p className="text-lg font-bold text-primary">Custom size ordering is paused</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Please <Link href="/contact" className="font-semibold text-brand underline">contact our team</Link> and we&apos;ll quote your size.
        </p>
      </div>
    );
  }

  const q = spec ? quote.data : undefined;
  const total = q ? q.unitPrice * qty : null;
  const quoting = spec !== null && (quote.isFetching || !q);
  const quoteError = spec !== null && quote.isError ? (quote.error as Error).message : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="surface-card space-y-8 p-6 sm:p-8">
        <section>
          <h2 className="flex items-center gap-3 text-lg font-bold text-primary">
            <span className="grid size-7 place-items-center rounded-full bg-gradient-brand text-sm text-white">1</span>
            Enter your exact size
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Measure the opening the filter slides into, in inches, to the nearest 1/8&quot;. Fractions like 20 1/2 work.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SizeField id="custom-width" label="Width" raw={wRaw} onChange={setWRaw} parsed={width} error={wErr} />
            <SizeField id="custom-height" label="Height" raw={hRaw} onChange={setHRaw} parsed={height} error={hErr} />
          </div>
          <p className="text-xs text-muted-foreground">
            Sizes from {trim(cfg.minDimension)}&quot; to {trim(cfg.maxDimension)}&quot;.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-3 text-lg font-bold text-primary">
            <span className="grid size-7 place-items-center rounded-full bg-gradient-brand text-sm text-white">2</span>
            Choose depth and filtration
          </h2>
          <div className="mt-4 space-y-5">
            <Choice
              legend="Depth"
              columns="grid-cols-3"
              value={depthV}
              onChange={setDepth}
              options={cfg.depths.map((d) => ({ value: d, label: `${trim(d)}"`, note: d === 1 ? "Most common" : d >= 4 ? "Deep pleat" : undefined }))}
            />
            <Choice
              legend="MERV rating"
              columns="sm:grid-cols-2"
              value={mervV}
              onChange={setMerv}
              options={cfg.mervRatings.map((m) => ({ value: m, label: `MERV ${m}`, note: MERV_NOTE[m] }))}
            />
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-3 text-lg font-bold text-primary">
            <span className="grid size-7 place-items-center rounded-full bg-gradient-brand text-sm text-white">3</span>
            Pick a pack size
          </h2>
          <div className="mt-4">
            <Choice
              legend="Filters per pack"
              columns="grid-cols-2 sm:grid-cols-4"
              value={packV}
              onChange={setPack}
              options={cfg.packs.map((p) => ({
                value: p.quantity,
                label: p.quantity === 1 ? "1 filter" : `${p.quantity}-pack`,
                badge: p.discount < 1 ? `Save ${Math.round((1 - p.discount) * 100)}%` : undefined,
              }))}
            />
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
        <div className="surface-card p-6">
          <h2 className="text-lg font-bold text-primary">Your custom filter</h2>

          {spec ? (
            <div className="mt-4 flex gap-4">
              <CustomFilterThumb spec={spec} className="size-24 shrink-0 rounded-xl" />
              <div className="min-w-0 text-sm">
                <p className="font-semibold">Custom Size Air Filter</p>
                <p className="mt-0.5 text-muted-foreground">
                  {trim(spec.width)} × {trim(spec.height)} × {trim(spec.depth)} in
                </p>
                <p className="text-muted-foreground">
                  MERV {spec.mervRating} · {spec.packQuantity === 1 ? "single filter" : `${spec.packQuantity}-pack`}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-accent/50 p-4 text-sm text-muted-foreground">
              <Ruler className="size-5 shrink-0 text-brand" />
              Enter your width and height to see your price.
            </div>
          )}

          <dl className="mt-5 space-y-2 text-sm" aria-live="polite">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Per filter</dt>
              <dd className="font-semibold tabular-nums">{q ? money(q.perFilter) : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{spec && spec.packQuantity > 1 ? `Per ${spec.packQuantity}-pack` : "Per pack"}</dt>
              <dd className="font-semibold tabular-nums">{q ? money(q.unitPrice) : "—"}</dd>
            </div>
            <div className="flex items-center justify-between pt-1">
              <dt className="text-muted-foreground">Packs</dt>
              <dd><QtyStepper size="sm" value={qty} max={99} onChange={setQty} label="Number of packs" /></dd>
            </div>
            <div className="flex justify-between border-t border-lavender pt-3 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="text-xl font-extrabold text-primary tabular-nums">
                {quoting ? <Loader2 className="size-5 animate-spin" aria-label="Pricing" /> : total !== null ? money(total) : "—"}
              </dd>
            </div>
          </dl>

          {quoteError ? <p role="alert" className="mt-3 text-sm font-medium text-destructive">{quoteError}</p> : null}

          <button
            type="button"
            disabled={!spec || !q || add.isPending}
            onClick={() => spec && add.mutate({ custom: spec, quantity: qty })}
            className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand text-base font-bold text-white shadow-card transition hover:shadow-lift disabled:opacity-50"
          >
            {add.isPending ? <Loader2 className="size-5 animate-spin" /> : <ShoppingCart className="size-5" />}
            Add to cart
          </button>
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5" /> Secure card payment at checkout
          </p>
        </div>

        <div className="space-y-3 rounded-2xl bg-accent/60 p-4 text-sm">
          <p className="flex gap-3">
            <Clock className="mt-0.5 size-4.5 shrink-0 text-brand" />
            <span className="text-muted-foreground">{cfg.leadTimeNote}</span>
          </p>
          <p className="flex gap-3">
            <TriangleAlert className="mt-0.5 size-4.5 shrink-0 text-amber-600" />
            <span className="text-muted-foreground">
              Made to your measurements, so custom filters can&apos;t be returned. Please double-check your size. See our{" "}
              <Link href="/shipping-returns" className="font-semibold text-brand underline">returns policy</Link>.
            </span>
          </p>
        </div>
      </aside>
    </div>
  );
}
