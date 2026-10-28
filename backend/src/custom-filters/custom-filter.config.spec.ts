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
  packQuantity: 2,
  ...over,
});

describe('custom filter pricing (base charge + per square inch)', () => {
  it('adds the base charge to the per-square-inch price', () => {
    // 1" MERV 13: $11.29 + 500 sq in x $0.0181 = $20.34 per filter, x2 in a 2-pack
    const q = priceSpec(spec(), DEFAULTS);
    expect(q.perFilter).toBe(20.34);
    expect(q.unitPrice).toBe(40.68);
  });

  it("matches the client's worked example (16x25x1 MERV 11, 2-pack)", () => {
    // $10.73 + 400 x $0.0157 = $17.01 per filter (the client's document shows $17.02, rounding)
    expect(priceSpec(spec({ width: 16, height: 25, mervRating: 11 }), DEFAULTS).perFilter).toBe(17.01);
  });

  it('prices every depth and MERV combination from its own base charge and rate', () => {
    // 20 x 25 = 500 sq in
    const expected: [number, number, number][] = [
      [1, 11, 10.73 + 500 * 0.0157],
      [2, 11, 20.08 + 500 * 0.0157],
      [4, 11, 34.82 + 500 * 0.0157],
      [1, 13, 11.29 + 500 * 0.0181],
      [2, 13, 22.75 + 500 * 0.0181],
      [4, 13, 42.56 + 500 * 0.0181],
    ];
    for (const [depth, merv, perFilter] of expected) {
      const q = priceSpec(spec({ depth, mervRating: merv }), DEFAULTS);
      expect(q.perFilter).toBeCloseTo(perFilter, 2);
    }
  });

  it('applies the minimum price to very small filters', () => {
    // 6 x 6 = 36 sq in -> $11.30 is below the $12.93 minimum for 1" MERV 11
    const q = priceSpec(spec({ width: 6, height: 6, mervRating: 11 }), DEFAULTS);
    expect(q.perFilter).toBe(12.93);
    expect(q.unitPrice).toBe(25.86);
  });

  it('gives 4-packs 7% off and 6-packs 13% off per filter', () => {
    const two = priceSpec(spec({ packQuantity: 2 }), DEFAULTS);
    const four = priceSpec(spec({ packQuantity: 4 }), DEFAULTS);
    const six = priceSpec(spec({ packQuantity: 6 }), DEFAULTS);
    expect(four.unitPrice).toBe(75.66); // 20.34 x 0.93 x 4
    expect(six.unitPrice).toBe(106.17); // 20.34 x 0.87 x 6
    expect(four.perFilter).toBeLessThan(two.perFilter);
    expect(six.perFilter).toBeLessThan(four.perFilter);
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
    expect(customSku(spec())).toBe('CUSTOM-20X25X1-M13-2PK');
  });
});

describe('custom filter validation', () => {
  it('accepts a size on the allowed grid', () => {
    expect(() => validateSpec(spec({ width: 19.875 }), DEFAULTS)).not.toThrow();
  });

  it('accepts the largest size in either orientation (25 x 36)', () => {
    expect(() => validateSpec(spec({ width: 25, height: 36 }), DEFAULTS)).not.toThrow();
    expect(() => validateSpec(spec({ width: 36, height: 25 }), DEFAULTS)).not.toThrow();
  });

  it.each([
    ['too small', { width: 0.5 }],
    ['longer than 36"', { height: 40 }],
    ['wider than 25" on both sides', { width: 26, height: 30 }],
    ['off the 1/8" grid', { width: 20.3 }],
    ['unsupported depth', { depth: 3 }],
    ['unsupported MERV', { mervRating: 8 }],
    ['an unsupported pack (1)', { packQuantity: 1 }],
    ['an unsupported pack (5)', { packQuantity: 5 }],
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
    expect(cfg.baseCharge).toEqual(DEFAULTS.baseCharge);
  });

  it('uses defaults for stored data that no longer makes sense', () => {
    expect(sanitizeConfig({ minDimension: 50, maxDimension: 10 })).toEqual(DEFAULTS);
  });

  it('rejects bad values when an admin saves', () => {
    expect(() => sanitizeConfig({ minDimension: 50, maxDimension: 10 }, true)).toThrow(BadRequestException);
    expect(() => sanitizeConfig({ maxShortSide: 'wide' }, true)).toThrow(/invalid/);
    expect(() => sanitizeConfig({ maxShortSide: 40 }, true)).toThrow(/shorter-side/);
    expect(() => sanitizeConfig({ depths: [1, 2, 6] }, true)).toThrow(/rate for 6/);
    expect(() =>
      sanitizeConfig({ packs: [{ quantity: 1, discount: 1 }, { quantity: 1, discount: 0.9 }] }, true),
    ).toThrow(/unique/);
  });

  it('requires a base charge and a minimum for every depth and MERV rating', () => {
    const { '4': _drop, ...baseWithout4 } = DEFAULTS.baseCharge;
    expect(() => sanitizeConfig({ ...DEFAULTS, baseCharge: baseWithout4 }, true)).toThrow(/base charge for 4/);
    const { '2': _drop2, ...minWithout2 } = DEFAULTS.minPrices;
    expect(() => sanitizeConfig({ ...DEFAULTS, minPrices: minWithout2 }, true)).toThrow(/minimum price for 2/);
  });

  it('accepts a complete valid config', () => {
    expect(() => sanitizeConfig({ ...DEFAULTS }, true)).not.toThrow();
  });
});
