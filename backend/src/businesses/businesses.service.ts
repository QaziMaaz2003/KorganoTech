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
import { OrdersService } from '../orders/orders.service.js';
import { MailService } from '../mail/mail.service.js';
import { businessLogin } from '../mail/mail.templates.js';
import { paginate, toPage } from '../common/utils/format.js';
import type {
  AddBusinessUserDto,
  BusinessFilterDto,
  BusinessListQueryDto,
  BusinessOrderDto,
  BusinessRequestDto,
  CreateBusinessDto,
  UpdateBusinessDto,
  UpdateBusinessFilterDto,
} from './dto/business.dto.js';
import {
  actualSize,
  buildBusinessSheet,
  lineKey,
  parseBusinessSheet,
  sizeLabel,
  type SheetLine,
  type SizeType,
} from './business-sheet.js';

/** What a stored list line holds (the size lives in customSpec). */
interface StoredSpec {
  width: number;
  height: number;
  depth: number;
  mervRating: number;
  sizeType?: SizeType;
}
const specOf = (v: unknown): StoredSpec | null => {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const [width, height, depth, mervRating] = [o.width, o.height, o.depth, o.mervRating].map(Number);
  if (![width, height, depth, mervRating].every(Number.isFinite)) return null;
  return { width, height, depth, mervRating, sizeType: o.sizeType === 'EXACT' ? 'EXACT' : 'NOMINAL' };
};

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
    private readonly cloudinary: CloudinaryService,
    private readonly orders: OrdersService,
    private readonly mail: MailService,
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
    const result = this.loginResult(dto.loginEmail, plan);
    void this.emailLogin(dto.name, result, dto.firstName, dto.lastName);
    return { business: await this.get(business.id), login: result };
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
    const business = await this.get(id);
    const result = this.loginResult(dto.email, plan);
    void this.emailLogin(business.name, result, dto.firstName, dto.lastName);
    return { business, login: result };
  }

  async removeUser(id: string, userId: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, businessId: id } });
    if (!user) throw new NotFoundException('That login is not part of this business.');
    await this.prisma.user.update({ where: { id: userId }, data: { businessId: null } });
    return this.get(id);
  }

  async addFilter(id: string, dto: BusinessFilterDto) {
    await this.mustExist(id);
    const line: SheetLine = {
      label: dto.label || null,
      width: dto.width,
      height: dto.height,
      depth: dto.depth,
      mervRating: dto.mervRating,
      sizeType: dto.sizeType,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice ?? null,
    };
    await this.assertNew({ businessId: id, customKey: lineKey(line), label: line.label });
    const last = await this.prisma.businessFilter.aggregate({
      where: { businessId: id },
      _max: { sortOrder: true },
    });
    await this.prisma.businessFilter.create({
      data: this.rowData(id, line, (last._max.sortOrder ?? -1) + 1),
    });
    return this.get(id);
  }

  async updateFilter(id: string, filterId: string, dto: UpdateBusinessFilterDto) {
    const current = await this.ownFilter(id, filterId);
    const spec = specOf(current.customSpec);
    const nextLabel = dto.label === undefined ? current.label : dto.label || null;
    const nextType = dto.sizeType ?? spec?.sizeType ?? 'NOMINAL';
    let customKey = current.customKey;
    let customSpec = current.customSpec as Prisma.InputJsonValue | null;
    if (spec && (nextType !== spec.sizeType || nextLabel !== current.label)) {
      const next = { ...spec, sizeType: nextType };
      customKey = lineKey(next);
      customSpec = next as unknown as Prisma.InputJsonValue;
      await this.assertNew({ businessId: id, customKey, label: nextLabel }, filterId);
    }
    await this.prisma.businessFilter.update({
      where: { id: filterId },
      data: {
        quantity: dto.quantity,
        unitPrice: dto.unitPrice === undefined ? undefined : dto.unitPrice,
        label: dto.label === undefined ? undefined : nextLabel,
        sortOrder: dto.sortOrder,
        customKey,
        customSpec: customSpec ?? undefined,
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
        /** Businesses are invoiced by KorganoTech on delivery. */
        paymentTerms: 'Net 30',
      },
      filters: await this.pricedFilters(business.id),
    };
  }

  /** Places an invoice order for the chosen lines at their agreed price per filter. */
  async placeOrder(userId: string, email: string, dto: BusinessOrderDto) {
    const business = await this.businessOf(userId);
    const rows = await this.prisma.businessFilter.findMany({ where: { businessId: business.id } });
    const items = dto.items.map((item) => {
      const row = rows.find((r) => r.id === item.filterId);
      if (!row) throw new BadRequestException('One of the filters is not on your list any more. Please reload the page.');
      const spec = specOf(row.customSpec);
      if (!spec) throw new BadRequestException('One of the filters on your list is incomplete. Please contact us.');
      if (row.unitPrice === null) {
        throw new BadRequestException(
          `${sizeLabel(spec)} (MERV ${spec.mervRating}) does not have a price yet. Please contact us to confirm it.`,
        );
      }
      return {
        label: row.label,
        spec: { ...spec, sizeType: spec.sizeType ?? ('NOMINAL' as SizeType) },
        quantity: item.quantity,
        unitPrice: row.unitPrice,
      };
    });
    const merged = new Map<string, (typeof items)[number]>();
    for (const i of items) {
      const k = `${i.label ?? ''}|${lineKey(i.spec)}`;
      const prev = merged.get(k);
      if (prev) prev.quantity += i.quantity;
      else merged.set(k, { ...i });
    }
    return this.orders.placeInvoiceOrder(userId, email, business.name, [...merged.values()], dto);
  }

  // ─── Excel import / export (the standard order sheet) ────────────────────

  /** The blank standard sheet, with two example rows. */
  template() {
    return buildBusinessSheet('Customer name', [], true);
  }

  async exportSheet(id: string) {
    const business = await this.get(id);
    const lines = business.filters.map((f) => {
      const [school, ...rest] = (f.label ?? '').split(' - ');
      const building = rest.join(' - ').replace(/^Building /i, '');
      return {
        school: rest.length ? school : f.label ?? '',
        building: rest.length ? building : '',
        label: f.label,
        width: f.width,
        height: f.height,
        depth: f.depth,
        mervRating: f.mervRating,
        sizeType: f.sizeType,
        quantity: f.quantity,
        unitPrice: f.unitPrice,
      };
    });
    return { name: business.name, buffer: await buildBusinessSheet(business.name, lines) };
  }

  /**
   * Reads an uploaded standard sheet. Without apply it only reports what would change.
   * merge updates lines that already exist (same place, size, MERV and type) and adds the new ones;
   * replace makes the sheet the whole list.
   */
  async importSheet(id: string, file: Express.Multer.File | undefined, mode: 'merge' | 'replace', apply: boolean) {
    const business = await this.get(id);
    if (!file) throw new BadRequestException('Choose an Excel (.xlsx) file to upload.');
    let parsed;
    try {
      parsed = await parseBusinessSheet(file.buffer);
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
    const warnings = [...parsed.warnings];
    if (parsed.customerName && parsed.customerName.trim().toLowerCase() !== business.name.trim().toLowerCase()) {
      warnings.unshift({
        row: 0,
        message: `The sheet is for "${parsed.customerName}" but this business is "${business.name}".`,
      });
    }

    const existing = await this.prisma.businessFilter.findMany({ where: { businessId: id } });
    const keyOf = (label: string | null, customKey: string | null) => `${label ?? ''}|${customKey ?? ''}`;
    const existingByKey = new Map(existing.map((r) => [keyOf(r.label, r.customKey), r]));
    const sheetKeys = new Set(parsed.lines.map((l) => keyOf(l.label, lineKey(l))));
    const toCreate = parsed.lines.filter((l) => !existingByKey.has(keyOf(l.label, lineKey(l))));
    const toUpdate = parsed.lines.filter((l) => existingByKey.has(keyOf(l.label, lineKey(l))));
    const toRemove = mode === 'replace' ? existing.filter((r) => !sheetKeys.has(keyOf(r.label, r.customKey))) : [];

    const summary = {
      mode,
      applied: false,
      customerName: parsed.customerName,
      lines: parsed.lines.length,
      created: toCreate.length,
      updated: toUpdate.length,
      removed: toRemove.length,
      withoutPrice: parsed.lines.filter((l) => l.unitPrice === null).length,
      errors: parsed.errors,
      warnings,
    };
    if (!apply) return summary;
    if (parsed.errors.length) {
      throw new BadRequestException(
        `Fix ${parsed.errors.length} row${parsed.errors.length === 1 ? '' : 's'} in the sheet first (first problem: row ${parsed.errors[0].row}, ${parsed.errors[0].message})`,
      );
    }
    if (!parsed.lines.length) throw new BadRequestException('The sheet has no filter lines to import.');

    await this.prisma.$transaction(async (tx) => {
      if (toRemove.length) {
        await tx.businessFilter.deleteMany({ where: { id: { in: toRemove.map((r) => r.id) } } });
      }
      for (const l of toUpdate) {
        const row = existingByKey.get(keyOf(l.label, lineKey(l)))!;
        await tx.businessFilter.update({
          where: { id: row.id },
          // A blank price in the sheet never wipes a price KorganoTech already set.
          data: { quantity: l.quantity, ...(l.unitPrice === null ? {} : { unitPrice: l.unitPrice }) },
        });
      }
      let sort = (existing.reduce((m, r) => Math.max(m, r.sortOrder), -1) ?? -1) + 1;
      for (const l of toCreate) {
        await tx.businessFilter.create({ data: this.rowData(id, l, sort++) });
      }
    });
    return { ...summary, applied: true };
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

  /** The saved list: what each line is, how many, and its price per filter. */
  private async pricedFilters(businessId: string) {
    const rows = await this.prisma.businessFilter.findMany({
      where: { businessId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.flatMap((r) => {
      const spec = specOf(r.customSpec);
      if (!spec) return []; // a line from before invoice ordering that has no size to show
      const sizeType = spec.sizeType ?? 'NOMINAL';
      const unitPrice = r.unitPrice === null ? null : Number(r.unitPrice);
      return [
        {
          id: r.id,
          label: r.label,
          width: spec.width,
          height: spec.height,
          depth: spec.depth,
          size: sizeLabel(spec),
          actualSize: actualSize({ ...spec, sizeType }),
          mervRating: spec.mervRating,
          sizeType,
          quantity: r.quantity,
          unitPrice,
          lineTotal: unitPrice === null ? null : Math.round(unitPrice * r.quantity * 100) / 100,
          sortOrder: r.sortOrder,
        },
      ];
    });
  }

  private rowData(businessId: string, l: SheetLine, sortOrder: number): Prisma.BusinessFilterUncheckedCreateInput {
    return {
      businessId,
      label: l.label,
      customKey: lineKey(l),
      customSpec: {
        width: l.width,
        height: l.height,
        depth: l.depth,
        mervRating: l.mervRating,
        sizeType: l.sizeType,
      } as Prisma.InputJsonValue,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      sortOrder,
    };
  }

  /** Tells the customer their business login is ready. Never blocks creating the account. */
  private async emailLogin(
    businessName: string,
    result: { email: string; tempPassword: string | null },
    firstName?: string,
    lastName?: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email: result.email } });
      const name = [firstName ?? user?.firstName, lastName ?? user?.lastName].filter(Boolean).join(' ') || 'there';
      await this.mail.send(
        businessLogin({ name, email: result.email, businessName, tempPassword: result.tempPassword, siteUrl: this.mail.siteUrl() }),
      );
    } catch (e) {
      this.logger.warn(`Could not email the business login: ${(e as Error).message}`);
    }
  }

  private async mustExist(id: string) {
    const b = await this.prisma.business.findUnique({ where: { id }, select: { id: true } });
    if (!b) throw new NotFoundException('Business not found.');
  }

  private async ownFilter(businessId: string, filterId: string) {
    const f = await this.prisma.businessFilter.findFirst({ where: { id: filterId, businessId } });
    if (!f) throw new NotFoundException('Filter not found on this business.');
    return f;
  }

  /** The same size may appear once per label (null counts as a label of its own). */
  private async assertNew(
    where: { businessId: string; customKey: string; label: string | null },
    exceptId?: string,
  ) {
    const dup = await this.prisma.businessFilter.findFirst({
      where: { ...where, ...(exceptId ? { id: { not: exceptId } } : {}) },
    });
    if (dup) throw new ConflictException('That filter is already on the list for this label.');
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
