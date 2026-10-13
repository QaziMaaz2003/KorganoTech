import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { withLabel } from '../orders/orders.service.js';
import { paginate, toPage } from '../common/utils/format.js';
import type {
  AdminCustomersQueryDto,
  UpdateCustomerDto,
} from './dto/admin.dto.js';

const customerSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminCustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminCustomersQueryDto) {
    const { skip, take, page, pageSize } = paginate(query.page, query.pageSize ?? 20);
    const where: Prisma.UserWhereInput = {};
    if (query.role) where.role = query.role;
    if (query.q) {
      const q = query.q.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
      ];
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: { ...customerSelect, _count: { select: { orders: true } } },
      }),
      this.prisma.user.count({ where }),
    ]);
    const spend = await this.spendFor(rows.map((r) => r.id));
    const items = rows.map(({ _count, ...u }) => ({
      ...u,
      orderCount: _count.orders,
      totalSpent: spend.get(u.id) ?? 0,
    }));
    return toPage(items, total, page, pageSize);
  }

  async get(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...customerSelect,
        addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] },
        orders: {
          orderBy: { placedAt: 'desc' },
          take: 25,
          include: { _count: { select: { items: true } } },
        },
        _count: { select: { orders: true } },
      },
    });
    if (!user) throw new NotFoundException('Customer not found.');
    const spend = await this.spendFor([id]);
    const { orders, _count, ...rest } = user;
    return {
      ...rest,
      orders: orders.map(withLabel),
      orderCount: _count.orders,
      totalSpent: spend.get(id) ?? 0,
    };
  }

  async update(id: string, dto: UpdateCustomerDto, actorId: string) {
    if (id === actorId && (dto.isActive === false || dto.role === 'CUSTOMER')) {
      throw new BadRequestException("You can't remove your own admin access.");
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Customer not found.');
    const accessChanged =
      (dto.isActive !== undefined && dto.isActive !== user.isActive) ||
      (dto.role !== undefined && dto.role !== user.role);
    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: dto.isActive,
        role: dto.role,
        // Sign the user out everywhere when their access changes.
        tokenVersion: accessChanged ? { increment: 1 } : undefined,
      },
    });
    return this.get(id);
  }

  /** Lifetime spend per user, excluding cancelled orders. */
  private async spendFor(userIds: string[]) {
    if (!userIds.length) return new Map<string, number>();
    const sums = await this.prisma.order.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, status: { not: 'CANCELLED' } },
      _sum: { total: true },
    });
    return new Map(
      sums
        .filter((s) => s.userId)
        .map((s) => [s.userId as string, s._sum.total?.toNumber() ?? 0]),
    );
  }
}
