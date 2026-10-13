import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateInquiryDto, NewsletterDto } from './dto/inquiry.dto.js';

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger(InquiriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInquiryDto, ip?: string) {
    // Bots fill the hidden field; pretend success and drop it.
    if (dto.website) {
      this.logger.warn(`Dropped honeypot inquiry from ${ip ?? 'unknown'}`);
      return { ok: true };
    }
    let productName: string | null = null;
    if (dto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
        select: { name: true },
      });
      productName = product?.name ?? null;
    }
    await this.prisma.inquiry.create({
      data: {
        type: dto.type,
        name: dto.name,
        email: dto.email,
        phone: dto.phone || null,
        company: dto.company || null,
        productType: dto.productType ?? null,
        productId: productName ? dto.productId : null,
        productName,
        message: dto.message,
        ipAddress: ip ?? null,
      },
    });
    return { ok: true };
  }

  async subscribe(dto: NewsletterDto) {
    await this.prisma.newsletterSubscriber.upsert({
      where: { email: dto.email },
      create: { email: dto.email },
      update: {},
    });
    return { ok: true };
  }
}
