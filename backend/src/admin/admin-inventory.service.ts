import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { paginate, toPage, variantLabel } from '../common/utils/format.js';
import type { AdjustStockDto, InventoryQueryDto } from './dto/admin.dto.js';

@Injectable()
export class AdminInventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: InventoryQueryDto) {
    const { skip, take, page, pageSize } = paginate(query.page, query.pageSize ?? 25);
    const where: Prisma.ProductVariantWhereInput = {
      product: { status: { not: 'ARCHIVED' } },
    };
    if (query.category) {
      where.product = { status: { not: 'ARCHIVED' }, category: { slug: query.category } };
    }
    if (query.lowStock) {
      where.isActive = true;
      // Column-to-column comparison: stock at or below the variant's own threshold.
      where.stock = { lte: this.prisma.productVariant.fields.lowStockThreshold };
    }
    if (query.q) {
      const q = query.q.trim();
      where.OR = [
        { sku: { contains: q, mode: 'insensitive' } },
        { size: { contains: q.replace(/\s+/g, ''), mode: 'insensitive' } },
        { product: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.productVariant.findMany({
        where,
        skip,
        take,
        orderBy: query.lowStock
          ? [{ stock: 'asc' }]
          : [{ product: { name: 'asc' } }, { depth: 'asc' }, { width: 'asc' }, { height: 'asc' }, { mervRating: 'asc' }, { packQuantity: 'asc' }],
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              category: { select: { name: true, slug: true } },
            },
          },
        },
      }),
      this.prisma.productVariant.count({ where }),
    ]);
    const items = rows.map((v) => ({
      ...v,
      label: variantLabel(v),
      isLow: v.stock <= v.lowStockThreshold,
    }));
    return toPage(items, total, page, pageSize);
  }

  async adjust(variantId: string, dto: AdjustStockDto, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const v = await tx.productVariant.findUnique({ where: { id: variantId } });
      if (!v) throw new NotFoundException('Variant not found.');
      const next = dto.mode === 'add' ? v.stock + dto.quantity : dto.quantity;
      if (next < 0) {
        throw new BadRequestException(`Stock can't go below zero (currently ${v.stock}).`);
      }
      if (next === v.stock) return v;
      const updated = await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: next },
      });
      await tx.stockMovement.create({
        data: {
          variantId,
          delta: next - v.stock,
          stockAfter: next,
          reason: dto.reason,
          note: dto.note || null,
          userId: actorId,
        },
      });
      return updated;
    });
  }

  movements(variantId: string) {
    return this.prisma.stockMovement.findMany({
      where: { variantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  }
}
