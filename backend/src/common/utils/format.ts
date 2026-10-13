/** Display form of an order number, e.g. 100001 → "KT-100001". */
export const formatOrderNumber = (n: number) => `KT-${n}`;

/** Accepts "KT-100001" or "100001"; returns NaN when unparseable. */
export const parseOrderNumber = (v: string) =>
  Number(String(v).replace(/^KT-/i, ''));

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/["']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** "16x25x1" → { width: 16, height: 25, depth: 1 }, or null if not WxHxD. */
export function parseSize(size: string) {
  const m = /^\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*$/i.exec(
    size,
  );
  if (!m) return null;
  return { width: Number(m[1]), height: Number(m[2]), depth: Number(m[3]) };
}

/** Human label for a variant, e.g. "16x25x1 · MERV 11 · 6-pack". */
export function variantLabel(v: {
  size: string;
  mervRating: number | null;
  packQuantity: number;
}) {
  const parts = [v.size];
  if (v.mervRating) parts.push(`MERV ${v.mervRating}`);
  if (v.packQuantity > 1) parts.push(`${v.packQuantity}-pack`);
  return parts.join(' · ');
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export function paginate(page = 1, pageSize = 20) {
  const p = Math.max(1, page);
  const s = Math.min(100, Math.max(1, pageSize));
  return { skip: (p - 1) * s, take: s, page: p, pageSize: s };
}

export function toPage<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): Page<T> {
  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
