import type { FilterSize } from "./types";

export const DEPTHS = [1, 2, 4] as const;

export function depthLabel(d: number) {
  return `${d}" filters`;
}

/** Groups sizes like FilterKing's mega menu: Narrow / Medium / Wide by width. */
export function groupByWidth(sizes: FilterSize[]) {
  return [
    { label: 'Narrow (under 16")', items: sizes.filter((s) => s.width < 16) },
    { label: 'Medium (16"–19")', items: sizes.filter((s) => s.width >= 16 && s.width < 20) },
    { label: 'Wide (20" and up)', items: sizes.filter((s) => s.width >= 20) },
  ].filter((g) => g.items.length > 0);
}

export function sizesForDepth(sizes: FilterSize[], depth: number) {
  return sizes.filter((s) => s.depth === depth);
}

export const shopSizeHref = (size: string) => `/shop?size=${encodeURIComponent(size)}`;
