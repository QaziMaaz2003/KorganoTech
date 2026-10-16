"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { api, del, patch } from "@/lib/client-api";
import type { AdminProduct } from "@/lib/admin-types";
import type { ProductImage as Img } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/shop/product-image";
import { Panel, btn, inputCls } from "./admin-ui";

export const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX = 4 * 1024 * 1024;

/**
 * Upload → NestJS → Cloudinary. The API stores the returned secure URL and
 * public_id on ProductImage; the storefront renders that Cloudinary URL.
 */
export function ProductImages({ product }: { product: AdminProduct }) {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<{ name: string; state: "waiting" | "uploading" | "done" | "error"; error?: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const key = ["admin", "product", product.id];

  const setImages = (images: Img[]) =>
    qc.setQueryData<AdminProduct>(key, (p) => (p ? { ...p, images } : p));

  const upload = async (files: File[]) => {
    const valid = files.filter((f) => {
      if (!ACCEPT.includes(f.type)) {
        toast.error(`${f.name}: use JPG, PNG, WebP or AVIF.`);
        return false;
      }
      if (f.size > MAX) {
        toast.error(`${f.name}: images must be 4 MB or smaller.`);
        return false;
      }
      return true;
    });
    if (!valid.length) return;
    setQueue(valid.map((f) => ({ name: f.name, state: "waiting" })));
    // One request per file keeps each upload small and reports progress per image.
    for (const [i, file] of valid.entries()) {
      setQueue((q) => q.map((x, j) => (j === i ? { ...x, state: "uploading" } : x)));
      try {
        const fd = new FormData();
        fd.append("files", file);
        const images = await api<Img[]>(`/admin/products/${product.id}/images`, { method: "POST", body: fd });
        setImages(images);
        setQueue((q) => q.map((x, j) => (j === i ? { ...x, state: "done" } : x)));
      } catch (e) {
        setQueue((q) => q.map((x, j) => (j === i ? { ...x, state: "error", error: (e as Error).message } : x)));
      }
    }
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    setTimeout(() => setQueue((q) => q.filter((x) => x.state === "error")), 2500);
  };

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { alt?: string; isPrimary?: boolean } }) => patch<Img[]>(`/admin/images/${id}`, body),
    onSuccess: setImages,
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del<Img[]>(`/admin/images/${id}`),
    onSuccess: (imgs) => {
      setImages(imgs);
      toast.success("Image deleted from Cloudinary.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reorder = useMutation({
    mutationFn: (ids: string[]) => patch<Img[]>(`/admin/products/${product.id}/images/order`, { ids }),
    onSuccess: setImages,
    onError: (e: Error) => toast.error(e.message),
  });

  // Display order matches the storefront: primary first, then sortOrder.
  const images = product.images;
  const move = (idx: number, dir: -1 | 1) => {
    const ids = images.map((i) => i.id);
    const j = idx + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[idx], ids[j]] = [ids[j], ids[idx]];
    reorder.mutate(ids);
  };

  return (
    <div className="space-y-6">
      <Panel title="Upload images">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void upload([...e.dataTransfer.files]);
          }}
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition",
            dragging ? "border-brand bg-accent/60" : "border-border bg-muted/40",
          )}
        >
          <UploadCloud className="size-10 text-brand" />
          <p className="mt-3 font-semibold">Drag images here, or</p>
          <button type="button" className={cn(btn.primary, "mt-3")} onClick={() => input.current?.click()}>
            <ImagePlus className="size-4" /> Choose files
          </button>
          <p className="mt-3 text-xs text-muted-foreground">JPG, PNG, WebP or AVIF · up to 4 MB each · stored on Cloudinary</p>
          <input
            ref={input}
            type="file"
            multiple
            accept={ACCEPT.join(",")}
            className="hidden"
            onChange={(e) => {
              void upload([...(e.target.files ?? [])]);
              e.target.value = "";
            }}
          />
        </div>
        {queue.length ? (
          <ul className="mt-4 space-y-2 text-sm">
            {queue.map((q, i) => (
              <li key={`${q.name}-${i}`} className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2">
                <span className="truncate">{q.name}</span>
                <span className={cn("shrink-0 text-xs font-semibold", q.state === "error" ? "text-destructive" : q.state === "done" ? "text-emerald-700" : "text-muted-foreground")}>
                  {q.state === "uploading" ? <Loader2 className="inline size-3.5 animate-spin" /> : null}{" "}
                  {q.state === "error" ? q.error : q.state === "done" ? "Uploaded" : q.state === "uploading" ? "Uploading…" : "Waiting"}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>

      <Panel title={`Images (${images.length})`}>
        {images.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {images.map((img, idx) => (
              <li key={img.id} className={cn("overflow-hidden rounded-2xl border bg-white", img.isPrimary ? "border-brand ring-2 ring-brand/30" : "border-lavender")}>
                <div className="relative">
                  <ProductImage src={img.url} alt={img.alt ?? ""} sizes="300px" className="aspect-square" />
                  {img.isPrimary ? (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">
                      <Star className="size-3 fill-current" /> Primary
                    </span>
                  ) : null}
                </div>
                <div className="space-y-2 p-3">
                  <input
                    aria-label="Alt text"
                    defaultValue={img.alt ?? ""}
                    placeholder="Alt text (describe the image)"
                    className={cn(inputCls, "h-9 text-xs")}
                    onBlur={(e) => {
                      if (e.target.value !== (img.alt ?? "")) update.mutate({ id: img.id, body: { alt: e.target.value } });
                    }}
                  />
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex">
                      {/* The primary image always leads; the others reorder behind it. */}
                      <button
                        type="button"
                        className={btn.ghost}
                        aria-label="Move earlier"
                        disabled={img.isPrimary || idx === 0 || images[idx - 1]?.isPrimary || reorder.isPending}
                        onClick={() => move(idx, -1)}
                      >
                        <ArrowLeft className="size-4" />
                      </button>
                      <button
                        type="button"
                        className={btn.ghost}
                        aria-label="Move later"
                        disabled={img.isPrimary || idx === images.length - 1 || reorder.isPending}
                        onClick={() => move(idx, 1)}
                      >
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                    {!img.isPrimary ? (
                      <button type="button" className={btn.ghost} onClick={() => update.mutate({ id: img.id, body: { isPrimary: true } })}>
                        <Star className="size-4" /> Primary
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className={cn(btn.ghost, "hover:bg-destructive/10 hover:text-destructive")}
                      aria-label="Delete image"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (confirm("Delete this image? It will also be removed from Cloudinary.")) remove.mutate(img.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No images yet — the storefront shows a placeholder until you upload one.</p>
        )}
      </Panel>
    </div>
  );
}
