import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type Stripe from 'stripe';
import type {
  OrderStatus,
  PaymentStatus,
  Prisma,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';
import { StripeService } from '../payments/stripe.service.js';
import { CustomFilterService } from '../custom-filters/custom-filter.service.js';
import {
  CUSTOM_PRODUCT_NAME,
  priceSpec,
  validateSpec,
  type CustomSpec,
} from '../custom-filters/custom-filter.config.js';
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
type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

/** How long an unpaid order holds its stock (Stripe requires at least 30 minutes). */
const PAYMENT_HOLD_MINUTES = 45;

export function withLabel<T extends { number: number }>(order: T) {
  return { ...order, orderNumber: formatOrderNumber(order.number) };
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly stripe: StripeService,
    private readonly customFilters: CustomFilterService,
  ) {}

  // ─── Checkout ────────────────────────────────────────────────────────────

  async placeOrder(userId: string, email: string, dto: CheckoutDto) {
    const settings = await this.settings.get();
    if (!settings.checkoutEnabled) {
      throw new BadRequestException('Checkout is temporarily unavailable.');
    }
    // Fail before any stock is reserved if payments are not set up.
    if (!this.stripe.configured) {
      throw new ServiceUnavailableException(
        'Online card payments are not available right now. Please try again later.',
      );
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
    const customConfig = cart.items.some((i) => i.customSpec)
      ? await this.customFilters.getConfig()
      : null;

    // Lock rows in a consistent order to avoid deadlocks between checkouts.
    const items = [...cart.items].sort((a, b) =>
      (a.variantId ?? '~').localeCompare(b.variantId ?? '~'),
    );
    const expiresAt = new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60_000);

    const order = await this.prisma.$transaction(
      async (tx) => {
        let subtotal = ZERO;
        const lines: Prisma.OrderItemCreateWithoutOrderInput[] = [];
        const movements: { variantId: string; delta: number; stockAfter: number }[] = [];

        for (const item of items) {
          // Made-to-order custom size: priced from the current rules, no stock.
          if (item.customSpec) {
            const spec = item.customSpec as unknown as CustomSpec;
            let quote;
            try {
              quote = priceSpec(validateSpec(spec, customConfig!), customConfig!);
            } catch (e) {
              throw new ConflictException(
                `A custom filter in your cart can no longer be ordered: ${(e as Error).message} Please remove it and try again.`,
              );
            }
            const lineTotal = ZERO.add(quote.unitPrice).mul(item.quantity);
            subtotal = subtotal.add(lineTotal);
            lines.push({
              productName: CUSTOM_PRODUCT_NAME,
              variantLabel: quote.label,
              sku: quote.sku,
              unitPrice: quote.unitPrice,
              quantity: item.quantity,
              lineTotal,
              isCustom: true,
              customSpec: spec as unknown as Prisma.InputJsonValue,
            });
            continue;
          }

          const v = item.variant!;
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
            paymentMethod: 'CARD',
            paymentExpiresAt: expiresAt,
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

        if (movements.length) {
          await tx.stockMovement.createMany({
            data: movements.map((m) => ({
              ...m,
              reason: 'ORDER' as const,
              orderId: created.id,
              userId,
              note: `Order ${formatOrderNumber(created.number)}`,
            })),
          });
        }
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

    // The order and its stock hold exist; now hand the customer to Stripe. If that
    // fails, release the hold so no unpaid order is left behind.
    try {
      const session = await this.createSession(order, expiresAt);
      return { ...withLabel(order), stripeSessionId: session.id, checkoutUrl: session.url };
    } catch (e) {
      await this.transition(order.id, 'CANCELLED', null, {
        note: 'Cancelled — the card payment could not be started',
      }).catch((err: Error) =>
        this.logger.error(`Could not release order ${order.number} after a Stripe failure: ${err.message}`),
      );
      throw e;
    }
  }

  private async resolveAddress(userId: string, dto: CheckoutDto) {
    if (dto.addressId) {
      const saved = await this.prisma.address.findFirst({
        where: { id: dto.addressId, userId },
      });
      if (!saved) throw new BadRequestException('Please choose a delivery address.');
      if (!/^(united states( of america)?|u.?s.?(a.?)?)$/i.test(saved.country)) {
        throw new BadRequestException('We currently ship to the United States only.');
      }
      return saved;
    }
    if (dto.address) return dto.address;
    throw new BadRequestException('Please provide a delivery address.');
  }

  // ─── Card payment (Stripe) ───────────────────────────────────────────────

  private siteUrl() {
    const raw =
      process.env.SITE_URL ??
      (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',')[0];
    return raw.trim().replace(/\/+$/, '');
  }

  /** Creates a Checkout Session for an order and records it. */
  private async createSession(order: OrderWithItems, expiresAt: Date) {
    const number = formatOrderNumber(order.number);
    const session = await this.stripe.createCheckoutSession({
      orderId: order.id,
      orderNumber: number,
      email: order.email,
      currency: order.currency,
      lines: order.items.map((i) => ({
        name: i.productName,
        description: i.variantLabel,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        imageUrl: i.imageUrl,
      })),
      shippingFee: Number(order.shippingFee),
      tax: Number(order.tax),
      successUrl: `${this.siteUrl()}/order-confirmation/${number}?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${this.siteUrl()}/account/orders/${number}?payment=cancelled`,
      expiresAt,
    });
    await this.prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id, paymentExpiresAt: expiresAt },
    });
    return session;
  }

  /** The customer wants to pay (again) for an unpaid order. */
  async startPayment(userId: string, number: string) {
    let order = await this.findMine(userId, number);
    if (order.paymentStatus === 'PAID') return { paid: true as const };
    this.assertPayable(order);

    // The old session may have been paid or expired without us hearing about it.
    if (order.stripeSessionId) {
      await this.syncOrder(order);
      order = await this.findMine(userId, number);
      if (order.paymentStatus === 'PAID') return { paid: true as const };
      this.assertPayable(order);
      const existing = await this.stripe.getSession(order.stripeSessionId!).catch(() => null);
      if (existing?.status === 'open' && existing.url) return { url: existing.url };
    }

    const expiresAt = new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60_000);
    const session = await this.createSession(order, expiresAt);
    return { url: session.url };
  }

  /** Checks Stripe for the real payment state (the return page and webhooks both use this). */
  async syncPayment(userId: string, number: string) {
    const order = await this.findMine(userId, number);
    await this.syncOrder(order);
    return this.getMine(userId, number);
  }

  private async syncOrder(order: OrderWithItems) {
    if (
      order.paymentMethod !== 'CARD' ||
      order.paymentStatus !== 'UNPAID' ||
      order.status !== 'PENDING' ||
      !order.stripeSessionId
    ) {
      return;
    }
    try {
      const session = await this.stripe.getSession(order.stripeSessionId);
      if (session.payment_status === 'paid') {
        await this.markPaid(order.id, this.paymentIntentId(session));
      } else if (session.status === 'expired') {
        await this.cancelUnpaid(order.id, 'Payment was not completed in time');
      }
    } catch (e) {
      this.logger.warn(`Could not sync payment for ${formatOrderNumber(order.number)}: ${(e as Error).message}`);
    }
  }

  private assertPayable(order: OrderWithItems) {
    if (order.status === 'CANCELLED') {
      throw new BadRequestException(
        'This order was cancelled, so it can no longer be paid. Please place a new order.',
      );
    }
    if (order.status !== 'PENDING' || order.paymentMethod !== 'CARD') {
      throw new BadRequestException('This order does not need a payment.');
    }
  }

  private paymentIntentId(session: Stripe.Checkout.Session): string | null {
    const pi = session.payment_intent;
    return typeof pi === 'string' ? pi : (pi?.id ?? null);
  }

  /** Stripe webhook entry point. Safe to receive an event more than once. */
  async handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        if (session.payment_status !== 'paid') return; // wait for async confirmation
        const orderId = session.metadata?.orderId ?? session.client_reference_id;
        if (orderId) await this.markPaid(orderId, this.paymentIntentId(session));
        return;
      }
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId ?? session.client_reference_id;
        if (!orderId) return;
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        // Only the order's current session counts; an older, replaced one is irrelevant.
        if (order && order.stripeSessionId === session.id) {
          await this.cancelUnpaid(orderId, 'Payment was not completed in time');
        }
        return;
      }
      default:
        return;
    }
  }

  /** Marks an order paid and confirms it. If it was already cancelled, the money is returned. */
  async markPaid(orderId: string, paymentIntentId: string | null) {
    const outcome = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order || order.paymentStatus !== 'UNPAID') return 'noop' as const;
      const now = new Date();
      const cancelled = order.status === 'CANCELLED';
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          paidAt: now,
          paymentExpiresAt: null,
          stripePaymentIntentId: paymentIntentId ?? order.stripePaymentIntentId,
          ...(order.status === 'PENDING' ? { status: 'CONFIRMED', confirmedAt: now } : {}),
        },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: order.status === 'PENDING' ? 'CONFIRMED' : order.status,
          note: cancelled
            ? 'Payment arrived after the order was cancelled — refunding'
            : 'Payment received — order confirmed',
          changedById: null,
        },
      });
      return cancelled ? ('refund' as const) : ('paid' as const);
    });

    if (outcome === 'refund' && paymentIntentId) {
      await this.refundOrder(orderId, paymentIntentId, 'Refunded — the order had already been cancelled');
    }
  }

  /** Cancels an order that was never paid, releasing its stock. */
  async cancelUnpaid(orderId: string, note: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== 'PENDING' || order.paymentStatus !== 'UNPAID') return;
    await this.transition(orderId, 'CANCELLED', null, { note }).catch((e: Error) =>
      this.logger.warn(`Could not cancel unpaid order ${order.number}: ${e.message}`),
    );
  }

  private async refundOrder(orderId: string, paymentIntentId: string, note: string) {
    try {
      await this.stripe.refund(paymentIntentId);
      const order = await this.prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return;
      await this.prisma.$transaction([
        this.prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'REFUNDED' } }),
        this.prisma.orderStatusHistory.create({
          data: { orderId, status: order.status, note, changedById: null },
        }),
      ]);
    } catch (e) {
      this.logger.error(`Refund failed for order ${orderId}: ${(e as Error).message}`);
      const order = await this.prisma.order.findUnique({ where: { id: orderId } });
      if (order) {
        await this.prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: order.status,
            note: 'Automatic refund failed — please refund this payment in the Stripe dashboard',
            changedById: null,
          },
        });
      }
    }
  }

  // ─── Customer views ──────────────────────────────────────────────────────

  async listMine(userId: string, query: MyOrdersQueryDto) {
    const where: Prisma.OrderWhereInput = { userId };
    if (query.status === 'active') where.status = { in: ACTIVE_STATUSES };
    if (query.status === 'delivered') where.status = 'DELIVERED';
    if (query.status === 'cancelled') where.status = 'CANCELLED';
    if (query.status === 'paid') where.paymentStatus = 'PAID';
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

  private async findMine(userId: string, number: string) {
    const n = parseOrderNumber(number);
    if (!Number.isInteger(n)) throw new NotFoundException('Order not found.');
    const order = await this.prisma.order.findFirst({
      where: { number: n, userId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found.');
    return order;
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
    const order = await this.findMine(userId, number);
    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        'This order can no longer be cancelled online. Please contact us for help.',
      );
    }
    // Close the payment page so it cannot be completed after cancelling.
    if (order.stripeSessionId && order.paymentStatus === 'UNPAID') {
      await this.stripe.expireSession(order.stripeSessionId);
      const session = await this.stripe.getSession(order.stripeSessionId).catch(() => null);
      if (session?.payment_status === 'paid') {
        await this.markPaid(order.id, this.paymentIntentId(session));
        throw new BadRequestException(
          'Your payment just went through, so this order can no longer be cancelled online. Please contact us for help.',
        );
      }
    }
    await this.transition(order.id, 'CANCELLED', userId, {
      note: 'Cancelled by customer',
    });
    return this.getMine(userId, number);
  }

  // ─── Status changes (shared with admin) ──────────────────────────────────

  /** actorId is null for automatic changes (payment events). */
  async transition(
    orderId: string,
    next: OrderStatus,
    actorId: string | null,
    opts: { note?: string; carrier?: string; trackingNumber?: string } = {},
  ) {
    const refundIntent = await this.prisma.$transaction(
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
          // Orders placed before card payments were Cash on Delivery: the courier collected payment.
          if (order.paymentMethod === 'COD' && order.paymentStatus === 'UNPAID') {
            data.paymentStatus = 'PAID';
            data.paidAt = now;
          }
        }
        if (next === 'CANCELLED') {
          data.cancelledAt = now;
          data.paymentExpiresAt = null;
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

        // A paid card order that is cancelled gets its money back.
        return next === 'CANCELLED' &&
          order.paymentMethod === 'CARD' &&
          order.paymentStatus === 'PAID' &&
          order.stripePaymentIntentId
          ? order.stripePaymentIntentId
          : null;
      },
      { maxWait: 10_000, timeout: 30_000 },
    );

    if (refundIntent) {
      await this.refundOrder(orderId, refundIntent, 'Payment refunded to the customer');
    }
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
    actorId: string | null,
  ) {
    for (const item of items) {
      if (!item.variantId) continue; // custom filters have no stock
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
