"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { del } from "@/lib/client-api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/** DELETE /admin/products/:id — permanent; also removes the Cloudinary images. */
export function useDeleteProduct(onDeleted?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del<{ deleted: boolean }>(`/admin/products/${id}`),
    onSuccess: () => {
      // Only the list is refreshed: the single-product query would 404 now.
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product permanently deleted.");
      onDeleted?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/**
 * Asks for confirmation before a permanent delete. Stays open while the request
 * runs; the parent closes it (via onOpenChange) once the delete succeeds.
 */
export function DeleteProductDialog({
  name,
  open,
  onOpenChange,
  pending,
  onConfirm,
}: {
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => (pending ? undefined : onOpenChange(o))}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the product, all of its sizes and prices, and its images (including the files on Cloudinary).
            Past orders keep their own record of the item. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={onConfirm} className="bg-destructive text-white hover:bg-destructive/90">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Yes, delete permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
