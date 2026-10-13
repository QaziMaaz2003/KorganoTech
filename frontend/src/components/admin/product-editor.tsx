"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Images, Layers, Loader2, NotebookPen, Trash2 } from "lucide-react";
import { del, get, patch, post } from "@/lib/client-api";
import type { AdminProduct } from "@/lib/admin-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader, Tabs, btn } from "./admin-ui";
import { ProductForm, toInput, toPayload } from "./product-form";
import { ProductImages } from "./product-images";
import { ProductVariants } from "./product-variants";
import { ProductStatusBadge } from "./products";

type Tab = "details" | "images" | "variants";

export function NewProduct() {
  const router = useRouter();
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: (body: ReturnType<typeof toPayload>) => post<AdminProduct>("/admin/products", body),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product created — now add images and variants.");
      router.push(`/admin/products/${p.id}?tab=images`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <PageHeader back={{ href: "/admin/products", label: "Products" }} title="New product" description="Save the details first, then upload images and add sizes." />
      <ProductForm initial={toInput()} submitLabel="Create product" busy={create.isPending} onSubmit={(v) => create.mutate(toPayload(v))} />
    </div>
  );
}

export function ProductEditor({ id, initialTab }: { id: string; initialTab?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const key = ["admin", "product", id];
  const [tab, setTab] = useState<Tab>(initialTab === "images" || initialTab === "variants" ? initialTab : "details");
  const { data: product, isLoading, error } = useQuery({ queryKey: key, queryFn: () => get<AdminProduct>(`/admin/products/${id}`) });

  const save = useMutation({
    mutationFn: (body: ReturnType<typeof toPayload>) => patch<AdminProduct>(`/admin/products/${id}`, body),
    onSuccess: (p) => {
      qc.setQueryData(key, p);
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product saved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: () => del<{ archived: boolean; deleted: boolean }>(`/admin/products/${id}`),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      if (r.archived) {
        toast.success("This product has orders, so it was archived (hidden from the store) instead of deleted.");
        qc.invalidateQueries({ queryKey: key });
      } else {
        toast.success("Product and its images were deleted.");
        router.push("/admin/products");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;
  if (error || !product) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-bold text-primary">Product not found</p>
        <Link href="/admin/products" className={`${btn.secondary} mt-4`}>Back to products</Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        title={<span className="flex flex-wrap items-center gap-3">{product.name} <ProductStatusBadge status={product.status} /></span>}
        description={`${product.category.name} · ${product.variants.length} variants · ${product.images.length} images${product.orderCount ? ` · on ${product.orderCount} order line(s)` : ""}`}
        actions={
          <>
            {product.status === "ACTIVE" ? (
              <Link href={`/products/${product.slug}`} target="_blank" className={btn.secondary}>
                <ExternalLink className="size-4" /> View in store
              </Link>
            ) : null}
            <AlertDialog>
              <AlertDialogTrigger className={btn.danger}>
                <Trash2 className="size-4" /> {product.orderCount ? "Archive" : "Delete"}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{product.orderCount ? "Archive" : "Delete"} {product.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {product.orderCount
                      ? "This product appears on existing orders, so it will be archived: hidden from the store while order history stays intact."
                      : "The product, its variants and its images (including the files on Cloudinary) will be permanently deleted."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => remove.mutate()} className="bg-destructive text-white hover:bg-destructive/90">
                    {remove.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    {product.orderCount ? "Archive product" : "Delete product"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />

      <div className="mb-6">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { value: "details", label: "Details" },
            { value: "images", label: "Images", count: product.images.length },
            { value: "variants", label: "Sizes & pricing", count: product.variants.length },
          ]}
        />
      </div>

      {tab === "details" ? (
        <ProductForm
          key={product.id}
          initial={toInput(product)}
          submitLabel="Save changes"
          busy={save.isPending}
          onSubmit={(v) => save.mutate(toPayload(v))}
        />
      ) : tab === "images" ? (
        <ProductImages product={product} />
      ) : (
        <ProductVariants product={product} />
      )}

      <p className="mt-8 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><NotebookPen className="size-3.5" /> Details save with the button</span>
        <span className="inline-flex items-center gap-1"><Images className="size-3.5" /> Images upload instantly to Cloudinary</span>
        <span className="inline-flex items-center gap-1"><Layers className="size-3.5" /> Variants save row by row</span>
      </p>
    </div>
  );
}
