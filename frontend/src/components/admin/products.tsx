"use client";

import Link from "next/link";
import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Package, Plus, Trash2 } from "lucide-react";
import { get, patch, qs } from "@/lib/client-api";
import type { AdminProductRow, Paged } from "@/lib/admin-types";
import type { Category, ProductStatus } from "@/lib/types";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { NativeSelect } from "@/components/ui/native-select";
import { ProductImage } from "@/components/shop/product-image";
import { EmptyState, PageHeader, Pagination, Panel, SearchInput, TableSkeleton, btn, td, th } from "./admin-ui";
import { DeleteProductDialog, useDeleteProduct } from "./product-delete";

export const PRODUCT_STATUS_TONE: Record<ProductStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  DRAFT: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  ARCHIVED: "bg-amber-50 text-amber-800 ring-amber-200",
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", PRODUCT_STATUS_TONE[status])}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function useAdminCategories() {
  return useQuery({ queryKey: ["admin", "categories"], queryFn: () => get<Category[]>("/admin/categories"), staleTime: 60_000 });
}

export function AdminProducts() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"" | ProductStatus>("");
  const [page, setPage] = useState(1);
  const { data: categories = [] } = useAdminCategories();
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);
  const remove = useDeleteProduct(() => setToDelete(null));

  const key = ["admin", "products", q, category, status, page];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => get<Paged<AdminProductRow>>(`/admin/products${qs({ q, category, status, page })}`),
    placeholderData: keepPreviousData,
  });

  const toggle = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Pick<AdminProductRow, "isPurchasable" | "isFeatured">> }) =>
      patch(`/admin/products/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage products, prices, sizes, images and availability."
        actions={
          <Link href="/admin/products/new" className={btn.primary}>
            <Plus className="size-4" /> New product
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search name, slug or SKU" className="min-w-64 flex-1" />
        <NativeSelect value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} wrapperClassName="w-56" aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </NativeSelect>
        <NativeSelect value={status} onChange={(e) => { setStatus(e.target.value as "" | ProductStatus); setPage(1); }} wrapperClassName="w-40" aria-label="Status">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </NativeSelect>
      </div>

      <Panel bodyClassName="p-0">
        {isLoading ? (
          <TableSkeleton />
        ) : data && data.items.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead className="border-b border-lavender">
                  <tr>
                    <th className={th}>Product</th>
                    <th className={th}>Status</th>
                    <th className={th}>Variants</th>
                    <th className={th}>Stock</th>
                    <th className={th}>Price</th>
                    <th className={th}>For sale</th>
                    <th className={th}>Featured</th>
                    <th className={cn(th, "text-right")}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lavender">
                  {data.items.map((p) => (
                    <tr key={p.id} className="hover:bg-accent/30">
                      <td className={td}>
                        <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                          <ProductImage src={p.image?.url} alt="" sizes="48px" className="size-12 shrink-0 rounded-lg" />
                          <span className="min-w-0">
                            <span className="block font-semibold text-primary hover:underline">{p.name}</span>
                            <span className="block text-xs text-muted-foreground">{p.category.name}{p.badge ? ` · ${p.badge}` : ""}</span>
                          </span>
                        </Link>
                      </td>
                      <td className={td}><ProductStatusBadge status={p.status} /></td>
                      <td className={cn(td, "tabular-nums")}>{p.activeVariantCount}{p.variantCount !== p.activeVariantCount ? <span className="text-muted-foreground"> / {p.variantCount}</span> : null}</td>
                      <td className={td}>
                        <span className="tabular-nums">{p.totalStock}</span>
                        {p.lowStockCount ? <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{p.lowStockCount} low</span> : null}
                      </td>
                      <td className={cn(td, "whitespace-nowrap tabular-nums")}>
                        {p.priceFrom === null ? "—" : p.priceFrom === p.priceTo ? money(p.priceFrom) : `${money(p.priceFrom)} – ${money(p.priceTo)}`}
                      </td>
                      <td className={td}>
                        <Switch
                          checked={p.isPurchasable}
                          onCheckedChange={(v) => toggle.mutate({ id: p.id, body: { isPurchasable: v } })}
                          aria-label={`${p.name} available for purchase`}
                        />
                      </td>
                      <td className={td}>
                        <Switch
                          checked={p.isFeatured}
                          onCheckedChange={(v) => toggle.mutate({ id: p.id, body: { isFeatured: v } })}
                          aria-label={`${p.name} featured`}
                        />
                      </td>
                      <td className={cn(td, "text-right")}>
                        <button
                          type="button"
                          className={cn(btn.ghost, "hover:bg-destructive/10 hover:text-destructive")}
                          aria-label={`Delete ${p.name}`}
                          onClick={() => setToDelete({ id: p.id, name: p.name })}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pageCount={data.pageCount} total={data.total} onPage={setPage} />
          </>
        ) : (
          <EmptyState
            icon={Package}
            title="No products found"
            body="Create your first product, then add images and variants."
            action={<Link href="/admin/products/new" className={btn.primary}><Plus className="size-4" /> New product</Link>}
          />
        )}
      </Panel>

      <DeleteProductDialog
        name={toDelete?.name ?? ""}
        open={toDelete !== null}
        onOpenChange={(o) => { if (!o) setToDelete(null); }}
        pending={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </div>
  );
}
