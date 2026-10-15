import { SetMetadata } from '@nestjs/common';

export interface RateLimitOptions {
  /** Requests allowed per window, per client IP and route. */
  limit: number;
  /** Window length in milliseconds. */
  ttl: number;
}

export const RATE_LIMIT_KEY = 'rate-limit';

/** Overrides the API-wide default limit for one route (e.g. login attempts). */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
