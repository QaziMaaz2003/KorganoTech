import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';
import { computeTotals, ZERO } from '../common/utils/money.js';
import { variantLabel } from '../common/utils/format.js';
import { CustomFilterService } from '../custom-filters/custom-filter.service.js';
import {
  CUSTOM_PRODUCT_NAME,
  customKey,
  priceSpec,
  validateSpec,
  type CustomFilterConfig,
  type CustomSpec,
} from '../custom-filters/custom-filter.config.js';
import { MAX_LINE_QTY, type CartLineDto } from './dto/cart.dto.js';

/** A line being priced: a catalog variant or a custom size. */
export interface RawLine {
  id: string;
  variantId: string | null;
  custom: CustomSpec | null;
  quantity: number;
}

const variantInclude = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      isPurchasable: true,
      images: {
        orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
        take: 1,
        select: { url: true, alt: true },
      },
    },
  },
};

/** The spec exactly as stored/received, with numbers coerced. */
const toSpec = (s: Pick<CustomSpec, keyof CustomSpec>): CustomSpec => ({
  width: Number(s.width),
  height: Number(s.height),
  depth: Number(s.depth),
  mervRating: Number(s.mervRating),
  packQuantity: Number(s.packQuantity),
});

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly customFilters: CustomFilterService,
  ) {}

  private async cartFor(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async getCart(userId: string) {
    const cart = await this.cartFor(userId);
    return this.price(
      cart.items.map((i) => ({
        id: i.id,
        variantId: i.variantId,
        custom: i.customSpec ? toSpec(i.customSpec as unknown as CustomSpec) : null,
        quantity: i.quantity,
      })),
    );
  }

  /** Prices arbitrary lines (a guest's localStorage cart) without saving. */
  quote(lines: CartLineDto[]) {
    const raw: RawLine[] = [];
    for (const l of lines) {
      const line = this.parseLine(l);
      raw.push({
        id: line.custom ? customKey(line.custom) : line.variantId!,
        variantId: line.variantId,
        custom: line.custom,
        quantity: l.quantity,
      });
    }
    return this.price(raw);
  }

  async addItem(userId: string, line: CartLineDto) {
    const parsed = this.parseLine(line);
    const cart = await this.cartFor(userId);

    if (parsed.custom) {
      const cfg = await this.customFilters.getConfig();
      validateSpec(parsed.custom, cfg);
      const key = customKey(parsed.custom);
      const existing = cart.items.find((i) => i.customKey === key);
      const quantity = Math.min(MAX_LINE_QTY, (existing?.quantity ?? 0) + line.quantity);
      await this.prisma.cartItem.upsert({
        where: { cartId_customKey: { cartId: cart.id, customKey: key } },
        create: {
          cartId: cart.id,
          customKey: key,
          customSpec: parsed.custom as unknown as object,
          quantity,
        },
        update: { quantity },
      });
      return this.getCart(userId);
    }

    const variantId = parsed.variantId!;
    const variant = await this.purchasableVariant(variantId);
    const existing = cart.items.find((i) => i.variantId === variantId);
    const wanted = Math.min(MAX_LINE_QTY, (existing?.quantity ?? 0) + line.quantity);
    if (variant.stock <= 0) {
      throw new BadRequestException('Sorry, this item is out of stock.');
    }
    const quantity = Math.min(wanted, variant.stock);
    await this.prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      create: { cartId: cart.id, variantId, quantity },
      update: { quantity },
    });
    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const item = await this.ownItem(userId, itemId);
    let capped = Math.min(MAX_LINE_QTY, Math.max(1, quantity));
    if (item.variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: item.variantId },
      });
      capped = Math.max(1, Math.min(quantity, variant?.stock ?? quantity));
    }
    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: capped },
    });
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    await this.ownItem(userId, itemId);
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(userId);
  }

  async clear(userId: string) {
    const cart = await this.cartFor(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCart(userId);
  }

  /** Folds a guest cart into the account cart at sign-in. */
  async merge(userId: string, lines: CartLineDto[]) {
    const cart = await this.cartFor(userId);
    const parsed = lines.map((l) => ({ ...this.parseLine(l), quantity: l.quantity }));
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: parsed.flatMap((l) => (l.variantId ? [l.variantId] : [])) } },
      include: variantInclude,
    });
    const cfg = await this.customFilters.getConfig();

    for (const line of parsed) {
      if (line.custom) {
        try {
          validateSpec(line.custom, cfg);
        } catch {
          continue; // a size that no longer passes the rules is dropped
        }
        const key = customKey(line.custom);
        const existing = cart.items.find((i) => i.customKey === key);
        const quantity = Math.min(MAX_LINE_QTY, Math.max(existing?.quantity ?? 0, line.quantity));
        await this.prisma.cartItem.upsert({
          where: { cartId_customKey: { cartId: cart.id, customKey: key } },
          create: {
            cartId: cart.id,
            customKey: key,
            customSpec: line.custom as unknown as object,
            quantity,
          },
          update: { quantity },
        });
        continue;
      }

      const v = variants.find((x) => x.id === line.variantId);
      if (!v || !v.isActive || v.product.status !== 'ACTIVE' || !v.product.isPurchasable || v.stock <= 0) {
        continue;
      }
      const existing = cart.items.find((i) => i.variantId === v.id);
      const quantity = Math.min(
        MAX_LINE_QTY,
        v.stock,
        Math.max(existing?.quantity ?? 0, line.quantity),
      );
      await this.prisma.cartItem.upsert({
        where: { cartId_variantId: { cartId: cart.id, variantId: v.id } },
        create: { cartId: cart.id, variantId: v.id, quantity },
        update: { quantity },
      });
    }
    return this.getCart(userId);
  }

  // ─── Pricing ─────────────────────────────────────────────────────────────

  async price(raw: RawLine[]) {
    const variantIds = raw.flatMap((r) => (r.variantId ? [r.variantId] : []));
    const variants = variantIds.length
      ? await this.prisma.productVariant.findMany({
          where: { id: { in: variantIds } },
          include: variantInclude,
        })
      : [];
    const cfg = raw.some((r) => r.custom) ? await this.customFilters.getConfig() : null;

    let subtotal = ZERO;
    let itemCount = 0;
    const lines = raw.map((r) =>
      r.custom ? this.priceCustom(r, cfg!) : this.priceVariant(r, variants),
    );
    for (const l of lines) {
      if (l.available) {
        subtotal = subtotal.add(l.lineTotal);
        itemCount += l.quantity;
      }
    }

    const s = await this.settings.get();
    const totals = computeTotals(subtotal, s);
    return {
      lines,
      itemCount,
      ...totals,
      shippingFeeStandard: s.shippingFee,
      freeShippingThreshold: s.freeShippingThreshold,
      taxRate: s.taxRate,
      currency: s.currency,
    };
  }

  private priceCustom(r: RawLine, cfg: CustomFilterConfig) {
    const spec = r.custom!;
    let issue: string | null = null;
    let quote: ReturnType<typeof priceSpec> | null = null;
    try {
      quote = priceSpec(validateSpec(spec, cfg), cfg);
    } catch (e) {
      issue = (e as Error).message || 'This custom size is no longer available.';
    }
    const available = quote !== null;
    const lineTotal = quote ? ZERO.add(quote.unitPrice).mul(r.quantity) : ZERO;
    return {
      id: r.id,
      variantId: null,
      isCustom: true,
      custom: spec,
      quantity: r.quantity,
      available,
      issue,
      maxQuantity: MAX_LINE_QTY,
      unitPrice: quote?.unitPrice ?? 0,
      compareAtPrice: null,
      lineTotal,
      variant: {
        sku: quote?.sku ?? '',
        size: `${spec.width}x${spec.height}x${spec.depth}`,
        actualSize: quote?.sizeLabel ?? null,
        mervRating: spec.mervRating,
        packQuantity: spec.packQuantity,
        label:
          quote?.label ??
          `Custom ${spec.width} x ${spec.height} x ${spec.depth} · MERV ${spec.mervRating}`,
      },
      product: { id: 'custom', name: CUSTOM_PRODUCT_NAME, slug: null, image: null },
    };
  }

  private priceVariant(
    r: RawLine,
    variants: {
      id: string;
      isActive: boolean;
      stock: number;
      sku: string;
      size: string;
      actualSize: string | null;
      mervRating: number | null;
      packQuantity: number;
      price: import('../generated/prisma/client.js').Prisma.Decimal;
      compareAtPrice: import('../generated/prisma/client.js').Prisma.Decimal | null;
      product: {
        id: string;
        name: string;
        slug: string;
        status: string;
        isPurchasable: boolean;
        images: { url: string; alt: string | null }[];
      };
    }[],
  ) {
    const v = variants.find((x) => x.id === r.variantId);
    if (!v) {
      return {
        id: r.id,
        variantId: r.variantId,
        isCustom: false,
        custom: null,
        quantity: r.quantity,
        available: false,
        issue: 'This item is no longer available.',
        maxQuantity: 0,
        unitPrice: 0,
        compareAtPrice: null,
        lineTotal: ZERO,
        variant: null,
        product: null,
      };
    }
    const sellable = v.isActive && v.product.status === 'ACTIVE' && v.product.isPurchasable;
    const quantity = Math.min(r.quantity, Math.max(v.stock, 0));
    let issue: string | null = null;
    if (!sellable) issue = 'This item is no longer available.';
    else if (v.stock <= 0) issue = 'Out of stock.';
    else if (r.quantity > v.stock) issue = `Only ${v.stock} left — quantity adjusted.`;
    const available = sellable && v.stock > 0;
    return {
      id: r.id,
      variantId: v.id,
      isCustom: false,
      custom: null,
      quantity: available ? quantity : r.quantity,
      available,
      issue,
      maxQuantity: Math.min(MAX_LINE_QTY, Math.max(v.stock, 0)),
      unitPrice: v.price,
      compareAtPrice: v.compareAtPrice,
      lineTotal: available ? v.price.mul(quantity) : ZERO,
      variant: {
        sku: v.sku,
        size: v.size,
        actualSize: v.actualSize,
        mervRating: v.mervRating,
        packQuantity: v.packQuantity,
        label: variantLabel(v),
      },
      product: {
        id: v.product.id,
        name: v.product.name,
        slug: v.product.slug,
        image: v.product.images[0] ?? null,
      },
    };
  }

  /** Exactly one of variantId / custom must be present. */
  private parseLine(line: CartLineDto): { variantId: string | null; custom: CustomSpec | null } {
    if (line.custom && line.variantId) {
      throw new BadRequestException('A cart line is either a catalog item or a custom size, not both.');
    }
    if (line.custom) return { variantId: null, custom: toSpec(line.custom) };
    if (line.variantId) return { variantId: line.variantId, custom: null };
    throw new BadRequestException('A cart line needs an item or a custom size.');
  }

  private async purchasableVariant(variantId: string) {
    const v = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: variantInclude,
    });
    if (!v || !v.isActive || v.product.status !== 'ACTIVE') {
      throw new NotFoundException('This item is no longer available.');
    }
    if (!v.product.isPurchasable) {
      throw new BadRequestException('This product is not available for purchase yet.');
    }
    return v;
  }

  private async ownItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
    });
    if (!item) throw new NotFoundException('Cart item not found.');
    return item;
  }
}
