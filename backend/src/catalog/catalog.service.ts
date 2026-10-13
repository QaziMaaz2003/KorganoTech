import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { QueryProductsDto } from './dto/query-products.dto.js';

const imageOrder: Prisma.ProductImageOrderByWithRelationInput[] = [
  { isPrimary: 'desc' },
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
];

const variantOrder: Prisma.ProductVariantOrderByWithRelationInput[] = [
  { depth: 'asc' },
  { width: 'asc' },
  { height: 'asc' },
  { mervRating: 'asc' },
  { packQuantity: 'asc' },
];

const listInclude = {
  category: { select: { slug: true, name: true, statusLabel: true } },
  images: { orderBy: imageOrder, take: 2 },
  variants: { where: { isActive: true }, orderBy: variantOrder },
} satisfies Prisma.ProductInclude;

type ListProduct = Prisma.ProductGetPayload<{ include: typeof listInclude }>;
type ListVariant = ListProduct['variants'][number];

const num = (d: Prisma.Decimal | null | undefined) =>
  d === null || d === undefined ? null : d.toNumber();

const uniqSorted = <T extends number | string>(xs: T[]) =>
  [...new Set(xs)].sort((a, b) =>
    typeof a === 'number' ? (a as number) - (b as number) : String(a).localeCompare(String(b)),
  );

/** Sort comparator for "WxHxD" sizes: by depth, then width, then height. */
function sizeKey(v: { width: Prisma.Decimal | null; height: Prisma.Decimal | null; depth: Prisma.Decimal | null }) {
  return [num(v.depth) ?? 999, num(v.width) ?? 999, num(v.height) ?? 999];
}
function compareSizes(a: number[], b: number[]) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Categories ─────────────────────────────────────────────────────────

  async listCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: { where: { status: 'ACTIVE' } } } },
      },
    });
    return categories.map(({ _count, ...c }) => ({
      ...c,
      productCount: _count.products,
    }));
  }

  async getCategory(slug: string) {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) throw new NotFoundException('Category not found.');
    const products = await this.prisma.product.findMany({
      where: { categoryId: category.id, status: 'ACTIVE' },
      include: listInclude,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return {
      ...category,
      products: products.map((p) => this.summarize(p, p.variants)),
    };
  }

  // ─── Products ───────────────────────────────────────────────────────────

  async listProducts(query: QueryProductsDto) {
    const where: Prisma.ProductWhereInput = { status: 'ACTIVE' };
    if (query.category) where.category = { slug: query.category };
    if (query.type) where.filterType = { equals: query.type, mode: 'insensitive' };
    if (query.purchasable) where.isPurchasable = true;
    if (query.featured) where.isFeatured = true;
    if (query.q) {
      const q = query.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { shortDescription: { contains: q, mode: 'insensitive' } },
        { filterType: { contains: q, mode: 'insensitive' } },
        { variants: { some: { isActive: true, size: { contains: q.replace(/\s+/g, ''), mode: 'insensitive' } } } },
        { variants: { some: { isActive: true, sku: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      include: listInclude,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    // Size finder: W/H/D in either orientation map onto a size label.
    const size =
      query.size?.replace(/\s+/g, '').toLowerCase() ||
      (query.width && query.height && query.depth
        ? `${query.width}x${query.height}x${query.depth}`
        : undefined);
    const altSize =
      size && /^[\d.]+x[\d.]+x[\d.]+$/.test(size)
        ? (() => {
            const [w, h, d] = size.split('x');
            return `${h}x${w}x${d}`;
          })()
        : undefined;

    const matchesVariant = (v: ListVariant) =>
      (!size || v.size.toLowerCase() === size || v.size.toLowerCase() === altSize) &&
      (!query.merv || v.mervRating === query.merv) &&
      (query.depth === undefined || size || num(v.depth) === query.depth);

    const filtering = Boolean(size || query.merv || query.depth !== undefined);
    const matched = products
      .map((p) => ({ p, vs: filtering ? p.variants.filter(matchesVariant) : p.variants }))
      .filter(({ vs }) => !filtering || vs.length > 0);

    let summaries = matched.map(({ p, vs }) => this.summarize(p, vs, filtering));

    switch (query.sort) {
      case 'price-asc':
        summaries.sort((a, b) => (a.priceFrom ?? Infinity) - (b.priceFrom ?? Infinity));
        break;
      case 'price-desc':
        summaries.sort((a, b) => (b.priceFrom ?? -Infinity) - (a.priceFrom ?? -Infinity));
        break;
      case 'newest':
        summaries.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case 'name':
        summaries.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        summaries.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }

    // Facets describe everything available in the current category/search,
    // independent of the size/MERV filters, so the sidebar never dead-ends.
    const allVariants = products.flatMap((p) => p.variants);
    const sizeMap = new Map<string, ListVariant>();
    for (const v of allVariants) if (!sizeMap.has(v.size)) sizeMap.set(v.size, v);
    const facets = {
      sizes: [...sizeMap.values()]
        .sort((a, b) => compareSizes(sizeKey(a), sizeKey(b)))
        .map((v) => v.size),
      mervRatings: uniqSorted(
        allVariants.map((v) => v.mervRating).filter((m): m is number => m !== null),
      ),
      depths: uniqSorted(
        allVariants.map((v) => num(v.depth)).filter((d): d is number => d !== null),
      ),
      types: uniqSorted(
        products.map((p) => p.filterType).filter((t): t is string => Boolean(t)),
      ),
    };

    const pageSize = query.pageSize ?? 24;
    const page = Math.max(1, query.page ?? 1);
    const total = summaries.length;
    summaries = summaries.slice((page - 1) * pageSize, page * pageSize);

    return {
      items: summaries,
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
      facets,
      appliedSize: size ?? null,
    };
  }

  async getProduct(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: 'ACTIVE' },
      include: {
        category: true,
        images: { orderBy: imageOrder },
        variants: { where: { isActive: true }, orderBy: variantOrder },
      },
    });
    if (!product) throw new NotFoundException('Product not found.');

    const related = await this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        id: { not: product.id },
        OR: [{ categoryId: product.categoryId }, { isFeatured: true }],
      },
      include: listInclude,
      orderBy: [{ sortOrder: 'asc' }],
      take: 4,
    });

    const variants = product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      width: v.width,
      height: v.height,
      depth: v.depth,
      actualSize: v.actualSize,
      mervRating: v.mervRating,
      packQuantity: v.packQuantity,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      stock: v.stock,
      lowStockThreshold: v.lowStockThreshold,
    }));

    const sizes: { size: string; depth: number | null; actualSize: string | null }[] = [];
    for (const v of product.variants) {
      if (!sizes.some((s) => s.size === v.size)) {
        sizes.push({ size: v.size, depth: num(v.depth), actualSize: v.actualSize });
      }
    }

    return {
      ...product,
      variants,
      options: {
        sizes,
        mervRatings: uniqSorted(
          product.variants.map((v) => v.mervRating).filter((m): m is number => m !== null),
        ),
        packQuantities: uniqSorted(product.variants.map((v) => v.packQuantity)),
      },
      related: related.map((p) => this.summarize(p, p.variants)),
    };
  }

  /** Distinct WxHxD sizes across purchasable products, for the size finder. */
  async listSizes() {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        isActive: true,
        width: { not: null },
        height: { not: null },
        depth: { not: null },
        product: { status: 'ACTIVE', isPurchasable: true },
      },
      select: { size: true, width: true, height: true, depth: true, price: true, packQuantity: true },
    });
    const map = new Map<string, { size: string; width: number; height: number; depth: number; pricePerFilterFrom: number }>();
    for (const v of variants) {
      const perFilter = v.price.toNumber() / v.packQuantity;
      const existing = map.get(v.size);
      if (!existing) {
        map.set(v.size, {
          size: v.size,
          width: num(v.width)!,
          height: num(v.height)!,
          depth: num(v.depth)!,
          pricePerFilterFrom: perFilter,
        });
      } else if (perFilter < existing.pricePerFilterFrom) {
        existing.pricePerFilterFrom = perFilter;
      }
    }
    return [...map.values()]
      .map((s) => ({ ...s, pricePerFilterFrom: Math.round(s.pricePerFilterFrom * 100) / 100 }))
      .sort((a, b) => a.depth - b.depth || a.width - b.width || a.height - b.height);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  private summarize(p: ListProduct, variants: ListVariant[], filtered = false) {
    const prices = variants.map((v) => v.price.toNumber());
    const cheapest = variants.reduce<ListVariant | null>(
      (best, v) => (!best || v.price.lt(best.price) ? v : best),
      null,
    );
    const perFilter = variants.map((v) => v.price.toNumber() / v.packQuantity);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      badge: p.badge,
      filterType: p.filterType,
      isPurchasable: p.isPurchasable,
      isFeatured: p.isFeatured,
      availabilityNote: p.availabilityNote,
      createdAt: p.createdAt,
      category: p.category,
      image: p.images[0] ? { url: p.images[0].url, alt: p.images[0].alt } : null,
      hoverImage: p.images[1] ? { url: p.images[1].url, alt: p.images[1].alt } : null,
      priceFrom: prices.length ? Math.min(...prices) : null,
      priceTo: prices.length ? Math.max(...prices) : null,
      pricePerFilterFrom: perFilter.length
        ? Math.round(Math.min(...perFilter) * 100) / 100
        : null,
      compareAtPrice: cheapest ? num(cheapest.compareAtPrice) : null,
      mervRatings: uniqSorted(
        variants.map((v) => v.mervRating).filter((m): m is number => m !== null),
      ),
      sizeCount: new Set(variants.map((v) => v.size)).size,
      sizes: [...new Set(variants.map((v) => v.size))].slice(0, 12),
      packQuantities: uniqSorted(variants.map((v) => v.packQuantity)),
      inStock: variants.some((v) => v.stock > 0),
      variantCount: variants.length,
      /** The cheapest variant matching the active filters (for "16x25x1" cards). */
      match:
        filtered && cheapest
          ? {
              variantId: cheapest.id,
              size: cheapest.size,
              mervRating: cheapest.mervRating,
              packQuantity: cheapest.packQuantity,
              price: cheapest.price.toNumber(),
              stock: cheapest.stock,
            }
          : null,
    };
  }
}
