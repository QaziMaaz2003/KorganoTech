import { Prisma } from '../../generated/prisma/client.js';

export const D = (v: string | number | Prisma.Decimal) => new Prisma.Decimal(v);

export const ZERO = D(0);

/** Round half-up to cents. */
export const cents = (v: Prisma.Decimal) =>
  v.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

export interface TotalsSettings {
  shippingFee: Prisma.Decimal;
  freeShippingThreshold: Prisma.Decimal | null;
  taxRate: Prisma.Decimal;
}

export interface Totals {
  subtotal: Prisma.Decimal;
  shippingFee: Prisma.Decimal;
  tax: Prisma.Decimal;
  total: Prisma.Decimal;
  /** How much more is needed for free shipping, if a threshold is set. */
  freeShippingRemaining: Prisma.Decimal | null;
}

export function computeTotals(
  subtotal: Prisma.Decimal,
  settings: TotalsSettings,
): Totals {
  const threshold = settings.freeShippingThreshold;
  const qualifiesFree = threshold !== null && subtotal.gte(threshold);
  const shippingFee =
    subtotal.isZero() || qualifiesFree ? ZERO : cents(settings.shippingFee);
  const tax = cents(subtotal.mul(settings.taxRate));
  return {
    subtotal: cents(subtotal),
    shippingFee,
    tax,
    total: cents(subtotal.add(shippingFee).add(tax)),
    freeShippingRemaining:
      threshold === null || qualifiesFree ? null : cents(threshold.sub(subtotal)),
  };
}
