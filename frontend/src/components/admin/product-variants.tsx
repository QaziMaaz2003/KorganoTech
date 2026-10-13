"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Layers, Loader2, Plus, Trash2, Wand2 } from "lucide-react";
import { del, patch, post } from "@/lib/client-api";
import type { AdminProduct, AdminVariant } from "@/lib/admin-types";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { NativeSelect } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, Label, Panel, SearchInput, btn, inputCls, td, th } from "./admin-ui";

const cell = cn(inputCls, "h-9 px-2 text-sm");
const num = (v: string) => (v.trim() === "" ? null : Number(v));

type Draft = {
  size: string;
  actualSize: string;
  mervRating: string;
  packQuantity: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  lowStockThreshold: string;
  isActive: boolean;
};

const toDraft = (v: AdminVariant): Draft => ({
  size: v.size,
  actualSize: v.actualSize ?? "",
  mervRating: v.mervRating === null ? "" : String(v.mervRating),
  packQuantity: String(v.packQuantity),
  price: v.price.toFixed(2),
  compareAtPrice: v.compareAtPrice === null ? "" : v.compareAtPrice.toFixed(2),
  stock: String(v.stock),
  lowStockThreshold: String(v.lowStockThreshold),
  isActive: v.isActive,
});

function VariantRow({ productId, variant }: { productId: string; variant: AdminVariant }) {
  const qc = useQueryClient();
  const [d, setD] = useState<Draft>(() => toDraft(variant));
  const dirty = JSON.stringify(d) !== JSON.stringify(toDraft(variant));
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "product", productId] });
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
  };

  const save = useMutation({
    mutationFn: () =>
      patch(`/admin/variants/${variant.id}`, {
        size: d.size,
        actualSize: d.actualSize || undefined,
        mervRating: num(d.mervRating),
        packQuantity: Number(d.packQuantity),
        price: Number(d.price),
        compareAtPrice: num(d.compareAtPrice),
        stock: Number(d.stock),
        lowStockThreshold: Number(d.lowStockThreshold),
        isActive: d.isActive,
      }),
    onSuccess: () => {
      toast.success(`${variant.sku} saved.`);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: () => del<{ deactivated: boolean }>(`/admin/variants/${variant.id}`),
    onSuccess: (r) => {
      toast.success(r.deactivated ? "Variant has orders, so it was deactivated instead." : "Variant deleted.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const low = Number(d.stock) <= Number(d.lowStockThreshold);
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) => setD({ ...d, [k]: e.target.value });

  return (
    <tr className={cn("align-top", !d.isActive && "bg-muted/40", dirty && "bg-amber-50/60")}>
      <td className={cn(td, "min-w-28")}>
        <input aria-label="Size" className={cell} value={d.size} onChange={set("size")} />
        <p className="mt-1 truncate text-[11px] text-muted-foreground" title={variant.sku}>{variant.sku}</p>
      </td>
      <td className={cn(td, "min-w-32")}><input aria-label="Actual size" className={cell} value={d.actualSize} onChange={set("actualSize")} /></td>
      <td className={cn(td, "w-20")}><input aria-label="MERV" type="number" min={1} max={20} className={cell} value={d.mervRating} onChange={set("mervRating")} /></td>
      <td className={cn(td, "w-20")}><input aria-label="Pack quantity" type="number" min={1} className={cell} value={d.packQuantity} onChange={set("packQuantity")} /></td>
      <td className={cn(td, "w-28")}>
        <input aria-label="Price" type="number" step="0.01" min={0} className={cell} value={d.price} onChange={set("price")} />
        <p className="mt-1 text-[11px] text-muted-foreground">{money(Number(d.price) / Math.max(1, Number(d.packQuantity)))}/filter</p>
      </td>
      <td className={cn(td, "w-28")}><input aria-label="Compare-at price" type="number" step="0.01" min={0} className={cell} value={d.compareAtPrice} onChange={set("compareAtPrice")} placeholder="—" /></td>
      <td className={cn(td, "w-24")}>
        <input aria-label="Stock" type="number" min={0} className={cn(cell, low && "border-amber-400 bg-amber-50")} value={d.stock} onChange={set("stock")} />
      </td>
      <td className={cn(td, "w-20")}><input aria-label="Low-stock threshold" type="number" min={0} className={cell} value={d.lowStockThreshold} onChange={set("lowStockThreshold")} /></td>
      <td className={cn(td, "pt-5")}>
        <Switch checked={d.isActive} onCheckedChange={(c) => setD({ ...d, isActive: c })} aria-label="Active" />
      </td>
      <td className={cn(td, "whitespace-nowrap")}>
        <div className="flex items-center gap-1">
          <button type="button" className={cn(btn.ghost, dirty && "bg-brand text-white hover:bg-brand/90 hover:text-white")} disabled={!dirty || save.isPending} onClick={() => save.mutate()} aria-label="Save variant">
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          </button>
          <button
            type="button"
            className={cn(btn.ghost, "hover:bg-destructive/10 hover:text-destructive")}
            aria-label="Delete variant"
            disabled={remove.isPending}
            onClick={() => {
              if (confirm(`Delete ${variant.sku}?`)) remove.mutate();
            }}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function AddVariant({ productId, onDone }: { productId: string; onDone: () => void }) {
  const qc = useQueryClient();
  const [d, setD] = useState({ size: "", mervRating: "", packQuantity: "1", price: "", compareAtPrice: "", stock: "0", sku: "" });
  const add = useMutation({
    mutationFn: () =>
      post(`/admin/products/${productId}/variants`, {
        size: d.size,
        mervRating: num(d.mervRating),
        packQuantity: Number(d.packQuantity),
        price: Number(d.price),
        compareAtPrice: num(d.compareAtPrice),
        stock: Number(d.stock),
        sku: d.sku || undefined,
      }),
    onSuccess: () => {
      toast.success("Variant added.");
      qc.invalidateQueries({ queryKey: ["admin", "product", productId] });
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement>) => setD({ ...d, [k]: e.target.value });
  return (
    <form
      className="grid gap-3 rounded-xl border border-lavender bg-accent/30 p-4 sm:grid-cols-4 lg:grid-cols-8"
      onSubmit={(e) => {
        e.preventDefault();
        add.mutate();
      }}
    >
      <label className="lg:col-span-2"><Label hint="16x25x1">Size</Label><input required className={inputCls} value={d.size} onChange={set("size")} /></label>
      <label><Label>MERV</Label><input type="number" min={1} max={20} className={inputCls} value={d.mervRating} onChange={set("mervRating")} /></label>
      <label><Label>Pack qty</Label><input required type="number" min={1} className={inputCls} value={d.packQuantity} onChange={set("packQuantity")} /></label>
      <label><Label>Price ($)</Label><input required type="number" min={0} step="0.01" className={inputCls} value={d.price} onChange={set("price")} /></label>
      <label><Label>Compare at</Label><input type="number" min={0} step="0.01" className={inputCls} value={d.compareAtPrice} onChange={set("compareAtPrice")} /></label>
      <label><Label>Stock</Label><input type="number" min={0} className={inputCls} value={d.stock} onChange={set("stock")} /></label>
      <label><Label hint="optional">SKU</Label><input className={inputCls} value={d.sku} onChange={set("sku")} placeholder="auto" /></label>
      <div className="flex items-end gap-2 sm:col-span-4 lg:col-span-8">
        <button type="submit" className={btn.primary} disabled={add.isPending}>
          {add.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add variant
        </button>
        <button type="button" className={btn.secondary} onClick={onDone}>Cancel</button>
      </div>
    </form>
  );
}

function GenerateDialog({ productId, open, onOpenChange }: { productId: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const [sizes, setSizes] = useState("16x20x1, 16x25x1, 20x20x1, 20x25x1");
  const [mervs, setMervs] = useState("11, 13");
  const [packs, setPacks] = useState("4, 6, 12");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [stock, setStock] = useState("50");
  const [prefix, setPrefix] = useState("KT");

  const list = (s: string) => [...new Set(s.split(/[,\s]+/).map((x) => x.trim()).filter(Boolean))];
  const mervList = list(mervs).map(Number).filter((n) => n > 0 && n <= 20);
  const packList = list(packs).map(Number).filter((n) => n > 0);
  const sizeList = list(sizes.toLowerCase());
  const matrix = mervList.length ? mervList : [null];
  const combos = sizeList.length * matrix.length * packList.length;

  const run = useMutation({
    mutationFn: () =>
      post<{ created: number; skipped: number }>(`/admin/products/${productId}/variants/generate`, {
        sizes: sizeList,
        prices: matrix.flatMap((m) =>
          packList.map((p) => ({ mervRating: m, packQuantity: p, price: Number(prices[`${m}|${p}`] ?? 0) })),
        ),
        stock: Number(stock),
        skuPrefix: prefix || undefined,
      }),
    onSuccess: (r) => {
      toast.success(`Created ${r.created} variant${r.created === 1 ? "" : "s"}${r.skipped ? `, skipped ${r.skipped} that already existed` : ""}.`);
      qc.invalidateQueries({ queryKey: ["admin", "product", productId] });
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const missingPrice = matrix.some((m) => packList.some((p) => !(Number(prices[`${m}|${p}`]) > 0)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk-generate variants</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Creates every size × MERV × pack combination that doesn&apos;t exist yet. Actual sizes are filled in automatically
            (½&quot; under nominal width/length, ¼&quot; under depth).
          </p>
          <label className="block">
            <Label hint="Comma or space separated">Sizes</Label>
            <textarea rows={3} className={cn(inputCls, "h-auto py-2")} value={sizes} onChange={(e) => setSizes(e.target.value)} />
          </label>
          <div className="grid gap-3 sm:grid-cols-4">
            <label><Label>MERV ratings</Label><input className={inputCls} value={mervs} onChange={(e) => setMervs(e.target.value)} /></label>
            <label><Label>Pack sizes</Label><input className={inputCls} value={packs} onChange={(e) => setPacks(e.target.value)} /></label>
            <label><Label>Stock each</Label><input type="number" min={0} className={inputCls} value={stock} onChange={(e) => setStock(e.target.value)} /></label>
            <label><Label>SKU prefix</Label><input className={inputCls} value={prefix} onChange={(e) => setPrefix(e.target.value.toUpperCase())} /></label>
          </div>
          <div>
            <Label>Pack price ($) — applied to every size</Label>
            <div className="overflow-x-auto rounded-xl border border-lavender">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className={th}>MERV</th>
                    {packList.map((p) => <th key={p} className={th}>{p}-pack</th>)}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((m) => (
                    <tr key={String(m)} className="border-t border-lavender">
                      <td className={cn(td, "font-semibold")}>{m ?? "—"}</td>
                      {packList.map((p) => (
                        <td key={p} className={td}>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            aria-label={`Price for MERV ${m ?? "none"} ${p}-pack`}
                            className={cell}
                            value={prices[`${m}|${p}`] ?? ""}
                            onChange={(e) => setPrices({ ...prices, [`${m}|${p}`]: e.target.value })}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="rounded-lg bg-accent/60 px-3 py-2 font-medium text-primary">
            {combos} combination{combos === 1 ? "" : "s"} ({sizeList.length} sizes × {matrix.length} MERV × {packList.length} packs)
          </p>
        </div>
        <DialogFooter>
          <button type="button" className={btn.secondary} onClick={() => onOpenChange(false)}>Cancel</button>
          <button type="button" className={btn.primary} disabled={!combos || missingPrice || run.isPending} onClick={() => run.mutate()}>
            {run.isPending ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />} Generate
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProductVariants({ product }: { product: AdminProduct }) {
  const [q, setQ] = useState("");
  const [merv, setMerv] = useState("");
  const [adding, setAdding] = useState(false);
  const [generating, setGenerating] = useState(false);

  const rows = useMemo(
    () =>
      product.variants.filter(
        (v) =>
          (!q || v.size.toLowerCase().includes(q.toLowerCase().replace(/\s+/g, "")) || v.sku.toLowerCase().includes(q.toLowerCase())) &&
          (!merv || String(v.mervRating) === merv),
      ),
    [product.variants, q, merv],
  );
  const mervs = [...new Set(product.variants.map((v) => v.mervRating).filter((m): m is number => m !== null))].sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      <Panel
        title={`Variants (${product.variants.length})`}
        actions={
          <div className="flex gap-2">
            <button type="button" className={btn.secondary} onClick={() => setGenerating(true)}>
              <Wand2 className="size-4" /> Bulk generate
            </button>
            <button type="button" className={btn.primary} onClick={() => setAdding(true)}>
              <Plus className="size-4" /> Add variant
            </button>
          </div>
        }
        bodyClassName="p-0"
      >
        <div className="space-y-3 p-5">
          {adding ? <AddVariant productId={product.id} onDone={() => setAdding(false)} /> : null}
          <div className="flex flex-wrap gap-3">
            <SearchInput value={q} onChange={setQ} placeholder="Filter by size or SKU" className="min-w-56 flex-1" />
            <NativeSelect value={merv} onChange={(e) => setMerv(e.target.value)} wrapperClassName="w-36" aria-label="MERV filter">
              <option value="">All MERV</option>
              {mervs.map((m) => <option key={m} value={m}>MERV {m}</option>)}
            </NativeSelect>
          </div>
          <p className="text-xs text-muted-foreground">
            Edit any cell, then press <Check className="inline size-3" /> to save that row. Stock changes are recorded in the inventory history.
          </p>
        </div>
        {rows.length ? (
          <div className="max-h-[70vh] overflow-auto border-t border-lavender">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_var(--lavender)]">
                <tr>
                  <th className={th}>Size / SKU</th>
                  <th className={th}>Actual size</th>
                  <th className={th}>MERV</th>
                  <th className={th}>Pack</th>
                  <th className={th}>Price</th>
                  <th className={th}>Compare at</th>
                  <th className={th}>Stock</th>
                  <th className={th}>Low at</th>
                  <th className={th}>Active</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody className="divide-y divide-lavender">
                {rows.map((v) => (
                  <VariantRow key={`${v.id}:${v.price}:${v.stock}:${v.isActive}:${v.size}`} productId={product.id} variant={v} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Layers} title={product.variants.length ? "No variants match" : "No variants yet"} body="Add sizes one by one or bulk-generate a size × MERV × pack matrix." />
        )}
      </Panel>
      <GenerateDialog productId={product.id} open={generating} onOpenChange={setGenerating} />
    </div>
  );
}
