"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  disabled,
  label = "Quantity",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  disabled?: boolean;
  label?: string;
}) {
  const btn = cn(
    "grid place-items-center text-primary transition hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent",
    size === "sm" ? "size-8" : "size-11",
  );
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-border bg-white",
        disabled && "opacity-60",
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={cn(btn, "rounded-l-xl")}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" />
      </button>
      <span
        className={cn("min-w-8 text-center font-semibold tabular-nums", size === "sm" ? "text-sm" : "text-base")}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={cn(btn, "rounded-r-xl")}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
