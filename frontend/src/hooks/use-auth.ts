"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, get, post } from "@/lib/client-api";
import { useCartStore } from "@/lib/cart-store";
import type { Cart, User } from "@/lib/types";

export const ME_KEY = ["me"] as const;

/** The signed-in user, or null for guests. */
export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      try {
        const { user } = await get<{ user: User }>("/auth/me");
        return user;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}

/** After sign-in: fold the localStorage cart into the account cart. */
function useMergeGuestCart() {
  const qc = useQueryClient();
  return async () => {
    const { guestLines, clearGuest } = useCartStore.getState();
    if (guestLines.length) {
      try {
        const cart = await post<Cart>("/cart/merge", { items: guestLines });
        qc.setQueryData(["cart", "server"], cart);
      } catch {
        /* merging is best effort */
      }
      clearGuest();
    }
    await qc.invalidateQueries({ queryKey: ["cart"] });
  };
}

export function useLogin() {
  const qc = useQueryClient();
  const merge = useMergeGuestCart();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      post<{ user: User }>("/auth/login", body),
    onSuccess: async ({ user }) => {
      qc.setQueryData(ME_KEY, user);
      await merge();
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  const merge = useMergeGuestCart();
  return useMutation({
    mutationFn: (body: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      password: string;
    }) => post<{ user: User }>("/auth/register", body),
    onSuccess: async ({ user }) => {
      qc.setQueryData(ME_KEY, user);
      await merge();
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => post("/auth/logout"),
    onSettled: () => {
      qc.setQueryData(ME_KEY, null);
      qc.removeQueries({ queryKey: ["cart"] });
      qc.removeQueries({ queryKey: ["orders"] });
      qc.removeQueries({ queryKey: ["addresses"] });
      qc.removeQueries({ queryKey: ["admin"] });
    },
  });
}
