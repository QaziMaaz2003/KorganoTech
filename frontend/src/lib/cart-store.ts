"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface GuestLine {
  variantId: string;
  quantity: number;
}

interface CartUiState {
  /** Cart held in localStorage until the shopper signs in. */
  guestLines: GuestLine[];
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addGuest: (variantId: string, quantity: number) => void;
  setGuestQuantity: (variantId: string, quantity: number) => void;
  removeGuest: (variantId: string) => void;
  clearGuest: () => void;
}

const MAX = 99;

export const useCartStore = create<CartUiState>()(
  persist(
    (set) => ({
      guestLines: [],
      drawerOpen: false,
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
      addGuest: (variantId, quantity) =>
        set((s) => {
          const existing = s.guestLines.find((l) => l.variantId === variantId);
          return {
            guestLines: existing
              ? s.guestLines.map((l) =>
                  l.variantId === variantId
                    ? { ...l, quantity: Math.min(MAX, l.quantity + quantity) }
                    : l,
                )
              : [...s.guestLines, { variantId, quantity: Math.min(MAX, quantity) }],
          };
        }),
      setGuestQuantity: (variantId, quantity) =>
        set((s) => ({
          guestLines: s.guestLines.map((l) =>
            l.variantId === variantId ? { ...l, quantity: Math.max(1, Math.min(MAX, quantity)) } : l,
          ),
        })),
      removeGuest: (variantId) =>
        set((s) => ({ guestLines: s.guestLines.filter((l) => l.variantId !== variantId) })),
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
