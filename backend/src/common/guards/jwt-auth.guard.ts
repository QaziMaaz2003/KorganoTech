import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AuthedRequest } from '../decorators/current-user.decorator.js';

export const SESSION_COOKIE = 'kt_session';

export interface JwtPayload {
  sub: string;
  role: string;
  tv: number;
}

export function readToken(req: Request): string | undefined {
  const cookie = (req.cookies as Record<string, string> | undefined)?.[
    SESSION_COOKIE
  ];
  if (cookie) return cookie;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return undefined;
}

/**
 * Verifies the session JWT and re-checks the user row on every request, so a
 * deactivated account, a role change or a logout (tokenVersion bump)
 * invalidates outstanding tokens immediately.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = readToken(req);
    if (!token) throw new UnauthorizedException('Please sign in to continue.');

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Your session has expired. Please sign in again.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        tokenVersion: true,
      },
    });
    if (!user || !user.isActive || user.tokenVersion !== payload.tv) {
      throw new UnauthorizedException('Your session has expired. Please sign in again.');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return true;
  }
}
