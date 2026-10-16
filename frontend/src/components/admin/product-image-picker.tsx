"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Star, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel, btn } from "./admin-ui";
import { ACCEPT, MAX } from "./product-images";

/**
 * Pick images while creating a product. Files are held in the browser and
 * uploaded to Cloudinary (via the API) right after the product is created.
 */
export function ProductImagePicker({
  files,
  onChange,
  disabled,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const add = (incoming: File[]) => {
    const valid = incoming.filter((f) => {
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
    if (valid.length) onChange([...files, ...valid]);
  };

  return (
    <Panel title="Images">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) add([...e.dataTransfer.files]);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition",
          dragging ? "border-brand bg-accent/60" : "border-border bg-muted/40",
        )}
      >
        <UploadCloud className="size-9 text-brand" />
        <p className="mt-2 font-semibold">Drag images here, or</p>
        <button type="button" className={cn(btn.primary, "mt-3")} disabled={disabled} onClick={() => input.current?.click()}>
          <ImagePlus className="size-4" /> Choose files
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          JPG, PNG, WebP or AVIF · up to 4 MB each · uploaded to Cloudinary when you create the product
        </p>
        <input
          ref={input}
          type="file"
          multiple
          accept={ACCEPT.join(",")}
          className="hidden"
          aria-label="Product images"
          onChange={(e) => {
            add([...(e.target.files ?? [])]);
            e.target.value = "";
          }}
        />
      </div>

      {files.length ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}-${i}`} className={cn("relative overflow-hidden rounded-xl border bg-white", i === 0 ? "border-brand ring-2 ring-brand/30" : "border-lavender")}>
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
              <img src={previews[i]} alt={f.name} className="aspect-square w-full object-cover" />
              {i === 0 ? (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">
                  <Star className="size-3 fill-current" /> Primary
                </span>
              ) : null}
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                disabled={disabled}
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-white/90 text-primary shadow transition hover:bg-destructive hover:text-white disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
              <p className="truncate px-2 py-1.5 text-xs text-muted-foreground">{f.name}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">The first image becomes the primary image. You can reorder or change it later.</p>
      )}
    </Panel>
  );
}
