import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { RateLimit } from '../common/decorators/rate-limit.decorator.js';
import { StripeService } from '../payments/stripe.service.js';
import { OrdersService } from './orders.service.js';

/** Receives payment events from Stripe. Authenticated by the webhook signature, not a login. */
@Controller('payments')
export class StripeWebhookController {
  constructor(
    private readonly stripe: StripeService,
    private readonly orders: OrdersService,
  ) {}

  @RateLimit({ limit: 600, ttl: 60_000 })
  @Post('stripe/webhook')
  @HttpCode(200)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    if (!signature || !req.rawBody) {
      throw new BadRequestException('Missing Stripe signature.');
    }
    let event;
    try {
      event = this.stripe.constructEvent(req.rawBody, signature);
    } catch {
      throw new BadRequestException('Invalid Stripe signature.');
    }
    await this.orders.handleStripeEvent(event);
    return { received: true };
  }
}
