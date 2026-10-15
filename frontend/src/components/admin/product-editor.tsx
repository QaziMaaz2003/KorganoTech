"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Images, Layers, NotebookPen, Trash2 } from "lucide-react";
import { api, get, patch, post } from "@/lib/client-api";
import type { AdminProduct } from "@/lib/admin-types";
import { PageHeader, Tabs, btn } from "./admin-ui";
import { DeleteProductDialog, useDeleteProduct } from "./product-delete";
import { ProductForm, toInput, toPayload } from "./product-form";
import { ProductImagePicker } from "./product-image-picker";
import { ProductImages } from "./product-images";
import { ProductVariants } from "./product-variants";
import { ProductStatusBadge } from "./products";

type Tab = "details" | "images" | "variants";

export function NewProduct() {
  const router = useRouter();
  const qc = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const create = useMutation({
    // Create the product first, then upload the chosen images to it one by one
    // (the API sends each to Cloudinary and stores the returned URL).
    mutationFn: async (body: ReturnType<typeof toPayload>) => {
      const product = await post<AdminProduct>("/admin/products", body);
      let failed = 0;
      for (const [i, file] of files.entries()) {
        setProgress({ done: i, total: files.length });
        try {
          const fd = new FormData();
          fd.append("files", file);
          await api(`/admin/products/${product.id}/images`, { method: "POST", body: fd });
        } catch {
          failed++;
        }
      }
      return { product, failed };
    },
    onSuccess: ({ product, failed }) => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      if (failed) {
        toast.warning(`Product created, but ${failed} image${failed > 1 ? "s" : ""} failed to upload. Add them here.`);
        router.push(`/admin/products/${product.id}?tab=images`);
      } else {
        toast.success(files.length ? "Product created with images — now add sizes and pricing." : "Product created — now add images and sizes.");
        router.push(`/admin/products/${product.id}?tab=${files.length ? "variants" : "images"}`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setProgress(null),
  });

  return (
    <div>
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        title="New product"
        description="Add the details and images, then set sizes and pricing after saving."
      />
      <ProductForm
        initial={toInput()}
        submitLabel={
          progress && progress.total
            ? `Uploading image ${Math.min(progress.done + 1, progress.total)} of ${progress.total}…`
            : files.length
              ? `Create product with ${files.length} image${files.length > 1 ? "s" : ""}`
              : "Create product"
        }
        busy={create.isPending}
        onSubmit={(v) => create.mutate(toPayload(v))}
        extra={<ProductImagePicker files={files} onChange={setFiles} disabled={create.isPending} />}
      />
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

  const [confirmDelete, setConfirmDelete] = useState(false);
  const remove = useDeleteProduct(() => {
    setConfirmDelete(false);
    router.push("/admin/products");
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
            <button type="button" className={btn.danger} onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" /> Delete
            </button>
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

      <DeleteProductDialog
        name={product.name}
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        pending={remove.isPending}
        onConfirm={() => remove.mutate(product.id)}
      />

      <p className="mt-8 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><NotebookPen className="size-3.5" /> Details save with the button</span>
        <span className="inline-flex items-center gap-1"><Images className="size-3.5" /> Images upload instantly to Cloudinary</span>
        <span className="inline-flex items-center gap-1"><Layers className="size-3.5" /> Variants save row by row</span>
      </p>
    </div>
  );
}
