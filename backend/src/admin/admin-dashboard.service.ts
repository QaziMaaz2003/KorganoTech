import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { variantLabel } from '../common/utils/format.js';
import { withLabel } from '../orders/orders.service.js';

const DAY = 24 * 60 * 60 * 1000;

/** Sales count once an order is real: card orders only when paid (earlier COD orders as before). */
const COUNTS_AS_SALE = {
  status: { not: 'CANCELLED' },
  NOT: { paymentMethod: 'CARD', paymentStatus: 'UNPAID' },
} as const;

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const since = new Date(Date.now() - 29 * DAY);
    since.setUTCHours(0, 0, 0, 0);

    const [
      gross,
      collected,
      orderCount,
      byStatus,
      customers,
      activeProducts,
      lowStock,
      lowStockCount,
      recent,
      windowOrders,
      topProducts,
      newInquiries,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: COUNTS_AS_SALE,
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
      this.prisma.order.count(),
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.productVariant.findMany({
        where: {
          isActive: true,
          product: { status: 'ACTIVE' },
          stock: { lte: this.prisma.productVariant.fields.lowStockThreshold },
        },
        orderBy: { stock: 'asc' },
        take: 8,
        include: { product: { select: { id: true, name: true } } },
      }),
      this.prisma.productVariant.count({
        where: {
          isActive: true,
          product: { status: 'ACTIVE' },
          stock: { lte: this.prisma.productVariant.fields.lowStockThreshold },
        },
      }),
      this.prisma.order.findMany({
        orderBy: { placedAt: 'desc' },
        take: 8,
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.order.findMany({
        where: { placedAt: { gte: since } },
        select: { placedAt: true, total: true, status: true, paymentMethod: true, paymentStatus: true },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productName'],
        where: { order: COUNTS_AS_SALE },
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      this.prisma.inquiry.count({ where: { status: 'NEW' } }),
    ]);

    // 30 daily buckets, oldest first.
    const series = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(since.getTime() + i * DAY);
      return { date: d.toISOString().slice(0, 10), orders: 0, revenue: 0 };
    });
    for (const o of windowOrders) {
      const key = o.placedAt.toISOString().slice(0, 10);
      const bucket = series.find((s) => s.date === key);
      if (!bucket) continue;
      const isSale = o.status !== 'CANCELLED' && !(o.paymentMethod === 'CARD' && o.paymentStatus === 'UNPAID');
      if (isSale) bucket.orders += 1;
      if (isSale) {
        bucket.revenue = Math.round((bucket.revenue + o.total.toNumber()) * 100) / 100;
      }
    }

    const statusCounts = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all]));

    return {
      totals: {
        grossSales: gross._sum.total?.toNumber() ?? 0,
        collected: collected._sum.total?.toNumber() ?? 0,
        orders: orderCount,
        pending: statusCounts.PENDING ?? 0,
        /** Paid (or earlier COD) orders the team still has to prepare and ship. */
        toFulfil: (statusCounts.CONFIRMED ?? 0) + (statusCounts.PROCESSING ?? 0),
        customers,
        activeProducts,
        lowStock: lowStockCount,
        newInquiries,
      },
      statusCounts,
      series,
      recentOrders: recent.map(withLabel),
      lowStock: lowStock.map((v) => ({
        id: v.id,
        sku: v.sku,
        label: variantLabel(v),
        stock: v.stock,
        lowStockThreshold: v.lowStockThreshold,
        product: v.product,
      })),
      topProducts: topProducts.map((t) => ({
        name: t.productName,
        quantity: t._sum.quantity ?? 0,
        revenue: t._sum.lineTotal?.toNumber() ?? 0,
      })),
    };
  }
}
