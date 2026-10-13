import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';
import { computeTotals, ZERO } from '../common/utils/money.js';
import { variantLabel } from '../common/utils/format.js';
import { MAX_LINE_QTY, type CartLineDto } from './dto/cart.dto.js';

interface RawLine {
  id: string;
  variantId: string;
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

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
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
    return this.price(cart.items);
  }

  /** Prices arbitrary lines (a guest's localStorage cart) without saving. */
  quote(lines: CartLineDto[]) {
    return this.price(
      lines.map((l) => ({ id: l.variantId, variantId: l.variantId, quantity: l.quantity })),
    );
  }

  async addItem(userId: string, line: CartLineDto) {
    const variant = await this.purchasableVariant(line.variantId);
    const cart = await this.cartFor(userId);
    const existing = cart.items.find((i) => i.variantId === line.variantId);
    const wanted = Math.min(MAX_LINE_QTY, (existing?.quantity ?? 0) + line.quantity);
    if (variant.stock <= 0) {
      throw new BadRequestException('Sorry, this item is out of stock.');
    }
    const quantity = Math.min(wanted, variant.stock);
    await this.prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId: line.variantId } },
      create: { cartId: cart.id, variantId: line.variantId, quantity },
      update: { quantity },
    });
    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const item = await this.ownItem(userId, itemId);
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: item.variantId },
    });
    const capped = Math.max(1, Math.min(quantity, variant?.stock ?? quantity));
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
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: lines.map((l) => l.variantId) } },
      include: variantInclude,
    });
    for (const line of lines) {
      const v = variants.find((x) => x.id === line.variantId);
      if (!v || !v.isActive || v.product.status !== 'ACTIVE' || !v.product.isPurchasable || v.stock <= 0) {
        continue;
      }
      const existing = cart.items.find((i) => i.variantId === line.variantId);
      const quantity = Math.min(
        MAX_LINE_QTY,
        v.stock,
        Math.max(existing?.quantity ?? 0, line.quantity),
      );
      await this.prisma.cartItem.upsert({
        where: { cartId_variantId: { cartId: cart.id, variantId: line.variantId } },
        create: { cartId: cart.id, variantId: line.variantId, quantity },
        update: { quantity },
      });
    }
    return this.getCart(userId);
  }

  // ─── Pricing ─────────────────────────────────────────────────────────────

  async price(raw: RawLine[]) {
    const variants = raw.length
      ? await this.prisma.productVariant.findMany({
          where: { id: { in: raw.map((r) => r.variantId) } },
          include: variantInclude,
        })
      : [];

    let subtotal = ZERO;
    let itemCount = 0;
    const lines = raw.map((r) => {
      const v = variants.find((x) => x.id === r.variantId);
      if (!v) {
        return {
          id: r.id,
          variantId: r.variantId,
          quantity: r.quantity,
          available: false,
          issue: 'This item is no longer available.',
          maxQuantity: 0,
          unitPrice: 0,
          lineTotal: 0,
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
      const lineTotal = available ? v.price.mul(quantity) : ZERO;
      if (available) {
        subtotal = subtotal.add(lineTotal);
        itemCount += quantity;
      }
      return {
        id: r.id,
        variantId: v.id,
        quantity: available ? quantity : r.quantity,
        available,
        issue,
        maxQuantity: Math.min(MAX_LINE_QTY, Math.max(v.stock, 0)),
        unitPrice: v.price,
        compareAtPrice: v.compareAtPrice,
        lineTotal,
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
    });

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

