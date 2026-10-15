import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import {
  RATE_LIMIT_KEY,
  type RateLimitOptions,
} from '../decorators/rate-limit.decorator.js';

/** Baseline ceiling for every route: 300 requests per minute per client. */
const DEFAULT_LIMIT: RateLimitOptions = { limit: 300, ttl: 60_000 };

interface Window {
  count: number;
  resetAt: number;
}

/**
 * In-memory fixed-window rate limiter, applied globally. Each route has its own
 * counter per client IP; @RateLimit() narrows or widens the default for a route.
 *
 * Counters live in the memory of one server instance, so on serverless hosting
 * the effective limit is per instance — fine as a brake on abuse, but not an
 * exact global quota.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly windows = new Map<string, Window>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const { limit, ttl } =
      this.reflector.getAllAndOverride<RateLimitOptions | undefined>(
        RATE_LIMIT_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? DEFAULT_LIMIT;

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const key = `${context.getClass().name}.${context.getHandler().name}|${req.ip ?? 'unknown'}`;
    const now = Date.now();
    this.sweep(now);

    let w = this.windows.get(key);
    if (!w || w.resetAt <= now) {
      w = { count: 0, resetAt: now + ttl };
      this.windows.set(key, w);
    }
    w.count++;

    if (w.count > limit) {
      res.setHeader('Retry-After', Math.ceil((w.resetAt - now) / 1000));
      throw new HttpException(
        'Too many requests. Please wait a moment and try again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }

  /** Drops expired windows so the map can't grow without bound. */
  private sweep(now: number) {
    if (this.windows.size < 500) return;
    for (const [key, w] of this.windows) {
      if (w.resetAt <= now) this.windows.delete(key);
    }
  }
}
