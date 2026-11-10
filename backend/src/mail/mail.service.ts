import { Injectable, Logger } from '@nestjs/common';

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends transactional email through Resend's HTTP API.
 *
 * Needs RESEND_API_KEY and MAIL_FROM (e.g. "KorganoTech <orders@korganotech.com>", an address
 * on a domain verified in Resend). Without them nothing is sent and a line is logged, so the
 * store works normally before email is set up. A failed send is logged and never thrown:
 * an email problem must not break an order or an account creation.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  get configured(): boolean {
    return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
  }

  /** Public address of the storefront, for links inside emails. */
  siteUrl(): string {
    const raw =
      process.env.SITE_URL ?? (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',')[0];
    return raw.trim().replace(/\/+$/, '');
  }

  async send(message: MailMessage): Promise<boolean> {
    if (!this.configured) {
      this.logger.log(`Email not configured, skipped "${message.subject}"`);
      return false;
    }
    try {
      const base = (process.env.RESEND_API_BASE_URL ?? 'https://api.resend.com').replace(/\/+$/, '');
      const res = await fetch(`${base}/emails`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.MAIL_FROM,
          to: [message.to],
          reply_to: process.env.MAIL_REPLY_TO || 'Support@KorganoTech.com',
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        this.logger.error(`Resend rejected "${message.subject}" (${res.status}): ${(await res.text()).slice(0, 300)}`);
        return false;
      }
      return true;
    } catch (e) {
      this.logger.error(`Could not send "${message.subject}": ${(e as Error).message}`);
      return false;
    }
  }
}
