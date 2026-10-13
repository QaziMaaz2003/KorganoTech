"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { del, patch, post, get } from "@/lib/client-api";
import { useCartStore } from "@/lib/cart-store";
import type { Cart } from "@/lib/types";
import { useMe } from "./use-auth";

/**
 * One cart API for guests and signed-in shoppers.
 * - Signed in: the server cart (persists across devices).
 * - Guest: lines live in localStorage and are priced by POST /cart/quote, so
 *   prices and stock always come from the database.
 */
export function useCart() {
  const qc = useQueryClient();
  const { data: user, isLoading: userLoading } = useMe();
  const signedIn = Boolean(user);
  const guestLines = useCartStore((s) => s.guestLines);
  const store = useCartStore;

  const serverCart = useQuery({
    queryKey: ["cart", "server"],
    queryFn: () => get<Cart>("/cart"),
    enabled: signedIn,
    staleTime: 15_000,
  });

  const guestCart = useQuery({
    queryKey: ["cart", "guest", guestLines],
    queryFn: () => post<Cart>("/cart/quote", { items: guestLines }),
    enabled: !userLoading && !signedIn && guestLines.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  const cart: Cart | undefined = signedIn
    ? serverCart.data
    : guestLines.length
      ? guestCart.data
      : undefined;

  const setServer = (c: Cart) => qc.setQueryData(["cart", "server"], c);

  const add = useMutation({
    mutationFn: async ({ variantId, quantity }: { variantId: string; quantity: number }) => {
      if (signedIn) {
        setServer(await post<Cart>("/cart/items", { variantId, quantity }));
      } else {
        store.getState().addGuest(variantId, quantity);
      }
    },
    onSuccess: () => store.getState().setDrawerOpen(true),
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ lineId, quantity }: { lineId: string; quantity: number }) => {
      if (signedIn) setServer(await patch<Cart>(`/cart/items/${lineId}`, { quantity }));
      else store.getState().setGuestQuantity(lineId, quantity);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (lineId: string) => {
      if (signedIn) setServer(await del<Cart>(`/cart/items/${lineId}`));
      else store.getState().removeGuest(lineId);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const count = signedIn
    ? (cart?.itemCount ?? 0)
    : guestLines.reduce((n, l) => n + l.quantity, 0);

  return {
    cart,
    count,
    signedIn,
    isEmpty: signedIn ? !cart || cart.lines.length === 0 : guestLines.length === 0,
    isLoading: userLoading || (signedIn ? serverCart.isLoading : guestCart.isLoading),
    add,
    update,
    remove,
  };
}
