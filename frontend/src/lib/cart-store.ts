"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CustomSpec } from "./types";

/** A guest cart line: a catalog variant or a custom size, never both. */
export interface GuestLine {
  variantId?: string;
  custom?: CustomSpec;
  quantity: number;
}

/** Identity of a guest line. Matches the id the API returns when pricing the cart. */
export const guestLineKey = (l: Pick<GuestLine, "variantId" | "custom">) =>
  l.variantId ??
  (l.custom
    ? `${l.custom.width}x${l.custom.height}x${l.custom.depth}-M${l.custom.mervRating}-${l.custom.packQuantity}pk`
    : "");

interface CartUiState {
  /** Cart held in localStorage until the shopper signs in. */
  guestLines: GuestLine[];
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addGuest: (line: Pick<GuestLine, "variantId" | "custom">, quantity: number) => void;
  setGuestQuantity: (key: string, quantity: number) => void;
  removeGuest: (key: string) => void;
  clearGuest: () => void;
}

const MAX = 99;

export const useCartStore = create<CartUiState>()(
  persist(
    (set) => ({
      guestLines: [],
      drawerOpen: false,
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
      addGuest: (line, quantity) =>
        set((s) => {
          const key = guestLineKey(line);
          const existing = s.guestLines.find((l) => guestLineKey(l) === key);
          return {
            guestLines: existing
              ? s.guestLines.map((l) =>
                  guestLineKey(l) === key ? { ...l, quantity: Math.min(MAX, l.quantity + quantity) } : l,
                )
              : [...s.guestLines, { ...line, quantity: Math.min(MAX, quantity) }],
          };
        }),
      setGuestQuantity: (key, quantity) =>
        set((s) => ({
          guestLines: s.guestLines.map((l) =>
            guestLineKey(l) === key ? { ...l, quantity: Math.max(1, Math.min(MAX, quantity)) } : l,
          ),
        })),
      removeGuest: (key) =>
        set((s) => ({ guestLines: s.guestLines.filter((l) => guestLineKey(l) !== key) })),
      clearGuest: () => set({ guestLines: [] }),
    }),
    {
      name: "kt-guest-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ guestLines: s.guestLines }),
      // Rehydrated after mount (see Providers) so server and client HTML match.
      skipHydration: true,
    },
  ),
);
