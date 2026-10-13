"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import type { FilterSize } from "@/lib/types";
import { shopSizeHref } from "@/lib/sizes";
import { cn } from "@/lib/utils";

const POPULAR = new Set(["16x20x1", "16x25x1", "20x20x1", "20x25x1", "16x25x4", "20x25x4"]);

export function SizeTabs({ sizes }: { sizes: FilterSize[] }) {
  const depths = [...new Set(sizes.map((s) => s.depth))].sort((a, b) => a - b);
  const [tab, setTab] = useState<number | "custom">(depths[0] ?? "custom");
  const list = tab === "custom" ? [] : sizes.filter((s) => s.depth === tab);

  return (
    <div>
      <div role="tablist" aria-label="Filter depth" className="grid grid-cols-2 gap-1 rounded-2xl border border-lavender bg-white p-1.5 shadow-card sm:grid-cols-4">
        {depths.map((d) => (
          <button
            key={d}
            role="tab"
            type="button"
            aria-selected={tab === d}
            onClick={() => setTab(d)}
            className={cn(
              "rounded-xl px-4 py-3 text-sm font-semibold transition",
              tab === d ? "bg-gradient-brand text-white shadow-card" : "text-primary hover:bg-accent",
            )}
          >
            {d}&quot; filters
          </button>
        ))}
        <button
          role="tab"
          type="button"
          aria-selected={tab === "custom"}
          onClick={() => setTab("custom")}
          className={cn(
            "rounded-xl px-4 py-3 text-sm font-semibold transition",
            tab === "custom" ? "bg-gradient-brand text-white shadow-card" : "text-primary hover:bg-accent",
          )}
        >
          Custom air filters
        </button>
      </div>

      <div role="tabpanel" className="mt-4 overflow-hidden rounded-2xl border border-lavender bg-white shadow-card">
        {tab === "custom" ? (
          <div className="flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-bold text-primary">Need a size you don&apos;t see?</p>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                We manufacture MERV 11 and MERV 13 filters and take custom-size and bulk orders. Tell us the dimensions
                and quantity and our sales team will follow up.
              </p>
            </div>
            <Link href="/contact" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white">
              Request a custom size <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <ul className="columns-2 gap-0 [column-rule:1px_solid_var(--lavender)] sm:columns-4">
            {list.map((s) => (
              <li key={s.size} className="break-inside-avoid border-b border-lavender">
                <Link
                  href={shopSizeHref(s.size)}
                  className="flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-foreground transition hover:bg-accent/60 hover:text-brand"
                >
                  {s.size}
                  {POPULAR.has(s.size) ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-gradient-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                      <Star className="size-2.5 fill-current" /> Popular
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
