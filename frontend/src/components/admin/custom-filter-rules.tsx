"use client";

import { Plus, Trash2 } from "lucide-react";
import type { CustomFilterRules } from "@/lib/admin-types";
import { Switch } from "@/components/ui/switch";
import { Label, btn, inputCls } from "./admin-ui";

/** String-valued mirror of CustomFilterRules so inputs can hold partial typing. */
export interface RulesForm {
  enabled: boolean;
  minDimension: string;
  maxDimension: string;
  step: string;
  depths: string;
  mervRatings: string;
  rates: Record<string, Record<string, string>>;
  minUnitPrice: string;
  packs: { quantity: string; discountPct: string }[];
  leadTimeNote: string;
}

export function rulesToForm(r: CustomFilterRules): RulesForm {
  return {
    enabled: r.enabled,
    minDimension: String(r.minDimension),
    maxDimension: String(r.maxDimension),
    step: String(r.step),
    depths: r.depths.join(", "),
    mervRatings: r.mervRatings.join(", "),
    rates: Object.fromEntries(
      Object.entries(r.rates).map(([d, byMerv]) => [
        d,
        Object.fromEntries(Object.entries(byMerv).map(([m, v]) => [m, String(v)])),
      ]),
    ),
    minUnitPrice: String(r.minUnitPrice),
    packs: r.packs.map((p) => ({
      quantity: String(p.quantity),
      discountPct: String(Math.round((1 - p.discount) * 10000) / 100),
    })),
    leadTimeNote: r.leadTimeNote,
  };
}

const list = (s: string) =>
  s
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);

/** Builds the API payload. Anything unparseable becomes NaN and the server rejects it with a clear message. */
export function formToRules(f: RulesForm): CustomFilterRules {
  const depths = list(f.depths);
  const mervRatings = list(f.mervRatings);
  const rates: CustomFilterRules["rates"] = {};
  for (const d of depths) {
    rates[String(d)] = {};
    for (const m of mervRatings) {
      const raw = f.rates[String(d)]?.[String(m)];
      rates[String(d)][String(m)] = raw === undefined || raw === "" ? 0 : Number(raw);
    }
  }
  return {
    enabled: f.enabled,
    minDimension: Number(f.minDimension),
    maxDimension: Number(f.maxDimension),
    step: Number(f.step),
    depths,
    mervRatings,
    rates,
    minUnitPrice: Number(f.minUnitPrice),
    packs: f.packs.map((p) => ({ quantity: Number(p.quantity), discount: 1 - Number(p.discountPct) / 100 })),
    leadTimeNote: f.leadTimeNote,
  };
}

type TextKey = "minDimension" | "maxDimension" | "step" | "minUnitPrice" | "depths" | "mervRatings" | "leadTimeNote";

export function CustomFilterRulesEditor({ value, onChange }: { value: RulesForm; onChange: (v: RulesForm) => void }) {
  const set = <K extends keyof RulesForm>(k: K, v: RulesForm[K]) => onChange({ ...value, [k]: v });
  const text = (k: TextKey) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value);
  const depths = list(value.depths).filter((n) => Number.isFinite(n) && n > 0);
  const mervs = list(value.mervRatings).filter((n) => Number.isFinite(n) && n > 0);

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 p-4">
        <span>
          <span className="block text-sm font-semibold">Custom size ordering</span>
          <span className="text-xs text-muted-foreground">Customers enter their own dimensions and get an instant price.</span>
        </span>
        <Switch checked={value.enabled} onCheckedChange={(c) => set("enabled", c)} aria-label="Custom size ordering enabled" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label>
          <Label hint="inches">Smallest side</Label>
          <input type="number" min={1} step="0.125" className={inputCls} value={value.minDimension} onChange={text("minDimension")} />
        </label>
        <label>
          <Label hint="inches">Largest side</Label>
          <input type="number" min={1} step="0.125" className={inputCls} value={value.maxDimension} onChange={text("maxDimension")} />
        </label>
        <label>
          <Label hint="inches, e.g. 0.125">Size increment</Label>
          <input type="number" min={0.0625} max={1} step="0.0625" className={inputCls} value={value.step} onChange={text("step")} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <Label hint="comma separated, inches">Depths offered</Label>
          <input className={inputCls} value={value.depths} onChange={text("depths")} placeholder="1, 2, 4" />
        </label>
        <label>
          <Label hint="comma separated">MERV ratings offered</Label>
          <input className={inputCls} value={value.mervRatings} onChange={text("mervRatings")} placeholder="11, 13" />
        </label>
      </div>

      <div>
        <Label hint="Dollars per square inch, per filter. Price = width × height × rate.">Price rates</Label>
        <div className="mt-1 overflow-x-auto rounded-xl border border-lavender">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                <th className="px-3 py-2">Depth</th>
                {mervs.map((m) => (
                  <th key={m} className="px-3 py-2">
                    MERV {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depths.map((d) => (
                <tr key={d} className="border-t border-lavender">
                  <td className="px-3 py-2 font-semibold">{d}&quot;</td>
                  {mervs.map((m) => (
                    <td key={m} className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.0001"
                        className={inputCls}
                        aria-label={`Rate for ${d} inch depth, MERV ${m}`}
                        value={value.rates[String(d)]?.[String(m)] ?? ""}
                        onChange={(e) =>
                          set("rates", {
                            ...value.rates,
                            [String(d)]: { ...value.rates[String(d)], [String(m)]: e.target.value },
                          })
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
              {!depths.length || !mervs.length ? (
                <tr>
                  <td colSpan={mervs.length + 1} className="px-3 py-4 text-center text-xs text-muted-foreground">
                    Add depths and MERV ratings above.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <label className="block max-w-sm">
        <Label hint="Floor for one filter, before pack discounts ($)">Minimum price</Label>
        <input type="number" min={0} step="0.01" className={inputCls} value={value.minUnitPrice} onChange={text("minUnitPrice")} />
      </label>

      <div>
        <Label hint="Filters per pack and the discount for buying that pack">Pack sizes</Label>
        <div className="mt-1 space-y-2">
          {value.packs.map((p, i) => (
            <div key={i} className="flex items-end gap-2">
              <label className="w-32">
                <span className="mb-1 block text-xs text-muted-foreground">Filters in pack</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className={inputCls}
                  value={p.quantity}
                  onChange={(e) => set("packs", value.packs.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)))}
                />
              </label>
              <label className="w-32">
                <span className="mb-1 block text-xs text-muted-foreground">Discount (%)</span>
                <input
                  type="number"
                  min={0}
                  max={90}
                  step="0.5"
                  className={inputCls}
                  value={p.discountPct}
                  onChange={(e) => set("packs", value.packs.map((x, j) => (j === i ? { ...x, discountPct: e.target.value } : x)))}
                />
              </label>
              <button
                type="button"
                className={btn.secondary}
                aria-label="Remove pack size"
                disabled={value.packs.length <= 1}
                onClick={() => set("packs", value.packs.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className={btn.secondary}
            onClick={() => set("packs", [...value.packs, { quantity: "", discountPct: "0" }])}
          >
            <Plus className="size-4" /> Add pack size
          </button>
        </div>
      </div>

      <label>
        <Label hint="Shown on the order form">Lead-time note</Label>
        <input className={inputCls} maxLength={200} value={value.leadTimeNote} onChange={text("leadTimeNote")} />
      </label>
    </div>
  );
}
