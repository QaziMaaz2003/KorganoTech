import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  OrdersService,
  orderDetailInclude,
  withLabel,
} from '../orders/orders.service.js';
import { ORDER_TRANSITIONS } from '../orders/order-status.js';
import { paginate, parseOrderNumber, toPage } from '../common/utils/format.js';
import type {
  AdminOrdersQueryDto,
  UpdateOrderStatusDto,
  UpdatePaymentDto,
  UpdateTrackingDto,
} from './dto/admin.dto.js';

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService,
  ) {}

  async list(query: AdminOrdersQueryDto) {
    const { skip, take, page, pageSize } = paginate(query.page, query.pageSize ?? 20);
    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.customerId) where.userId = query.customerId;
    if (query.q) {
      const q = query.q.trim();
      const n = parseOrderNumber(q);
      where.OR = [
        ...(Number.isInteger(n) ? [{ number: n }] : []),
        { email: { contains: q, mode: 'insensitive' } },
        { shipFullName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { trackingNumber: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [rows, total, counts] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { placedAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.order.count({ where }),
      this.prisma.order.groupBy({
        by: ['status'],
        orderBy: { status: 'asc' },
        _count: { _all: true },
      }),
    ]);
    const statusCounts = Object.fromEntries(
      counts.map((c) => [c.status, (c._count as { _all: number })._all]),
    );
    return {
      ...toPage(rows.map(withLabel), total, page, pageSize),
      statusCounts,
    };
  }

  async get(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        ...orderDetailInclude,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
            _count: { select: { orders: true } },
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found.');
    return { ...withLabel(order), allowedTransitions: ORDER_TRANSITIONS[order.status] };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, actorId: string) {
    await this.orders.transition(id, dto.status, actorId, {
      note: dto.note,
      carrier: dto.carrier,
      trackingNumber: dto.trackingNumber,
    });
    return this.get(id);
  }

  async updatePayment(id: string, dto: UpdatePaymentDto, actorId: string) {
    await this.orders.setPaymentStatus(id, dto.paymentStatus, actorId, dto.note);
    return this.get(id);
  }

  async updateTracking(id: string, dto: UpdateTrackingDto) {
    const exists = await this.prisma.order.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Order not found.');
    await this.prisma.order.update({
      where: { id },
      data: {
        carrier: dto.carrier === undefined ? undefined : dto.carrier || null,
        trackingNumber:
          dto.trackingNumber === undefined ? undefined : dto.trackingNumber || null,
      },
    });
    return this.get(id);
  }
}
