"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, CircleAlert, CreditCard, Info, PackageCheck, ShoppingCart, Truck, Zap } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useStoreSettings } from "@/hooks/use-store-data";
import { money, packLabel } from "@/lib/format";
import { MERV_INFO } from "@/lib/merv";
import type { ProductDetail, Variant } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NativeSelect } from "@/components/ui/native-select";
import { ProductImage } from "@/components/shop/product-image";
import { QtyStepper } from "@/components/shop/qty-stepper";
import { NotifyMe } from "@/components/shop/notify-me";

function Gallery({ product }: { product: ProductDetail }) {
  const [active, setActive] = useState(0);
  const images = product.images;
  const current = images[active];
  return (
    <div>
      <ProductImage
        src={current?.url}
        alt={current?.alt ?? product.name}
        priority
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="aspect-square rounded-2xl border border-lavender"
      />
      {images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "block w-full overflow-hidden rounded-xl border-2 transition",
                  i === active ? "border-brand" : "border-transparent hover:border-lavender",
                )}
              >
                <ProductImage src={img.url} alt="" sizes="96px" className="aspect-square" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-bold text-primary">
      <span className="grid size-6 place-items-center rounded-full bg-gradient-brand text-xs text-white">{n}</span>
      {children}
    </h2>
  );
}

export function PdpView({
  product,
  initialSize,
  initialMerv,
}: {
  product: ProductDetail;
  initialSize?: string;
  initialMerv?: number;
}) {
  const router = useRouter();
  const { add } = useCart();
  const { data: settings } = useStoreSettings();
  const variants = product.variants;

  const firstFor = (size?: string, merv?: number) =>
    variants.find((v) => (!size || v.size === size) && (!merv || v.mervRating === merv)) ?? variants[0];

  const start = firstFor(initialSize, initialMerv) ?? firstFor(initialSize);
  const [size, setSize] = useState(start?.size);
  const [merv, setMerv] = useState<number | null>(start?.mervRating ?? null);
  const [pack, setPack] = useState(start?.packQuantity ?? 1);
  const [qty, setQty] = useState(1);

  const forSize = useMemo(() => variants.filter((v) => v.size === size), [variants, size]);
  const mervs = [...new Set(forSize.map((v) => v.mervRating).filter((m): m is number => m !== null))].sort((a, b) => a - b);
  const forSizeMerv = forSize.filter((v) => (merv ? v.mervRating === merv : true)).sort((a, b) => a.packQuantity - b.packQuantity);
  const variant: Variant | undefined = forSizeMerv.find((v) => v.packQuantity === pack) ?? forSizeMerv[0];

  const basePerFilter = forSizeMerv.length ? forSizeMerv[0].price / forSizeMerv[0].packQuantity : 0;

  const chooseSize = (s: string) => {
    setSize(s);
    const next = variants.filter((v) => v.size === s);
    const m = next.some((v) => v.mervRating === merv) ? merv : (next[0]?.mervRating ?? null);
    setMerv(m);
    const packs = next.filter((v) => v.mervRating === m).map((v) => v.packQuantity);
    if (!packs.includes(pack)) setPack(packs[0] ?? 1);
    setQty(1);
  };
  const chooseMerv = (m: number) => {
    setMerv(m);
    const packs = forSize.filter((v) => v.mervRating === m).map((v) => v.packQuantity);
    if (!packs.includes(pack)) setPack(packs[0] ?? 1);
    setQty(1);
  };

  const depths = [...new Set(product.options.sizes.map((s) => s.depth))];
  const purchasable = product.isPurchasable && variants.length > 0;
  const stock = variant?.stock ?? 0;
  const lowStock = variant && stock > 0 && stock <= variant.lowStockThreshold;
  const savingsPct =
    variant?.compareAtPrice && variant.compareAtPrice > variant.price
      ? Math.round((1 - variant.price / variant.compareAtPrice) * 100)
      : 0;

  const addToCart = async (thenCheckout = false) => {
    if (!variant) return;
    await add.mutateAsync({ variantId: variant.id, quantity: qty });
    if (thenCheckout) router.push("/checkout");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5">
        <Gallery product={product} />
        {product.shortDescription ? (
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.shortDescription}</p>
        ) : null}
      </div>

      <div className="space-y-7 lg:col-span-4">
        <div>
          <p className="eyebrow">{product.category.name}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-primary sm:text-[2.1rem] sm:leading-tight">
            {size && /^\d/.test(size) ? `${size} ` : ""}
            {product.name}
          </h1>
          {variant?.actualSize ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Actual size: <span className="font-semibold text-foreground">{variant.actualSize} inches</span>
            </p>
          ) : null}
          {product.badge ? (
            <span className="mt-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">{product.badge}</span>
          ) : null}
        </div>

        {variants.length ? (
          <>
            <div className="space-y-3">
              <StepTitle n={1}>Choose your size</StepTitle>
              <NativeSelect size="lg" value={size} onChange={(e) => chooseSize(e.target.value)} aria-label="Filter size">
                {depths.map((d) => (
                  <optgroup key={String(d)} label={d ? `${d}" depth` : "Sizes"}>
                    {product.options.sizes
                      .filter((s) => s.depth === d)
                      .map((s) => (
                        <option key={s.size} value={s.size}>
                          {s.size}
                          {s.actualSize ? ` (actual ${s.actualSize})` : ""}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </NativeSelect>
            </div>

            {mervs.length ? (
              <div className="space-y-3">
                <StepTitle n={2}>Choose filter quality</StepTitle>
                <div role="radiogroup" aria-label="MERV rating" className="grid grid-cols-2 gap-3">
                  {mervs.map((m) => {
                    const info = MERV_INFO[m];
                    const selected = merv === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => chooseMerv(m)}
                        className={cn(
                          "relative overflow-hidden rounded-2xl border-2 bg-white text-left transition",
                          selected ? "border-brand shadow-card" : "border-lavender hover:border-brand/40",
                        )}
                      >
                        {m === 13 ? (
                          <span className="absolute top-2 right-2 rounded-md bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
                            BEST FIT
                          </span>
                        ) : null}
                        <span className={cn("block py-3 text-center text-xl font-extrabold italic", info?.tone ?? "bg-accent text-primary")}>
                          MERV {m}
                        </span>
                        <span className="block p-3">
                          <span className="block text-sm font-bold text-primary">{info?.tag ?? "Filtration"}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{info?.summary}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <StepTitle n={mervs.length ? 3 : 2}>Select quantity</StepTitle>
              <div className="overflow-hidden rounded-2xl border border-lavender bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-xs text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold">Pack</th>
                      <th className="px-2 py-2.5 text-right font-semibold">Price</th>
                      <th className="px-2 py-2.5 text-right font-semibold">Each</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forSizeMerv.map((v) => {
                      const each = v.price / v.packQuantity;
                      const save = basePerFilter ? Math.max(0, Math.round((1 - each / basePerFilter) * 100)) : 0;
                      const selected = v.packQuantity === variant?.packQuantity;
                      return (
                        <tr
                          key={v.id}
                          onClick={() => setPack(v.packQuantity)}
                          className={cn(
                            "cursor-pointer border-t border-lavender transition",
                            selected ? "bg-accent/70" : "hover:bg-muted/50",
                          )}
                        >
                          <td className="px-4 py-3">
                            <label className="flex cursor-pointer items-center gap-2.5 font-semibold">
                              <input
                                type="radio"
                                name="pack"
                                checked={selected}
                                onChange={() => setPack(v.packQuantity)}
                                className="size-4 accent-[var(--brand)]"
                              />
                              {packLabel(v.packQuantity)}
                            </label>
                          </td>
                          <td className="px-2 py-3 text-right font-semibold tabular-nums">{money(v.price)}</td>
                          <td className="px-2 py-3 text-right tabular-nums text-muted-foreground">{money(each)}</td>
                          <td className={cn("px-4 py-3 text-right font-semibold tabular-nums", save ? "text-emerald-600" : "text-muted-foreground")}>
                            {save ? `${save}%` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="lg:col-span-3">
        <div className="space-y-4 lg:sticky lg:top-36">
          {purchasable && variant ? (
            <div className="surface-card space-y-4 p-5">
              <p className="text-sm font-semibold text-muted-foreground">Order summary</p>
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-primary tabular-nums">{money(variant.price * qty)}</span>
                  {variant.compareAtPrice && variant.compareAtPrice > variant.price ? (
                    <span className="text-sm text-muted-foreground line-through tabular-nums">
                      {money(variant.compareAtPrice * qty)}
                    </span>
                  ) : null}
                  {savingsPct ? (
                    <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-xs font-bold text-white">{savingsPct}% OFF</span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {packLabel(variant.packQuantity)} · {money(variant.price / variant.packQuantity)} per filter
                </p>
              </div>

              <p
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold",
                  stock <= 0 ? "text-destructive" : lowStock ? "text-amber-700" : "text-emerald-700",
                )}
              >
                {stock <= 0 ? <CircleAlert className="size-4" /> : <Check className="size-4" />}
                {stock <= 0 ? "Out of stock" : lowStock ? `Only ${stock} left in stock` : "In stock — ready to ship"}
              </p>

              <div className="flex items-center gap-3">
                <QtyStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(99, stock))} disabled={stock <= 0} label="Number of packs" />
                <span className="text-xs text-muted-foreground">
                  {qty * variant.packQuantity} filter{qty * variant.packQuantity === 1 ? "" : "s"}
                </span>
              </div>

              <button
                type="button"
                disabled={stock <= 0 || add.isPending}
                onClick={() => addToCart(false)}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand font-semibold text-white shadow-card transition hover:shadow-lift disabled:opacity-50"
              >
                <ShoppingCart className="size-4.5" /> {add.isPending ? "Adding…" : "Add to cart"}
              </button>
              <button
                type="button"
                disabled={stock <= 0 || add.isPending}
                onClick={() => addToCart(true)}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white font-semibold text-primary transition hover:bg-accent disabled:opacity-50"
              >
                <Zap className="size-4.5" /> Buy now
              </button>

              <ul className="space-y-3 border-t border-lavender pt-4 text-sm">
                <li className="flex gap-3">
                  <CreditCard className="mt-0.5 size-5 shrink-0 text-brand" />
                  <span>
                    <span className="block font-semibold">Secure card checkout</span>
                    <span className="text-muted-foreground">Pay safely by card through Stripe.</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Truck className="mt-0.5 size-5 shrink-0 text-brand" />
                  <span>
                    <span className="block font-semibold">
                      {settings?.freeShippingThreshold ? `Free shipping over ${money(settings.freeShippingThreshold)}` : "Fast shipping"}
                    </span>
                    <span className="text-muted-foreground">
                      {settings ? `Otherwise a flat ${money(settings.shippingFee)}.` : "Ships from Livermore, CA."}
                    </span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <PackageCheck className="mt-0.5 size-5 shrink-0 text-brand" />
                  <span>
                    <span className="block font-semibold">Track every order</span>
                    <span className="text-muted-foreground">Follow status from your account.</span>
                  </span>
                </li>
              </ul>
            </div>
          ) : (
            <NotifyMe productId={product.id} productName={product.name} note={product.availabilityNote} />
          )}
        </div>
      </div>

      {/* Description & specifications, tied to the selected variant */}
      <section aria-labelledby="specs-title" className="grid gap-8 rounded-2xl border border-lavender bg-white p-6 shadow-card sm:p-8 lg:col-span-12 lg:grid-cols-2">
        <div>
          <h2 id="specs-title" className="text-xl font-bold text-primary">
            {variant && /^\d/.test(variant.size) ? `${variant.size} air filter description` : "Product details"}
          </h2>
          <dl className="mt-5 divide-y divide-lavender text-sm">
            {[
              variant ? ["Nominal size", /^\d/.test(variant.size) ? `${variant.size.replace(/x/g, " x ")} inches` : variant.size] : null,
              variant?.actualSize ? ["Actual size", `${variant.actualSize} inches`] : null,
              variant ? ["SKU", variant.sku] : null,
              variant?.depth ? ["Thickness", `${variant.depth} inch${variant.depth === 1 ? "" : "es"}`] : null,
              product.filterType ? ["Filter type", product.filterType] : null,
              variant?.mervRating ? ["MERV rating", `MERV ${variant.mervRating}`] : null,
              variant ? ["Pack", packLabel(variant.packQuantity)] : null,
            ]
              .filter((r): r is string[] => Boolean(r))
              .map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-3">
                  <dt className="font-semibold text-foreground">{k}</dt>
                  <dd className="text-right text-muted-foreground">{v}</dd>
                </div>
              ))}
          </dl>
          {product.description ? (
            <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {product.description.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary">Performance specifications</h2>
          {product.specs?.length ? (
            <dl className="mt-5 divide-y divide-lavender text-sm">
              {product.specs.map((s) => (
                <div key={s.label} className="flex justify-between gap-6 py-3">
                  <dt className="font-semibold text-foreground">{s.label}</dt>
                  <dd className="text-right text-muted-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="size-4" /> Specifications coming soon.
            </p>
          )}
          {product.features.length ? (
            <ul className="mt-6 space-y-2.5 text-sm">
              {product.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  );
}
