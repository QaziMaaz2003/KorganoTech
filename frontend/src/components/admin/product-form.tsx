"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { AdminProduct } from "@/lib/admin-types";
import type { ProductStatus, Spec } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { NativeSelect } from "@/components/ui/native-select";
import { Label, Panel, btn, inputCls } from "./admin-ui";
import { useAdminCategories } from "./products";

export interface ProductInput {
  categoryId: string;
  name: string;
  slug?: string;
  shortDescription: string;
  description: string;
  features: string[];
  specs: Spec[];
  filterType: string;
  status: ProductStatus;
  isPurchasable: boolean;
  isFeatured: boolean;
  badge: string;
  availabilityNote: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
}

export function toInput(p?: AdminProduct): ProductInput {
  return {
    categoryId: p?.categoryId ?? "",
    name: p?.name ?? "",
    slug: p?.slug,
    shortDescription: p?.shortDescription ?? "",
    description: p?.description ?? "",
    features: p?.features ?? [],
    specs: p?.specs ?? [],
    filterType: p?.filterType ?? "",
    status: p?.status ?? "DRAFT",
    isPurchasable: p?.isPurchasable ?? true,
    isFeatured: p?.isFeatured ?? false,
    badge: p?.badge ?? "",
    availabilityNote: p?.availabilityNote ?? "",
    seoTitle: p?.seoTitle ?? "",
    seoDescription: p?.seoDescription ?? "",
    sortOrder: p?.sortOrder ?? 0,
  };
}

/** Strips empty optional strings so the API's validators accept them. */
export function toPayload(v: ProductInput) {
  const opt = (s: string) => (s.trim() ? s.trim() : undefined);
  return {
    categoryId: v.categoryId,
    name: v.name.trim(),
    slug: v.slug?.trim() || undefined,
    shortDescription: opt(v.shortDescription),
    description: opt(v.description),
    features: v.features.map((f) => f.trim()).filter(Boolean),
    specs: v.specs.filter((s) => s.label.trim() && s.value.trim()),
    filterType: opt(v.filterType),
    status: v.status,
    isPurchasable: v.isPurchasable,
    isFeatured: v.isFeatured,
    badge: opt(v.badge),
    availabilityNote: opt(v.availabilityNote),
    seoTitle: opt(v.seoTitle),
    seoDescription: opt(v.seoDescription),
    sortOrder: Number(v.sortOrder) || 0,
  };
}

export function ProductForm({
  initial,
  submitLabel,
  busy,
  onSubmit,
  extra,
}: {
  initial: ProductInput;
  submitLabel: string;
  busy?: boolean;
  onSubmit: (v: ProductInput) => void;
  /** Rendered after the Basics panel (used for the image picker on new products). */
  extra?: React.ReactNode;
}) {
  const [v, setV] = useState<ProductInput>(initial);
  const { data: categories = [] } = useAdminCategories();
  const set = <K extends keyof ProductInput>(k: K, val: ProductInput[K]) => setV((s) => ({ ...s, [k]: val }));

  return (
    <form
      className="grid gap-6 xl:grid-cols-[1fr_340px]"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
    >
      <div className="space-y-6">
        <Panel title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <Label>Product name</Label>
              <input required minLength={2} className={inputCls} value={v.name} onChange={(e) => set("name", e.target.value)} placeholder='e.g. Pleated HVAC Air Filter — 1"' />
            </label>
            <label>
              <Label hint="Used in the product URL">Slug</Label>
              <input
                className={inputCls}
                value={v.slug ?? ""}
                onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="generated from the name"
              />
            </label>
            <label>
              <Label>Category</Label>
              <NativeSelect required value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                <option value="" disabled>Choose a category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </NativeSelect>
            </label>
            <label>
              <Label hint='e.g. Pleated, Deep Pleat'>Filter type</Label>
              <input className={inputCls} value={v.filterType} onChange={(e) => set("filterType", e.target.value)} />
            </label>
            <label>
              <Label hint='e.g. Best Seller, New'>Badge</Label>
              <input className={inputCls} value={v.badge} maxLength={40} onChange={(e) => set("badge", e.target.value)} />
            </label>
            <label className="sm:col-span-2">
              <Label hint="Shown on product cards">Short description</Label>
              <textarea rows={2} maxLength={300} className={cn(inputCls, "h-auto py-2")} value={v.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
            </label>
            <label className="sm:col-span-2">
              <Label hint="Blank line between paragraphs">Description</Label>
              <textarea rows={7} className={cn(inputCls, "h-auto py-2")} value={v.description} onChange={(e) => set("description", e.target.value)} />
            </label>
            <label className="sm:col-span-2">
              <Label hint="One per line">Key features</Label>
              <textarea
                rows={5}
                className={cn(inputCls, "h-auto py-2")}
                value={v.features.join("\n")}
                onChange={(e) => set("features", e.target.value.split("\n"))}
              />
            </label>
          </div>
        </Panel>

        {extra}

        <Panel
          title="Specifications"
          actions={
            <button type="button" className={btn.ghost} onClick={() => set("specs", [...v.specs, { label: "", value: "" }])}>
              <Plus className="size-4" /> Add row
            </button>
          }
        >
          {v.specs.length ? (
            <ul className="space-y-2">
              {v.specs.map((s, i) => (
                <li key={i} className="grid grid-cols-[1fr_1.6fr_auto] gap-2">
                  <input
                    aria-label="Specification name"
                    className={inputCls}
                    value={s.label}
                    placeholder="e.g. Frame"
                    onChange={(e) => set("specs", v.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  />
                  <input
                    aria-label="Specification value"
                    className={inputCls}
                    value={s.value}
                    placeholder="e.g. Moisture-resistant paperboard"
                    onChange={(e) => set("specs", v.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                  />
                  <button type="button" className={btn.ghost} aria-label="Remove row" onClick={() => set("specs", v.specs.filter((_, j) => j !== i))}>
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No specifications yet.</p>
          )}
        </Panel>

        <Panel title="Search engine listing">
          <div className="grid gap-4">
            <label>
              <Label hint="Defaults to the product name">SEO title</Label>
              <input className={inputCls} maxLength={160} value={v.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
            </label>
            <label>
              <Label hint="Defaults to the short description">SEO description</Label>
              <textarea rows={3} maxLength={320} className={cn(inputCls, "h-auto py-2")} value={v.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
            </label>
          </div>
        </Panel>
      </div>

      <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <Panel title="Publishing">
          <div className="space-y-5">
            <label className="block">
              <Label>Status</Label>
              <NativeSelect value={v.status} onChange={(e) => set("status", e.target.value as ProductStatus)}>
                <option value="ACTIVE">Active — visible in the store</option>
                <option value="DRAFT">Draft — hidden</option>
                <option value="ARCHIVED">Archived — hidden</option>
              </NativeSelect>
            </label>
            <div className="flex items-start justify-between gap-4">
              <span>
                <span className="block text-sm font-semibold">Available for purchase</span>
                <span className="text-xs text-muted-foreground">Off shows &ldquo;Notify me&rdquo; instead of Add to Cart.</span>
              </span>
              <Switch checked={v.isPurchasable} onCheckedChange={(c) => set("isPurchasable", c)} aria-label="Available for purchase" />
            </div>
            {!v.isPurchasable ? (
              <label className="block">
                <Label>Availability note</Label>
                <input className={inputCls} maxLength={200} value={v.availabilityNote} onChange={(e) => set("availabilityNote", e.target.value)} placeholder="e.g. EPA registration underway" />
              </label>
            ) : null}
            <div className="flex items-start justify-between gap-4">
              <span>
                <span className="block text-sm font-semibold">Featured</span>
                <span className="text-xs text-muted-foreground">Listed first in the shop.</span>
              </span>
              <Switch checked={v.isFeatured} onCheckedChange={(c) => set("isFeatured", c)} aria-label="Featured" />
            </div>
            <label className="block">
              <Label hint="Lower shows first">Sort order</Label>
              <input type="number" min={0} className={inputCls} value={v.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
            </label>
          </div>
        </Panel>
        <button type="submit" className={cn(btn.primary, "h-12 w-full")} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : null} {submitLabel}
        </button>
      </div>
    </form>
  );
}
