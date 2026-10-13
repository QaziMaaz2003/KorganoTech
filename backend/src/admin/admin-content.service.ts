import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { SettingsService } from '../settings/settings.service.js';
import { paginate, toPage } from '../common/utils/format.js';
import type {
  AdminInquiriesQueryDto,
  UpdateCategoryDto,
  UpdateInquiryDto,
  UpdateSettingsDto,
} from './dto/admin.dto.js';
import type { PaginationQueryDto } from '../common/dto/pagination.dto.js';

/** Categories, inquiries, newsletter subscribers and store settings. */
@Injectable()
export class AdminContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly settings: SettingsService,
  ) {}

  // ─── Categories ──────────────────────────────────────────────────────────

  async listCategories() {
    const rows = await this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    return rows.map(({ _count, ...c }) => ({ ...c, productCount: _count.products }));
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.category(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async uploadCategoryImage(id: string, file: Express.Multer.File) {
    const category = await this.category(id);
    const uploaded = await this.cloudinary.uploadFile(file, `categories/${category.slug}`);
    const updated = await this.prisma.category.update({
      where: { id },
      data: { imageUrl: uploaded.url, imagePublicId: uploaded.publicId },
    });
    await this.cloudinary.destroy(category.imagePublicId);
    return updated;
  }

  private async category(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found.');
    return category;
  }

  // ─── Inquiries ───────────────────────────────────────────────────────────

  async listInquiries(query: AdminInquiriesQueryDto) {
    const { skip, take, page, pageSize } = paginate(query.page, query.pageSize ?? 20);
    const where: Prisma.InquiryWhereInput = {};
    if (query.type) where.type = query.type;
    where.status = query.status ?? { not: 'ARCHIVED' };
    if (query.q) {
      const q = query.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [rows, total, counts] = await this.prisma.$transaction([
      this.prisma.inquiry.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.inquiry.count({ where }),
      this.prisma.inquiry.groupBy({
        by: ['status'],
        orderBy: { status: 'asc' },
        _count: { _all: true },
      }),
    ]);
    return {
      ...toPage(rows, total, page, pageSize),
      statusCounts: Object.fromEntries(
        counts.map((c) => [c.status, (c._count as { _all: number })._all]),
      ),
    };
  }

  async updateInquiry(id: string, dto: UpdateInquiryDto) {
    const exists = await this.prisma.inquiry.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Inquiry not found.');
    return this.prisma.inquiry.update({ where: { id }, data: { status: dto.status } });
  }

  async deleteInquiry(id: string) {
    const exists = await this.prisma.inquiry.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Inquiry not found.');
    await this.prisma.inquiry.delete({ where: { id } });
    return { ok: true };
  }

  // ─── Newsletter ──────────────────────────────────────────────────────────

  async listSubscribers(query: PaginationQueryDto) {
    const { skip, take, page, pageSize } = paginate(query.page, query.pageSize ?? 50);
    const where: Prisma.NewsletterSubscriberWhereInput = query.q
      ? { email: { contains: query.q, mode: 'insensitive' } }
      : {};
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.newsletterSubscriber.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.newsletterSubscriber.count({ where }),
    ]);
    return toPage(rows, total, page, pageSize);
  }

  // ─── Settings ────────────────────────────────────────────────────────────

  getSettings() {
    return this.settings.get();
  }

  updateSettings(dto: UpdateSettingsDto) {
    return this.settings.update({
      storeName: dto.storeName,
      supportEmail: dto.supportEmail === undefined ? undefined : dto.supportEmail || null,
      supportPhone: dto.supportPhone === undefined ? undefined : dto.supportPhone || null,
      address: dto.address === undefined ? undefined : dto.address || null,
      shippingFee: dto.shippingFee,
      freeShippingThreshold: dto.freeShippingThreshold,
      taxRate: dto.taxRate,
      codEnabled: dto.codEnabled,
      announcement: dto.announcement === undefined ? undefined : dto.announcement || null,
    });
  }
}
