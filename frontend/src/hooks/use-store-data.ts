"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/client-api";
import type { FilterSize, StoreSettings } from "@/lib/types";

export function useStoreSettings() {
  return useQuery({
    queryKey: ["settings", "store"],
    queryFn: () => get<StoreSettings>("/settings/store"),
    staleTime: 5 * 60_000,
  });
}

export function useFilterSizes() {
  return useQuery({
    queryKey: ["sizes"],
    queryFn: () => get<FilterSize[]>("/products/sizes"),
    staleTime: 5 * 60_000,
  });
}
