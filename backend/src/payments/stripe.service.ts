import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import Stripe from 'stripe';

export interface CheckoutLine {
  name: string;
  description?: string;
  /** Price in dollars for one unit. */
  unitPrice: number;
  quantity: number;
  imageUrl?: string | null;
}

export interface CheckoutSessionInput {
  orderId: string;
  /** Human order number, e.g. "KT-100123". */
  orderNumber: string;
  email: string;
  currency: string;
  lines: CheckoutLine[];
  shippingFee: number;
  tax: number;
  successUrl: string;
  cancelUrl: string;
  expiresAt: Date;
}

const toCents = (dollars: number) => Math.round(dollars * 100);

/** Thin wrapper around the Stripe SDK so the rest of the API never touches it directly. */
@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private client: Stripe | null = null;

  /** True once STRIPE_SECRET_KEY is set. Checkout refuses to start without it. */
  get configured(): boolean {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  }

  private get stripe(): Stripe {
    if (!this.configured) {
      throw new ServiceUnavailableException(
        'Online card payments are not available right now. Please try again later.',
      );
    }
    if (!this.client) {
      const config: ConstructorParameters<typeof Stripe>[1] = {
        maxNetworkRetries: 2,
        timeout: 20_000,
      };
      // Lets tests point the SDK at a local mock instead of api.stripe.com.
      const base = process.env.STRIPE_API_BASE_URL;
      if (base) {
        const u = new URL(base);
        config.protocol = u.protocol.replace(':', '') as 'http' | 'https';
        config.host = u.hostname;
        config.port = u.port || (u.protocol === 'https:' ? 443 : 80);
      }
      this.client = new Stripe(process.env.STRIPE_SECRET_KEY as string, config);
    }
    return this.client;
  }

  async createCheckoutSession(input: CheckoutSessionInput) {
    const currency = input.currency.toLowerCase();
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = input.lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency,
        unit_amount: toCents(l.unitPrice),
        product_data: {
          name: l.name,
          ...(l.description ? { description: l.description.slice(0, 500) } : {}),
          ...(l.imageUrl?.startsWith('https://') ? { images: [l.imageUrl] } : {}),
        },
      },
    }));
    if (input.shippingFee > 0) {
      line_items.push({
        quantity: 1,
        price_data: { currency, unit_amount: toCents(input.shippingFee), product_data: { name: 'Shipping' } },
      });
    }
    if (input.tax > 0) {
      line_items.push({
        quantity: 1,
        price_data: { currency, unit_amount: toCents(input.tax), product_data: { name: 'Sales tax' } },
      });
    }

    const metadata = { orderId: input.orderId, orderNumber: input.orderNumber };
    try {
      const session = await this.stripe.checkout.sessions.create(
        {
          mode: 'payment',
          client_reference_id: input.orderId,
          customer_email: input.email,
          line_items,
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          expires_at: Math.floor(input.expiresAt.getTime() / 1000),
          metadata,
          payment_intent_data: {
            metadata,
            description: `KorganoTech order ${input.orderNumber}`,
          },
        },
        // A retried request for the same attempt returns the same session.
        { idempotencyKey: `checkout-${input.orderId}-${Math.floor(input.expiresAt.getTime() / 1000)}` },
      );
      if (!session.url) throw new Error('Stripe returned no checkout URL');
      return { id: session.id, url: session.url };
    } catch (e) {
      this.logger.error(`Could not create a checkout session for ${input.orderNumber}: ${(e as Error).message}`);
      if (e instanceof ServiceUnavailableException) throw e;
      throw new BadGatewayException(
        'We could not start the card payment. Please try again in a moment.',
      );
    }
  }

  getSession(id: string) {
    return this.stripe.checkout.sessions.retrieve(id);
  }

  async expireSession(id: string): Promise<void> {
    try {
      await this.stripe.checkout.sessions.expire(id);
    } catch (e) {
      // Already complete/expired — nothing to do.
      this.logger.debug(`Session ${id} could not be expired: ${(e as Error).message}`);
    }
  }

  async refund(paymentIntentId: string): Promise<void> {
    await this.stripe.refunds.create({ payment_intent: paymentIntentId });
  }

  /** Verifies the signature and parses the event. Throws if it is not from Stripe. */
  constructEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new ServiceUnavailableException('Stripe webhooks are not configured.');
    }
    return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
  }
}
