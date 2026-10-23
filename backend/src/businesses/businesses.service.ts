import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { randomBytes, randomInt } from 'node:crypto';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { CartService } from '../cart/cart.service.js';
import { CustomFilterService } from '../custom-filters/custom-filter.service.js';
import {
  customKey,
  validateSpec,
  type CustomSpec,
} from '../custom-filters/custom-filter.config.js';
import { paginate, toPage } from '../common/utils/format.js';
import type {
  AddBusinessUserDto,
  BusinessFilterDto,
  BusinessListQueryDto,
  BusinessRequestDto,
  CreateBusinessDto,
  ReorderDto,
  UpdateBusinessDto,
  UpdateBusinessFilterDto,
} from './dto/business.dto.js';

const specOf = (s: CustomSpec): CustomSpec => ({
  width: Number(s.width),
  height: Number(s.height),
  depth: Number(s.depth),
  mervRating: Number(s.mervRating),
  packQuantity: Number(s.packQuantity),
});

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  isActive: true,
  createdAt: true,
} as const;

type LoginPlan =
  | { kind: 'link'; userId: string }
  | {
      kind: 'create';
      email: string;
      firstName: string;
      lastName: string;
      hash: string;
      tempPassword: string;
    };

@Injectable()
export class BusinessesService {
  private readonly logger = new Logger(BusinessesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
    private readonly customFilters: CustomFilterService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ─── Public: request a business account ──────────────────────────────────

  async requestAccount(
    dto: BusinessRequestDto,
    file: Express.Multer.File | undefined,
    ip?: string,
  ) {
    // Bots fill the hidden field; pretend success and drop it.
    if (dto.website) {
      this.logger.warn(`Dropped honeypot business request from ${ip ?? 'unknown'}`);
      return { ok: true };
    }
    const attachment = file
      ? await this.cloudinary.uploadDocument(file, 'business-requests')
      : null;
    await this.prisma.inquiry.create({
      data: {
        type: 'BUSINESS_ACCOUNT',
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        address: dto.address,
        message: `Has ordered KorganoTech filters before (korganotech.com or Walmart.com)?\n${dto.orderedBefore}`,
        attachmentUrl: attachment?.url ?? null,
        attachmentName: attachment?.name ?? null,
        ipAddress: ip ?? null,
      },
    });
    return { ok: true };
  }

  // ─── Admin ───────────────────────────────────────────────────────────────

  async list(query: BusinessListQueryDto) {
    const { skip, take, page, pageSize } = paginate(query.page, query.pageSize ?? 20);
    const q = query.q?.trim();
    const where: Prisma.BusinessWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { address: { contains: q, mode: 'insensitive' } },
            { users: { some: { email: { contains: q, mode: 'insensitive' } } } },
          ],
        }
      : {};
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.business.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { users: true, filters: true } } },
      }),
      this.prisma.business.count({ where }),
    ]);
    return toPage(rows, total, page, pageSize);
  }

  async get(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
      include: { users: { select: userSelect, orderBy: { createdAt: 'asc' } } },
    });
    if (!business) throw new NotFoundException('Business not found.');
    return { ...business, filters: await this.pricedFilters(id) };
  }

  async create(dto: CreateBusinessDto) {
    if (dto.inquiryId) {
      const inquiry = await this.prisma.inquiry.findUnique({ where: { id: dto.inquiryId } });
      if (!inquiry || inquiry.type !== 'BUSINESS_ACCOUNT') {
        throw new NotFoundException('Request not found.');
      }
      const taken = await this.prisma.business.findUnique({ where: { inquiryId: dto.inquiryId } });
      if (taken) throw new ConflictException('A business account was already created from this request.');
    }
    const plan = await this.planLogin(dto.loginEmail, dto.firstName, dto.lastName);

    const business = await this.prisma.$transaction(async (tx) => {
      const created = await tx.business.create({
        data: {
          name: dto.name,
          phone: dto.phone || null,
          address: dto.address || null,
          notes: dto.notes || null,
          inquiryId: dto.inquiryId ?? null,
        },
      });
      await this.applyLogin(tx, created.id, plan);
      if (dto.inquiryId) {
        await tx.inquiry.update({ where: { id: dto.inquiryId }, data: { status: 'READ' } });
      }
      return created;
    });
    return {
      business: await this.get(business.id),
      login: this.loginResult(dto.loginEmail, plan),
    };
  }

  async update(id: string, dto: UpdateBusinessDto) {
    await this.mustExist(id);
    await this.prisma.business.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone === undefined ? undefined : dto.phone || null,
        address: dto.address === undefined ? undefined : dto.address || null,
        notes: dto.notes === undefined ? undefined : dto.notes || null,
        isActive: dto.isActive,
      },
    });
    return this.get(id);
  }

  async addUser(id: string, dto: AddBusinessUserDto) {
    await this.mustExist(id);
    const plan = await this.planLogin(dto.email, dto.firstName, dto.lastName, id);
    await this.prisma.$transaction((tx) => this.applyLogin(tx, id, plan));
    return { business: await this.get(id), login: this.loginResult(dto.email, plan) };
  }

  async removeUser(id: string, userId: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, businessId: id } });
    if (!user) throw new NotFoundException('That login is not part of this business.');
    await this.prisma.user.update({ where: { id: userId }, data: { businessId: null } });
    return this.get(id);
  }

  async addFilter(id: string, dto: BusinessFilterDto) {
    await this.mustExist(id);
    if (dto.variantId && dto.custom) {
      throw new BadRequestException('A filter is either a catalog item or a custom size, not both.');
    }
    const last = await this.prisma.businessFilter.aggregate({
      where: { businessId: id },
      _max: { sortOrder: true },
    });
    const sortOrder = (last._max.sortOrder ?? -1) + 1;

    if (dto.custom) {
      const spec = specOf(dto.custom);
      validateSpec(spec, await this.customFilters.getConfig());
      const key = customKey(spec);
      await this.assertNew({ businessId: id, customKey: key });
      await this.prisma.businessFilter.create({
        data: {
          businessId: id,
          customKey: key,
          customSpec: spec as unknown as Prisma.InputJsonValue,
          quantity: dto.quantity,
          label: dto.label || null,
          sortOrder,
        },
      });
    } else if (dto.variantId) {
      const variant = await this.prisma.productVariant.findUnique({ where: { id: dto.variantId } });
      if (!variant) throw new NotFoundException('That filter does not exist.');
      await this.assertNew({ businessId: id, variantId: variant.id });
      await this.prisma.businessFilter.create({
        data: {
          businessId: id,
          variantId: variant.id,
          quantity: dto.quantity,
          label: dto.label || null,
          sortOrder,
        },
      });
    } else {
      throw new BadRequestException('Choose a catalog filter or enter a custom size.');
    }
    return this.get(id);
  }

  async updateFilter(id: string, filterId: string, dto: UpdateBusinessFilterDto) {
    await this.ownFilter(id, filterId);
    await this.prisma.businessFilter.update({
      where: { id: filterId },
      data: {
        quantity: dto.quantity,
        label: dto.label === undefined ? undefined : dto.label || null,
        sortOrder: dto.sortOrder,
      },
    });
    return this.get(id);
  }

  async removeFilter(id: string, filterId: string) {
    await this.ownFilter(id, filterId);
    await this.prisma.businessFilter.delete({ where: { id: filterId } });
    return this.get(id);
  }

  // ─── The business's own view ─────────────────────────────────────────────

  async getMine(userId: string) {
    const business = await this.businessOf(userId);
    return {
      business: {
        id: business.id,
        name: business.name,
        phone: business.phone,
        address: business.address,
      },
      filters: await this.pricedFilters(business.id),
    };
  }

  /** Adds the chosen filters to the customer's cart at the quantities they picked. */
  async reorder(userId: string, dto: ReorderDto) {
    const business = await this.businessOf(userId);
    const rows = await this.prisma.businessFilter.findMany({ where: { businessId: business.id } });
    const skipped: { filterId: string; reason: string }[] = [];
    let added = 0;
    for (const item of dto.items) {
      const row = rows.find((r) => r.id === item.filterId);
      if (!row) {
        skipped.push({ filterId: item.filterId, reason: 'That filter is not on your list.' });
        continue;
      }
      try {
        await this.cart.addItem(
          userId,
          row.customSpec
            ? { custom: specOf(row.customSpec as unknown as CustomSpec), quantity: item.quantity }
            : { variantId: row.variantId!, quantity: item.quantity },
        );
        added += 1;
      } catch (e) {
        skipped.push({ filterId: row.id, reason: (e as Error).message || 'Could not be added.' });
      }
    }
    return { added, skipped, cart: await this.cart.getCart(userId) };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async businessOf(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { business: true },
    });
    if (!user?.business) {
      throw new NotFoundException('This account is not linked to a business account.');
    }
    if (!user.business.isActive) {
      throw new ForbiddenException('This business account is inactive. Please contact support.');
    }
    return user.business;
  }

  /** The saved list with current prices and availability. */
  private async pricedFilters(businessId: string) {
    const rows = await this.prisma.businessFilter.findMany({
      where: { businessId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    if (!rows.length) return [];
    const priced = await this.cart.price(
      rows.map((r) => ({
        id: r.id,
        variantId: r.variantId,
        custom: r.customSpec ? specOf(r.customSpec as unknown as CustomSpec) : null,
        quantity: r.quantity,
      })),
    );
    return rows.map((r, i) => ({
      ...priced.lines[i],
      id: r.id,
      label: r.label,
      quantity: r.quantity,
      sortOrder: r.sortOrder,
    }));
  }

  private async mustExist(id: string) {
    const b = await this.prisma.business.findUnique({ where: { id }, select: { id: true } });
    if (!b) throw new NotFoundException('Business not found.');
  }

  private async ownFilter(businessId: string, filterId: string) {
    const f = await this.prisma.businessFilter.findFirst({ where: { id: filterId, businessId } });
    if (!f) throw new NotFoundException('Filter not found on this business.');
  }

  private async assertNew(where: { businessId: string; variantId?: string; customKey?: string }) {
    const dup = await this.prisma.businessFilter.findFirst({ where });
    if (dup) throw new ConflictException('That filter is already on the list.');
  }

  /** Decides, before any write, how a login email will be attached. */
  private async planLogin(
    emailRaw: string,
    firstName?: string,
    lastName?: string,
    businessId?: string,
  ): Promise<LoginPlan> {
    const email = emailRaw.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.role === 'ADMIN') {
        throw new BadRequestException(
          'That email belongs to an admin account and cannot be a business login.',
        );
      }
      if (existing.businessId && existing.businessId !== businessId) {
        throw new ConflictException('That customer already belongs to another business account.');
      }
      return { kind: 'link', userId: existing.id };
    }
    if (!firstName || !lastName) {
      throw new BadRequestException(
        'No customer has that email yet. Enter their first and last name to create a login for them.',
      );
    }
    const tempPassword = this.tempPassword();
    return {
      kind: 'create',
      email,
      firstName,
      lastName,
      hash: await bcrypt.hash(tempPassword, 12),
      tempPassword,
    };
  }

  private async applyLogin(tx: Prisma.TransactionClient, businessId: string, plan: LoginPlan) {
    if (plan.kind === 'link') {
      await tx.user.update({ where: { id: plan.userId }, data: { businessId } });
    } else {
      await tx.user.create({
        data: {
          email: plan.email,
          firstName: plan.firstName,
          lastName: plan.lastName,
          passwordHash: plan.hash,
          businessId,
          cart: { create: {} },
        },
      });
    }
  }

  private loginResult(email: string, plan: LoginPlan) {
    return {
      email: email.trim().toLowerCase(),
      created: plan.kind === 'create',
      /** Shown to the admin once, to pass on to the customer. Never stored in plain text. */
      tempPassword: plan.kind === 'create' ? plan.tempPassword : null,
    };
  }

  /** 12 characters, always with a letter and a number (the site's password rule). */
  private tempPassword() {
    const letters = randomBytes(12).toString('base64url').replace(/[^a-zA-Z]/g, '');
    return `${letters.slice(0, 9)}${randomInt(100, 1000)}`;
  }
}
