import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  OrderStatus,
  PaymentStatus,
  Prisma,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';
import { computeTotals, ZERO } from '../common/utils/money.js';
import {
  formatOrderNumber,
  parseOrderNumber,
  variantLabel,
} from '../common/utils/format.js';
import type { CheckoutDto, MyOrdersQueryDto } from './dto/orders.dto.js';
import {
  ACTIVE_STATUSES,
  ORDER_TRANSITIONS,
  STATUS_NOTES,
} from './order-status.js';

export const orderDetailInclude = {
  items: { orderBy: { productName: 'asc' } },
  history: {
    orderBy: { createdAt: 'asc' },
    include: { changedBy: { select: { firstName: true, lastName: true, role: true } } },
  },
} satisfies Prisma.OrderInclude;

type Tx = Prisma.TransactionClient;

export function withLabel<T extends { number: number }>(order: T) {
  return { ...order, orderNumber: formatOrderNumber(order.number) };
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  // ─── Checkout ────────────────────────────────────────────────────────────

  async placeOrder(userId: string, email: string, dto: CheckoutDto) {
    const settings = await this.settings.get();
    if (!settings.codEnabled) {
      throw new BadRequestException('Checkout is temporarily unavailable.');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty.');
    }

    const address = await this.resolveAddress(userId, dto);

    // Lock rows in a consistent order to avoid deadlocks between checkouts.
    const items = [...cart.items].sort((a, b) =>
      a.variantId.localeCompare(b.variantId),
    );

    const order = await this.prisma.$transaction(
      async (tx) => {
        let subtotal = ZERO;
        const lines: Prisma.OrderItemCreateWithoutOrderInput[] = [];
        const movements: { variantId: string; delta: number; stockAfter: number }[] = [];

        for (const item of items) {
          const v = item.variant;
          const label = variantLabel(v);
          if (!v.isActive || v.product.status !== 'ACTIVE' || !v.product.isPurchasable) {
            throw new ConflictException(
              `${v.product.name} (${label}) is no longer available. Please remove it from your cart.`,
            );
          }
          const updated = await tx.productVariant.updateMany({
            where: { id: v.id, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (updated.count === 0) {
            const current = await tx.productVariant.findUnique({
              where: { id: v.id },
              select: { stock: true },
            });
            const left = current?.stock ?? 0;
            throw new ConflictException(
              left > 0
                ? `Only ${left} left of ${v.product.name} (${label}). Please update your cart.`
                : `${v.product.name} (${label}) just sold out. Please remove it from your cart.`,
            );
          }
          const after = await tx.productVariant.findUniqueOrThrow({
            where: { id: v.id },
            select: { stock: true },
          });
          movements.push({ variantId: v.id, delta: -item.quantity, stockAfter: after.stock });

          const lineTotal = v.price.mul(item.quantity);
          subtotal = subtotal.add(lineTotal);
          lines.push({
            variant: { connect: { id: v.id } },
            productId: v.product.id,
            productName: v.product.name,
            productSlug: v.product.slug,
            variantLabel: label,
            sku: v.sku,
            imageUrl: v.product.images[0]?.url ?? null,
            unitPrice: v.price,
            quantity: item.quantity,
            lineTotal,
          });
        }

        const totals = computeTotals(subtotal, settings);
        const created = await tx.order.create({
          data: {
            user: { connect: { id: userId } },
            paymentMethod: 'COD',
            currency: settings.currency,
            subtotal: totals.subtotal,
            shippingFee: totals.shippingFee,
            tax: totals.tax,
            total: totals.total,
            email,
            phone: address.phone,
            shipFullName: address.fullName,
            shipPhone: address.phone,
            shipLine1: address.line1,
            shipLine2: address.line2 || null,
            shipCity: address.city,
            shipState: address.state,
            shipPostalCode: address.postalCode,
            shipCountry: address.country || 'United States',
            customerNote: dto.note || null,
            items: { create: lines },
            history: {
              create: { status: 'PENDING', note: STATUS_NOTES.PENDING, changedById: userId },
            },
          },
          include: orderDetailInclude,
        });

        await tx.stockMovement.createMany({
          data: movements.map((m) => ({
            ...m,
            reason: 'ORDER' as const,
            orderId: created.id,
            userId,
            note: `Order ${formatOrderNumber(created.number)}`,
          })),
        });
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        if (dto.address && dto.saveAddress) {
          const hasAny = await tx.address.count({ where: { userId } });
          await tx.address.create({
            data: {
              userId,
              fullName: dto.address.fullName,
              phone: dto.address.phone,
              line1: dto.address.line1,
              line2: dto.address.line2 || null,
              city: dto.address.city,
              state: dto.address.state,
              postalCode: dto.address.postalCode,
              country: dto.address.country || 'United States',
              label: dto.address.label || null,
              isDefault: hasAny === 0,
            },
          });
        }
        return created;
      },
      { maxWait: 10_000, timeout: 30_000 },
    );

    return withLabel(order);
  }

  private async resolveAddress(userId: string, dto: CheckoutDto) {
    if (dto.addressId) {
      const saved = await this.prisma.address.findFirst({
        where: { id: dto.addressId, userId },
      });
      if (!saved) throw new BadRequestException('Please choose a delivery address.');
      return saved;
    }
    if (dto.address) return dto.address;
    throw new BadRequestException('Please provide a delivery address.');
  }

  // ─── Customer views ──────────────────────────────────────────────────────

  async listMine(userId: string, query: MyOrdersQueryDto) {
    const where: Prisma.OrderWhereInput = { userId };
    if (query.status === 'active') where.status = { in: ACTIVE_STATUSES };
    if (query.status === 'delivered') where.status = 'DELIVERED';
    if (query.status === 'cancelled') where.status = 'CANCELLED';
    const orders = await this.prisma.order.findMany({
      where,
      orderBy: { placedAt: 'desc' },
      include: { items: { select: { productName: true, imageUrl: true, quantity: true } } },
    });
    return orders.map((o) => {
      const { items, ...rest } = o;
      return withLabel({
        ...rest,
        itemCount: items.reduce((n, i) => n + i.quantity, 0),
        previewImages: items.map((i) => i.imageUrl).filter(Boolean).slice(0, 4),
        firstItemName: items[0]?.productName ?? null,
        lineCount: items.length,
      });
    });
  }

  async getMine(userId: string, number: string) {
    const n = parseOrderNumber(number);
    if (!Number.isInteger(n)) throw new NotFoundException('Order not found.');
    const order = await this.prisma.order.findFirst({
      where: { number: n, userId },
      include: orderDetailInclude,
    });
    if (!order) throw new NotFoundException('Order not found.');
    return withLabel(order);
  }

  async cancelMine(userId: string, number: string) {
    const order = await this.getMine(userId, number);
    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        'This order can no longer be cancelled online. Please contact us for help.',
      );
    }
    await this.transition(order.id, 'CANCELLED', userId, {
      note: 'Cancelled by customer',
    });
    return this.getMine(userId, number);
  }

  // ─── Status changes (shared with admin) ──────────────────────────────────

  async transition(
    orderId: string,
    next: OrderStatus,
    actorId: string,
    opts: { note?: string; carrier?: string; trackingNumber?: string } = {},
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });
        if (!order) throw new NotFoundException('Order not found.');
        if (order.status === next) {
          throw new BadRequestException(`Order is already ${next.toLowerCase()}.`);
        }
        if (!ORDER_TRANSITIONS[order.status].includes(next)) {
          throw new BadRequestException(
            `An order that is ${order.status.toLowerCase()} cannot be moved to ${next.toLowerCase()}.`,
          );
        }

        const now = new Date();
        const data: Prisma.OrderUpdateInput = { status: next };
        if (next === 'CONFIRMED') data.confirmedAt = now;
        if (next === 'SHIPPED') {
          data.shippedAt = now;
          if (opts.carrier !== undefined) data.carrier = opts.carrier || null;
          if (opts.trackingNumber !== undefined) data.trackingNumber = opts.trackingNumber || null;
        }
        if (next === 'DELIVERED') {
          data.deliveredAt = now;
          // Cash on Delivery: the courier collects payment at the door.
          if (order.paymentMethod === 'COD' && order.paymentStatus === 'UNPAID') {
            data.paymentStatus = 'PAID';
            data.paidAt = now;
          }
        }
        if (next === 'CANCELLED') {
          data.cancelledAt = now;
          await this.restock(tx, order.id, order.number, order.items, actorId);
        }

        await tx.order.update({ where: { id: orderId }, data });
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            status: next,
            note: opts.note?.trim() || STATUS_NOTES[next],
            changedById: actorId,
          },
        });
      },
      { maxWait: 10_000, timeout: 30_000 },
    );
  }

  async setPaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    actorId: string,
    note?: string,
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found.');
    if (order.paymentStatus === paymentStatus) return;
    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus,
          paidAt: paymentStatus === 'PAID' ? new Date() : paymentStatus === 'UNPAID' ? null : order.paidAt,
        },
      }),
      this.prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: order.status,
          note: note?.trim() || `Payment marked ${paymentStatus.toLowerCase()}`,
          changedById: actorId,
        },
      }),
    ]);
  }

  private async restock(
    tx: Tx,
    orderId: string,
    number: number,
    items: { variantId: string | null; quantity: number }[],
    actorId: string,
  ) {
    for (const item of items) {
      if (!item.variantId) continue;
      const v = await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
        select: { stock: true },
      });
      await tx.stockMovement.create({
        data: {
          variantId: item.variantId,
          delta: item.quantity,
          stockAfter: v.stock,
          reason: 'CANCEL',
          orderId,
          userId: actorId,
          note: `Order ${formatOrderNumber(number)} cancelled`,
        },
      });
    }
  }
}
