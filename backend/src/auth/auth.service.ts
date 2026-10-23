import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { User } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { JwtPayload } from '../common/guards/jwt-auth.guard.js';
import type { LoginDto, RegisterDto } from './dto/auth.dto.js';

const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-password', 12);

export const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  createdAt: true,
  /** The business account this login belongs to, if any. */
  business: { select: { id: true, name: true, isActive: true } },
} as const;

export type PublicUser = Pick<
  User,
  'id' | 'email' | 'firstName' | 'lastName' | 'phone' | 'role' | 'createdAt'
> & { business: { id: string; name: string; isActive: boolean } | null };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone || null,
        passwordHash: await bcrypt.hash(dto.password, 12),
        cart: { create: {} },
      },
    });
    return { user: this.toPublic(user), token: await this.sign(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // Compare against a dummy hash when the user is missing so response time
    // doesn't reveal which emails are registered.
    const ok = await bcrypt.compare(
      dto.password,
      user?.passwordHash ?? DUMMY_HASH,
    );
    if (!user || !ok) {
      throw new UnauthorizedException('Incorrect email or password.');
    }
    if (!user.isActive) {
      throw new UnauthorizedException(
        'This account has been deactivated. Please contact support.',
      );
    }
    return { user: await this.me(user.id), token: await this.sign(user) };
  }

  /** Invalidates every outstanding token for the user. */
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  async me(userId: string): Promise<PublicUser> {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: publicUserSelect,
    });
  }

  private sign(user: Pick<User, 'id' | 'role' | 'tokenVersion'>) {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      tv: user.tokenVersion,
    };
    return this.jwt.signAsync(payload);
  }

  /** A just-registered user has no business account yet. */
  private toPublic(user: User): PublicUser {
    const { id, email, firstName, lastName, phone, role, createdAt } = user;
    return { id, email, firstName, lastName, phone, role, createdAt, business: null };
  }
}
