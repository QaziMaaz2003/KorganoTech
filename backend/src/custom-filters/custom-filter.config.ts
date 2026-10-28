import { BadRequestException } from '@nestjs/common';

/** A made-to-order filter as the customer specified it. */
export interface CustomSpec {
  /** Exact dimensions in inches. */
  width: number;
  height: number;
  depth: number;
  mervRating: number;
  /** Filters per pack. */
  packQuantity: number;
}

export interface CustomPack {
  quantity: number;
  /** Price multiplier per filter, e.g. 0.95 for 5% off. */
  discount: number;
}

/** Admin-editable rules for ordering custom-size filters. */
export interface CustomFilterConfig {
  enabled: boolean;
  /** Smallest allowed width or height (inches). */
  minDimension: number;
  /** Longest side allowed (inches). */
  maxDimension: number;
  /** The shorter side may not exceed this (inches). */
  maxShortSide: number;
  /** Dimensions must be a multiple of this (inches). */
  step: number;
  depths: number[];
  mervRatings: number[];
  /** Dollars per square inch, per filter: rates[depth][merv]. */
  rates: Record<string, Record<string, number>>;
  /** Fixed charge per filter, added to the per-square-inch price: baseCharge[depth][merv]. */
  baseCharge: Record<string, Record<string, number>>;
  /** Floor price per filter before pack discounts: minPrices[depth][merv]. */
  minPrices: Record<string, Record<string, number>>;
  packs: CustomPack[];
  leadTimeNote: string;
}

export const MAX_CUSTOM_QTY = 99;

/** Name shown for made-to-order lines in carts, orders and Stripe. */
export const CUSTOM_PRODUCT_NAME = 'Custom Size Air Filter';

/**
 * The client's custom-filter pricing (Product info document): per filter, on a
 * 2-pack basis, price = base charge + rate x (width x height), never below the
 * minimum. 4-packs are 7% off per filter and 6-packs 13% off. The admin can
 * adjust everything in Settings.
 */
export const DEFAULT_CUSTOM_FILTER_CONFIG: CustomFilterConfig = {
  enabled: true,
  minDimension: 1,
  maxDimension: 36,
  maxShortSide: 25,
  step: 0.125,
  depths: [1, 2, 4],
  mervRatings: [11, 13],
  rates: {
    '1': { '11': 0.0157, '13': 0.0181 },
    '2': { '11': 0.0157, '13': 0.0181 },
    '4': { '11': 0.0157, '13': 0.0181 },
  },
  baseCharge: {
    '1': { '11': 10.73, '13': 11.29 },
    '2': { '11': 20.08, '13': 22.75 },
    '4': { '11': 34.82, '13': 42.56 },
  },
  minPrices: {
    '1': { '11': 12.93, '13': 13.69 },
    '2': { '11': 21.66, '13': 24.66 },
    '4': { '11': 36.09, '13': 41.57 },
  },
  packs: [
    { quantity: 2, discount: 1 },
    { quantity: 4, discount: 0.93 },
    { quantity: 6, discount: 0.87 },
  ],
  leadTimeNote: 'Made to order. Ships in 3 business days.',
};

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/**
 * Merges stored admin settings over the defaults and rejects anything that
 * would break pricing. Used both when reading and when saving.
 */
export function sanitizeConfig(input: unknown, strict = false): CustomFilterConfig {
  const base = DEFAULT_CUSTOM_FILTER_CONFIG;
  const src = (input && typeof input === 'object' ? input : {}) as Partial<CustomFilterConfig>;
  const fail = (msg: string): never => {
    throw new BadRequestException(msg);
  };

  if (strict) {
    const wrong = (k: keyof CustomFilterConfig, ok: boolean) => {
      if (src[k] !== undefined && !ok) fail(`"${k}" has an invalid value.`);
    };
    wrong('enabled', typeof src.enabled === 'boolean');
    for (const k of ['minDimension', 'maxDimension', 'maxShortSide', 'step'] as const) wrong(k, isNum(src[k]));
    wrong('depths', Array.isArray(src.depths) && src.depths.every(isNum));
    wrong('mervRatings', Array.isArray(src.mervRatings) && src.mervRatings.every(isNum));
    wrong('rates', !!src.rates && typeof src.rates === 'object');
    wrong('baseCharge', !!src.baseCharge && typeof src.baseCharge === 'object');
    wrong('minPrices', !!src.minPrices && typeof src.minPrices === 'object');
    wrong('packs', Array.isArray(src.packs) && src.packs.every((p) => p && isNum(p.quantity) && isNum(p.discount)));
    wrong('leadTimeNote', typeof src.leadTimeNote === 'string');
  }

  const cfg: CustomFilterConfig = {
    enabled: typeof src.enabled === 'boolean' ? src.enabled : base.enabled,
    minDimension: isNum(src.minDimension) ? src.minDimension : base.minDimension,
    maxDimension: isNum(src.maxDimension) ? src.maxDimension : base.maxDimension,
    maxShortSide: isNum(src.maxShortSide) ? src.maxShortSide : base.maxShortSide,
    step: isNum(src.step) ? src.step : base.step,
    depths: Array.isArray(src.depths) ? src.depths.filter(isNum) : base.depths,
    mervRatings: Array.isArray(src.mervRatings) ? src.mervRatings.filter(isNum) : base.mervRatings,
    rates: src.rates && typeof src.rates === 'object' ? (src.rates as CustomFilterConfig['rates']) : base.rates,
    baseCharge:
      src.baseCharge && typeof src.baseCharge === 'object' ? (src.baseCharge as CustomFilterConfig['baseCharge']) : base.baseCharge,
    minPrices:
      src.minPrices && typeof src.minPrices === 'object' ? (src.minPrices as CustomFilterConfig['minPrices']) : base.minPrices,
    packs: Array.isArray(src.packs)
      ? src.packs.filter((p) => p && isNum(p.quantity) && isNum(p.discount))
      : base.packs,
    leadTimeNote: typeof src.leadTimeNote === 'string' ? src.leadTimeNote.slice(0, 200) : base.leadTimeNote,
  };

  // Validation errors only matter when an admin is saving; stored data that is
  // somehow invalid falls back to defaults so the storefront keeps working.
  const problems: string[] = [];
  if (cfg.minDimension <= 0 || cfg.maxDimension <= cfg.minDimension) problems.push('Dimension limits are invalid.');
  if (cfg.maxShortSide < cfg.minDimension || cfg.maxShortSide > cfg.maxDimension) {
    problems.push('The shorter-side limit must sit between the smallest and the longest size.');
  }
  if (cfg.step <= 0 || cfg.step > 1) problems.push('Dimension step must be between 0 and 1 inch.');
  if (!cfg.depths.length || cfg.depths.some((d) => d <= 0)) problems.push('Add at least one valid depth.');
  if (!cfg.mervRatings.length || cfg.mervRatings.some((m) => !Number.isInteger(m) || m < 1 || m > 16)) {
    problems.push('MERV ratings must be whole numbers from 1 to 16.');
  }
  if (!cfg.packs.length || cfg.packs.some((p) => !Number.isInteger(p.quantity) || p.quantity < 1 || p.discount <= 0 || p.discount > 1)) {
    problems.push('Packs need a whole quantity and a discount multiplier above 0 and up to 1.');
  }
  if (new Set(cfg.packs.map((p) => p.quantity)).size !== cfg.packs.length) problems.push('Pack quantities must be unique.');
  for (const d of cfg.depths) {
    for (const m of cfg.mervRatings) {
      const rate = cfg.rates?.[String(d)]?.[String(m)];
      if (!isNum(rate) || rate <= 0) problems.push(`Set a price rate for ${d}" depth, MERV ${m}.`);
      const base = cfg.baseCharge?.[String(d)]?.[String(m)];
      if (!isNum(base) || base < 0) problems.push(`Set a base charge for ${d}" depth, MERV ${m}.`);
      const min = cfg.minPrices?.[String(d)]?.[String(m)];
      if (!isNum(min) || min < 0) problems.push(`Set a minimum price for ${d}" depth, MERV ${m}.`);
    }
  }
  if (problems.length) {
    if (strict) fail(problems[0]);
    return { ...base };
  }
  return cfg;
}

/** Stable identity for a custom size, used to merge repeat adds in a cart. */
export function customKey(spec: CustomSpec): string {
  return `${spec.width}x${spec.height}x${spec.depth}-M${spec.mervRating}-${spec.packQuantity}pk`;
}

const trim = (n: number) => String(Number(n.toFixed(3)));

export function customSizeLabel(spec: Pick<CustomSpec, 'width' | 'height' | 'depth'>): string {
  return `${trim(spec.width)} x ${trim(spec.height)} x ${trim(spec.depth)}`;
}

export function customLabel(spec: CustomSpec): string {
  const parts = [`Custom ${customSizeLabel(spec)}`, `MERV ${spec.mervRating}`];
  if (spec.packQuantity > 1) parts.push(`${spec.packQuantity}-pack`);
  return parts.join(' · ');
}

export function customSku(spec: CustomSpec): string {
  return `CUSTOM-${trim(spec.width)}X${trim(spec.height)}X${trim(spec.depth)}-M${spec.mervRating}-${spec.packQuantity}PK`;
}

const toCents = (n: number) => Math.round(n * 100) / 100;

/** Checks a spec against the rules and returns it normalized. */
export function validateSpec(spec: CustomSpec, cfg: CustomFilterConfig): CustomSpec {
  const bad = (msg: string): never => {
    throw new BadRequestException(msg);
  };
  if (!cfg.enabled) bad('Custom size ordering is not available right now.');
  const dims: [string, number][] = [
    ['Width', spec.width],
    ['Height', spec.height],
  ];
  for (const [name, v] of dims) {
    if (!isNum(v)) bad(`${name} must be a number.`);
    if (v < cfg.minDimension || v > cfg.maxDimension) {
      bad(`${name} must be between ${cfg.minDimension}" and ${cfg.maxDimension}".`);
    }
    const steps = v / cfg.step;
    if (Math.abs(steps - Math.round(steps)) > 1e-9) {
      bad(`${name} must be in steps of ${cfg.step}" (for example 20, 20.125, 20.25).`);
    }
  }
  if (Math.min(spec.width, spec.height) > cfg.maxShortSide) {
    bad(`The shorter side can be at most ${cfg.maxShortSide}" (the longer side up to ${cfg.maxDimension}").`);
  }
  if (!cfg.depths.includes(spec.depth)) bad(`Depth must be one of: ${cfg.depths.map((d) => `${d}"`).join(', ')}.`);
  if (!cfg.mervRatings.includes(spec.mervRating)) bad(`MERV rating must be one of: ${cfg.mervRatings.join(', ')}.`);
  if (!cfg.packs.some((p) => p.quantity === spec.packQuantity)) {
    bad(`Pack size must be one of: ${cfg.packs.map((p) => p.quantity).join(', ')}.`);
  }
  return spec;
}

export interface CustomQuote {
  spec: CustomSpec;
  key: string;
  label: string;
  sku: string;
  sizeLabel: string;
  /** Price for one filter before the pack discount. */
  perFilter: number;
  /** Price for one pack (what a cart line's unit price is). */
  unitPrice: number;
}

/** Prices a spec. Call validateSpec first. */
export function priceSpec(spec: CustomSpec, cfg: CustomFilterConfig): CustomQuote {
  const d = String(spec.depth);
  const m = String(spec.mervRating);
  const rate = cfg.rates[d][m];
  const pack = cfg.packs.find((p) => p.quantity === spec.packQuantity)!;
  // Per filter: base charge + rate x area, never below the minimum for this depth and MERV.
  const raw = Math.max(cfg.minPrices[d]?.[m] ?? 0, (cfg.baseCharge[d]?.[m] ?? 0) + spec.width * spec.height * rate);
  const unitPrice = toCents(raw * pack.discount * spec.packQuantity);
  return {
    spec,
    key: customKey(spec),
    label: customLabel(spec),
    sku: customSku(spec),
    sizeLabel: customSizeLabel(spec),
    perFilter: toCents(unitPrice / spec.packQuantity),
    unitPrice,
  };
}
