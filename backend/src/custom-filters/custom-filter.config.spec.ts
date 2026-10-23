import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import {
  customKey,
  customLabel,
  customSku,
  DEFAULT_CUSTOM_FILTER_CONFIG as DEFAULTS,
  priceSpec,
  sanitizeConfig,
  validateSpec,
  type CustomSpec,
} from './custom-filter.config.js';

const spec = (over: Partial<CustomSpec> = {}): CustomSpec => ({
  width: 20,
  height: 25,
  depth: 1,
  mervRating: 13,
  packQuantity: 1,
  ...over,
});

describe('custom filter pricing', () => {
  it('prices by area and ends in .99 like catalog prices', () => {
    // 20 x 25 = 500 sq in at $0.0315 = $15.75 per filter
    expect(priceSpec(spec(), DEFAULTS).unitPrice).toBe(15.99);
  });

  it('applies the minimum price to very small filters', () => {
    const q = priceSpec(spec({ width: 6, height: 6 }), DEFAULTS); // 36 sq in -> floor 8.99
    expect(q.unitPrice).toBe(8.99);
  });

  it('applies the pack quantity and discount', () => {
    const one = priceSpec(spec({ packQuantity: 1 }), DEFAULTS).unitPrice;
    const six = priceSpec(spec({ packQuantity: 6 }), DEFAULTS);
    expect(six.unitPrice).toBe(Math.floor(15.75 * 6 * 0.95) + 0.99);
    expect(six.perFilter).toBeLessThan(one);
  });

  it('charges more for deeper and higher-MERV filters', () => {
    const a = priceSpec(spec({ depth: 1, mervRating: 11 }), DEFAULTS).unitPrice;
    const b = priceSpec(spec({ depth: 1, mervRating: 13 }), DEFAULTS).unitPrice;
    const c = priceSpec(spec({ depth: 4, mervRating: 13 }), DEFAULTS).unitPrice;
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });

  it('builds stable identifiers and labels', () => {
    expect(customKey(spec({ packQuantity: 4 }))).toBe('20x25x1-M13-4pk');
    expect(customLabel(spec({ width: 20.125, packQuantity: 4 }))).toBe('Custom 20.125 x 25 x 1 · MERV 13 · 4-pack');
    expect(customSku(spec())).toBe('CUSTOM-20X25X1-M13-1PK');
  });
});

describe('custom filter validation', () => {
  it('accepts a size on the allowed grid', () => {
    expect(() => validateSpec(spec({ width: 19.875 }), DEFAULTS)).not.toThrow();
  });

  it.each([
    ['too small', { width: 5 }],
    ['too large', { height: 40 }],
    ['off the 1/8" grid', { width: 20.3 }],
    ['unsupported depth', { depth: 3 }],
    ['unsupported MERV', { mervRating: 8 }],
    ['unsupported pack', { packQuantity: 5 }],
  ])('rejects a size that is %s', (_name, over) => {
    expect(() => validateSpec(spec(over as Partial<CustomSpec>), DEFAULTS)).toThrow(BadRequestException);
  });

  it('refuses orders when the feature is switched off', () => {
    expect(() => validateSpec(spec(), { ...DEFAULTS, enabled: false })).toThrow(/not available/);
  });
});

describe('custom filter settings', () => {
  it('falls back to the defaults when nothing is stored', () => {
    expect(sanitizeConfig(null)).toEqual(DEFAULTS);
  });

  it('merges stored values over the defaults', () => {
    const cfg = sanitizeConfig({ maxDimension: 30, leadTimeNote: 'Ships in 3 days' });
    expect(cfg.maxDimension).toBe(30);
    expect(cfg.leadTimeNote).toBe('Ships in 3 days');
    expect(cfg.depths).toEqual(DEFAULTS.depths);
  });

  it('uses defaults for stored data that no longer makes sense', () => {
    expect(sanitizeConfig({ minDimension: 50, maxDimension: 10 })).toEqual(DEFAULTS);
  });

  it('rejects bad values when an admin saves', () => {
    expect(() => sanitizeConfig({ minDimension: 50, maxDimension: 10 }, true)).toThrow(BadRequestException);
    expect(() => sanitizeConfig({ minUnitPrice: 'free' }, true)).toThrow(/invalid/);
    expect(() => sanitizeConfig({ depths: [1, 2, 6] }, true)).toThrow(/rate for 6/);
    expect(() =>
      sanitizeConfig({ packs: [{ quantity: 1, discount: 1 }, { quantity: 1, discount: 0.9 }] }, true),
    ).toThrow(/unique/);
  });

  it('accepts a complete valid config', () => {
    expect(() => sanitizeConfig({ ...DEFAULTS, minUnitPrice: 12.5 }, true)).not.toThrow();
  });
});
