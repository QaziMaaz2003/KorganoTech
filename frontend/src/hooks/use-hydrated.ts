"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * False while rendering on the server and during hydration, true afterwards.
 * Client queries can resolve mid-hydration (React hydrates in chunks), so
 * anything rendered from client-only data waits for this to stay in sync
 * with the server HTML.
 */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
