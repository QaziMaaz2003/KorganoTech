"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/client-api";
import type { FilterSize, StoreSettings } from "@/lib/types";
import { useHydrated } from "./use-hydrated";

// Both hide their data until hydration so streamed sections match the server HTML.

export function useStoreSettings() {
  const hydrated = useHydrated();
  const q = useQuery({
    queryKey: ["settings", "store"],
    queryFn: () => get<StoreSettings>("/settings/store"),
    staleTime: 5 * 60_000,
  });
  return { data: hydrated ? q.data : undefined, isLoading: !hydrated || q.isLoading };
}

export function useFilterSizes() {
  const hydrated = useHydrated();
  const q = useQuery({
    queryKey: ["sizes"],
    queryFn: () => get<FilterSize[]>("/products/sizes"),
    staleTime: 5 * 60_000,
  });
  return { data: hydrated ? q.data : undefined, isLoading: !hydrated || q.isLoading };
}
