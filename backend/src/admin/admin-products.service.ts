import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import {
  paginate,
  parseSize,
  slugify,
  toPage,
} from '../common/utils/format.js';
import type {
  AdminProductsQueryDto,
  CreateProductDto,
  CreateVariantDto,
  GenerateVariantsDto,
  ReorderImagesDto,
  UpdateImageDto,
  UpdateProductDto,
  UpdateVariantDto,
} from './dto/admin.dto.js';

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

/** "16" → "16", "15.50" → "15.5" */
const trimNum = (n: number) => String(Number(n.toFixed(2)));

/** Nominal 16x25x1 → actual "15.5 x 24.5 x 0.75" (standard HVAC undersizing). */
export function defaultActualSize(size: string) {
  const s = parseSize(size);
  if (!s) return null;
  return `${trimNum(s.width - 0.5)} x ${trimNum(s.height - 0.5)} x ${trimNum(Math.max(s.depth - 0.25, 0.25))}`;
}

function skuFor(prefix: string, size: string, merv: number | null | undefined, pack: number) {
  const sizePart = size.toUpperCase().replace(/\./g, 'P').replace(/[^A-Z0-9]/g, '');
  return [prefix.toUpperCase() || 'KT', sizePart, merv ? `M${merv}` : null, `${pack}PK`]
    .filter(Boolean)
    .join('-');
}

@Injectable()
export class AdminProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ─── Products ────────────────────────────────────────────────────────────

  async list(query: AdminProductsQueryDto) {
    const { skip, take, page, pageSize } = paginate(query.page, query.pageSize ?? 20);
    const where: Prisma.ProductWhereInput = {};
    if (query.category) where.category = { slug: query.category };
    if (query.status) where.status = query.status;
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { slug: { contains: query.q, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: query.q, mode: 'insensitive' } } } },
      ];
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          category: { select: { id: true, slug: true, name: true } },
          images: { orderBy: imageOrder, take: 1 },
          variants: { select: { price: true, stock: true, isActive: true, lowStockThreshold: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);
    const items = rows.map(({ variants, images, ...p }) => {
      const active = variants.filter((v) => v.isActive);
      const prices = active.map((v) => v.price.toNumber());
      return {
        ...p,
        image: images[0] ?? null,
        variantCount: variants.length,
        activeVariantCount: active.length,
        totalStock: active.reduce((n, v) => n + v.stock, 0),
        lowStockCount: active.filter((v) => v.stock <= v.lowStockThreshold).length,
        priceFrom: prices.length ? Math.min(...prices) : null,
        priceTo: prices.length ? Math.max(...prices) : null,
      };
    });
    return toPage(items, total, page, pageSize);
  }

  async get(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: imageOrder },
        variants: {
          orderBy: variantOrder,
          include: { _count: { select: { orderItems: true } } },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found.');
    const orderCount = await this.prisma.orderItem.count({ where: { productId: id } });
    return { ...product, orderCount };
  }

  async create(dto: CreateProductDto) {
    await this.ensureCategory(dto.categoryId);
    const slug = await this.uniqueSlug(dto.slug || slugify(dto.name));
    const product = await this.prisma.product.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        slug,
        shortDescription: dto.shortDescription || null,
        description: dto.description || null,
        features: dto.features ?? [],
        specs: (dto.specs ?? []) as unknown as Prisma.InputJsonValue,
        filterType: dto.filterType || null,
        status: dto.status ?? 'DRAFT',
        isPurchasable: dto.isPurchasable ?? true,
        isFeatured: dto.isFeatured ?? false,
        badge: dto.badge || null,
        availabilityNote: dto.availabilityNote || null,
        seoTitle: dto.seoTitle || null,
        seoDescription: dto.seoDescription || null,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    return this.get(product.id);
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found.');
    if (dto.categoryId) await this.ensureCategory(dto.categoryId);
    let slug: string | undefined;
    if (dto.slug && dto.slug !== existing.slug) slug = await this.uniqueSlug(dto.slug, id);

    const data: Prisma.ProductUncheckedUpdateInput = {
      categoryId: dto.categoryId,
      name: dto.name,
      slug,
      shortDescription: dto.shortDescription,
      description: dto.description,
      features: dto.features,
      specs: dto.specs ? (dto.specs as unknown as Prisma.InputJsonValue) : undefined,
      filterType: dto.filterType,
      status: dto.status,
      isPurchasable: dto.isPurchasable,
      isFeatured: dto.isFeatured,
      badge: dto.badge,
      availabilityNote: dto.availabilityNote,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      sortOrder: dto.sortOrder,
    };
    await this.prisma.product.update({ where: { id }, data });
    return this.get(id);
  }

  /**
   * Permanently deletes the product, its variants and its Cloudinary images.
   * Order history is unaffected: order items keep their own name/price/image
   * snapshot (variantId is set to null, productId is a plain column).
   */
  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!product) throw new NotFoundException('Product not found.');
    await this.prisma.product.delete({ where: { id } });
    await Promise.all(product.images.map((img) => this.cloudinary.destroy(img.publicId)));
    return { deleted: true };
  }

  // ─── Images ──────────────────────────────────────────────────────────────

  async uploadImages(productId: string, files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('Choose at least one image.');
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });
    if (!product) throw new NotFoundException('Product not found.');
    files.forEach((f) => this.cloudinary.validate(f));

    const uploaded = [];
    for (const file of files) {
      uploaded.push(await this.cloudinary.uploadFile(file, `products/${productId}`));
    }
    const hasPrimary = product.images.some((i) => i.isPrimary);
    const start = product.images.reduce((m, i) => Math.max(m, i.sortOrder), -1) + 1;
    await this.prisma.productImage.createMany({
      data: uploaded.map((u, i) => ({
        productId,
        url: u.url,
        publicId: u.publicId,
        width: u.width,
        height: u.height,
        alt: product.name,
        sortOrder: start + i,
        isPrimary: !hasPrimary && i === 0,
      })),
    });
    return this.images(productId);
  }

  async reorderImages(productId: string, dto: ReorderImagesDto) {
    const images = await this.prisma.productImage.findMany({ where: { productId } });
    const ids = new Set(images.map((i) => i.id));
    if (dto.ids.some((id) => !ids.has(id))) {
      throw new BadRequestException('Image list does not match this product.');
    }
    await this.prisma.$transaction(
      dto.ids.map((id, index) =>
        this.prisma.productImage.update({ where: { id }, data: { sortOrder: index } }),
      ),
    );
    return this.images(productId);
  }

  async updateImage(imageId: string, dto: UpdateImageDto) {
    const image = await this.prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found.');
    await this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.productImage.updateMany({
          where: { productId: image.productId },
          data: { isPrimary: false },
        });
      }
      await tx.productImage.update({
        where: { id: imageId },
        data: { alt: dto.alt, isPrimary: dto.isPrimary },
      });
    });
    return this.images(image.productId);
  }

  async deleteImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found.');
    await this.prisma.productImage.delete({ where: { id: imageId } });
    if (image.isPrimary) {
      const next = await this.prisma.productImage.findFirst({
        where: { productId: image.productId },
        orderBy: { sortOrder: 'asc' },
      });
      if (next) {
        await this.prisma.productImage.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }
    await this.cloudinary.destroy(image.publicId);
    return this.images(image.productId);
  }

  private images(productId: string) {
    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: imageOrder,
    });
  }

  // ─── Variants ────────────────────────────────────────────────────────────

  async createVariant(productId: string, dto: CreateVariantDto, actorId: string) {
    await this.ensureProduct(productId);
    const size = dto.size.replace(/\s+/g, '').toLowerCase();
    const dims = parseSize(size);
    const sku = await this.uniqueSku(
      dto.sku?.toUpperCase() || skuFor('KT', size, dto.mervRating, dto.packQuantity),
    );
    try {
      const variant = await this.prisma.productVariant.create({
        data: {
          productId,
          sku,
          size: dims ? size : dto.size.trim(),
          width: dims?.width ?? null,
          height: dims?.height ?? null,
          depth: dims?.depth ?? null,
          actualSize: dto.actualSize || (dims ? defaultActualSize(size) : null),
          mervRating: dto.mervRating ?? null,
          packQuantity: dto.packQuantity,
          price: dto.price,
          compareAtPrice: dto.compareAtPrice ?? null,
          stock: dto.stock ?? 0,
          lowStockThreshold: dto.lowStockThreshold ?? 10,
          isActive: dto.isActive ?? true,
        },
      });
      if (variant.stock > 0) {
        await this.prisma.stockMovement.create({
          data: {
            variantId: variant.id,
            delta: variant.stock,
            stockAfter: variant.stock,
            reason: 'RESTOCK',
            note: 'Initial stock',
            userId: actorId,
          },
        });
      }
      return variant;
    } catch (e) {
      throw this.variantConflict(e);
    }
  }

  async updateVariant(variantId: string, dto: UpdateVariantDto, actorId: string) {
    const existing = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!existing) throw new NotFoundException('Variant not found.');

    const data: Prisma.ProductVariantUpdateInput = {
      actualSize: dto.actualSize,
      mervRating: dto.mervRating,
      packQuantity: dto.packQuantity,
      price: dto.price,
      compareAtPrice: dto.compareAtPrice,
      lowStockThreshold: dto.lowStockThreshold,
      isActive: dto.isActive,
    };
    if (dto.size && dto.size !== existing.size) {
      const size = dto.size.replace(/\s+/g, '').toLowerCase();
      const dims = parseSize(size);
      data.size = dims ? size : dto.size.trim();
      data.width = dims?.width ?? null;
      data.height = dims?.height ?? null;
      data.depth = dims?.depth ?? null;
    }
    if (dto.sku && dto.sku.toUpperCase() !== existing.sku) {
      data.sku = await this.uniqueSku(dto.sku.toUpperCase());
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (dto.stock !== undefined && dto.stock !== existing.stock) {
          data.stock = dto.stock;
          await tx.stockMovement.create({
            data: {
              variantId,
              delta: dto.stock - existing.stock,
              stockAfter: dto.stock,
              reason: 'ADJUSTMENT',
              note: 'Edited in product variants',
              userId: actorId,
            },
          });
        }
        return tx.productVariant.update({ where: { id: variantId }, data });
      });
    } catch (e) {
      throw this.variantConflict(e);
    }
  }

  async deleteVariant(variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { _count: { select: { orderItems: true } } },
    });
    if (!variant) throw new NotFoundException('Variant not found.');
    if (variant._count.orderItems > 0) {
      await this.prisma.productVariant.update({
        where: { id: variantId },
        data: { isActive: false },
      });
      return { deactivated: true, deleted: false };
    }
    await this.prisma.productVariant.delete({ where: { id: variantId } });
    return { deactivated: false, deleted: true };
  }

  /** Creates every size × (MERV, pack, price) combination that doesn't exist yet. */
  async generateVariants(productId: string, dto: GenerateVariantsDto, actorId: string) {
    await this.ensureProduct(productId);
    const existing = await this.prisma.productVariant.findMany({
      where: { productId },
      select: { size: true, mervRating: true, packQuantity: true },
    });
    const key = (size: string, merv: number | null | undefined, pack: number) =>
      `${size}|${merv ?? ''}|${pack}`;
    const seen = new Set(existing.map((v) => key(v.size, v.mervRating, v.packQuantity)));
    const allSkus = new Set(
      (await this.prisma.productVariant.findMany({ select: { sku: true } })).map((v) => v.sku),
    );

    const rows: Prisma.ProductVariantCreateManyInput[] = [];
    let skipped = 0;
    for (const raw of dto.sizes) {
      const size = raw.replace(/\s+/g, '').toLowerCase();
      const dims = parseSize(size)!;
      for (const p of dto.prices) {
        const k = key(size, p.mervRating, p.packQuantity);
        if (seen.has(k)) {
          skipped++;
          continue;
        }
        seen.add(k);
        let sku = skuFor(dto.skuPrefix || 'KT', size, p.mervRating, p.packQuantity);
        for (let n = 2; allSkus.has(sku); n++) sku = `${sku.replace(/-\d+$/, '')}-${n}`;
        allSkus.add(sku);
        rows.push({
          productId,
          sku,
          size,
          width: dims.width,
          height: dims.height,
          depth: dims.depth,
          actualSize: dto.autoActualSize === false ? null : defaultActualSize(size),
          mervRating: p.mervRating ?? null,
          packQuantity: p.packQuantity,
          price: p.price,
          compareAtPrice: p.compareAtPrice ?? null,
          stock: dto.stock,
          lowStockThreshold: dto.lowStockThreshold ?? 10,
        });
      }
    }

    if (rows.length) {
      await this.prisma.productVariant.createMany({ data: rows, skipDuplicates: true });
      if (dto.stock > 0) {
        const created = await this.prisma.productVariant.findMany({
          where: { sku: { in: rows.map((r) => r.sku) } },
          select: { id: true, stock: true },
        });
        await this.prisma.stockMovement.createMany({
          data: created.map((v) => ({
            variantId: v.id,
            delta: v.stock,
            stockAfter: v.stock,
            reason: 'RESTOCK' as const,
            note: 'Initial stock (bulk generator)',
            userId: actorId,
          })),
        });
      }
    }
    return { created: rows.length, skipped };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async ensureCategory(id: string) {
    const exists = await this.prisma.category.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new BadRequestException('Choose a valid category.');
  }

  private async ensureProduct(id: string) {
    const exists = await this.prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Product not found.');
  }

  private async uniqueSlug(base: string, excludeId?: string) {
    const root = base || 'product';
    for (let n = 1; ; n++) {
      const slug = n === 1 ? root : `${root}-${n}`;
      const clash = await this.prisma.product.findFirst({
        where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
        select: { id: true },
      });
      if (!clash) return slug;
    }
  }

  private async uniqueSku(base: string) {
    for (let n = 1; ; n++) {
      const sku = n === 1 ? base : `${base}-${n}`;
      const clash = await this.prisma.productVariant.findUnique({ where: { sku }, select: { id: true } });
      if (!clash) return sku;
    }
  }

  private variantConflict(e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return new ConflictException(
        'A variant with this size, MERV rating and pack quantity already exists.',
      );
    }
    return e;
  }
}
