import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** The single settings row, created with defaults on first read. */
  get() {
    return this.prisma.storeSettings.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: {},
    });
  }

  update(data: Prisma.StoreSettingsUpdateInput) {
    return this.prisma.storeSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...(data as Prisma.StoreSettingsCreateInput) },
      update: data,
    });
  }

  /** Fields safe to expose to the storefront. */
  async getPublic() {
    const s = await this.get();
    return {
      storeName: s.storeName,
      supportEmail: s.supportEmail,
      supportPhone: s.supportPhone,
      address: s.address,
      currency: s.currency,
      shippingFee: s.shippingFee,
      freeShippingThreshold: s.freeShippingThreshold,
      taxRate: s.taxRate,
      checkoutEnabled: s.checkoutEnabled,
      announcement: s.announcement,
    };
  }
}
