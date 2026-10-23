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
  minDimension: number;
  maxDimension: number;
  /** Dimensions must be a multiple of this (inches). */
  step: number;
  depths: number[];
  mervRatings: number[];
  /** Dollars per square inch, per filter: rates[depth][merv]. */
  rates: Record<string, Record<string, number>>;
  /** Floor price per filter before pack discounts. */
  minUnitPrice: number;
  packs: CustomPack[];
  leadTimeNote: string;
}

export const MAX_CUSTOM_QTY = 99;

/** Name shown for made-to-order lines in carts, orders and Stripe. */
export const CUSTOM_PRODUCT_NAME = 'Custom Size Air Filter';

/**
 * Starting prices: the catalog's per-filter price curve with a made-to-order
 * premium. These are placeholders for the admin to review in Settings.
 */
export const DEFAULT_CUSTOM_FILTER_CONFIG: CustomFilterConfig = {
  enabled: true,
  minDimension: 6,
  maxDimension: 36,
  step: 0.125,
  depths: [1, 2, 4],
  mervRatings: [11, 13],
  rates: {
    '1': { '11': 0.0248, '13': 0.0315 },
    '2': { '11': 0.0405, '13': 0.0495 },
    '4': { '11': 0.0825, '13': 0.0975 },
  },
  minUnitPrice: 8.99,
  packs: [
    { quantity: 1, discount: 1 },
    { quantity: 4, discount: 0.97 },
    { quantity: 6, discount: 0.95 },
    { quantity: 12, discount: 0.88 },
  ],
  leadTimeNote: 'Made to order. Ships in 5–7 business days.',
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
    for (const k of ['minDimension', 'maxDimension', 'step', 'minUnitPrice'] as const) wrong(k, isNum(src[k]));
    wrong('depths', Array.isArray(src.depths) && src.depths.every(isNum));
    wrong('mervRatings', Array.isArray(src.mervRatings) && src.mervRatings.every(isNum));
    wrong('rates', !!src.rates && typeof src.rates === 'object');
    wrong('packs', Array.isArray(src.packs) && src.packs.every((p) => p && isNum(p.quantity) && isNum(p.discount)));
    wrong('leadTimeNote', typeof src.leadTimeNote === 'string');
  }

  const cfg: CustomFilterConfig = {
    enabled: typeof src.enabled === 'boolean' ? src.enabled : base.enabled,
    minDimension: isNum(src.minDimension) ? src.minDimension : base.minDimension,
    maxDimension: isNum(src.maxDimension) ? src.maxDimension : base.maxDimension,
    step: isNum(src.step) ? src.step : base.step,
    depths: Array.isArray(src.depths) ? src.depths.filter(isNum) : base.depths,
    mervRatings: Array.isArray(src.mervRatings) ? src.mervRatings.filter(isNum) : base.mervRatings,
    rates: src.rates && typeof src.rates === 'object' ? (src.rates as CustomFilterConfig['rates']) : base.rates,
    minUnitPrice: isNum(src.minUnitPrice) ? src.minUnitPrice : base.minUnitPrice,
    packs: Array.isArray(src.packs)
      ? src.packs.filter((p) => p && isNum(p.quantity) && isNum(p.discount))
      : base.packs,
    leadTimeNote: typeof src.leadTimeNote === 'string' ? src.leadTimeNote.slice(0, 200) : base.leadTimeNote,
  };

  // Validation errors only matter when an admin is saving; stored data that is
  // somehow invalid falls back to defaults so the storefront keeps working.
  const problems: string[] = [];
  if (cfg.minDimension <= 0 || cfg.maxDimension <= cfg.minDimension) problems.push('Dimension limits are invalid.');
  if (cfg.step <= 0 || cfg.step > 1) problems.push('Dimension step must be between 0 and 1 inch.');
  if (!cfg.depths.length || cfg.depths.some((d) => d <= 0)) problems.push('Add at least one valid depth.');
  if (!cfg.mervRatings.length || cfg.mervRatings.some((m) => !Number.isInteger(m) || m < 1 || m > 16)) {
    problems.push('MERV ratings must be whole numbers from 1 to 16.');
  }
  if (cfg.minUnitPrice < 0) problems.push('Minimum price cannot be negative.');
  if (!cfg.packs.length || cfg.packs.some((p) => !Number.isInteger(p.quantity) || p.quantity < 1 || p.discount <= 0 || p.discount > 1)) {
    problems.push('Packs need a whole quantity and a discount multiplier above 0 and up to 1.');
  }
  if (new Set(cfg.packs.map((p) => p.quantity)).size !== cfg.packs.length) problems.push('Pack quantities must be unique.');
  for (const d of cfg.depths) {
    for (const m of cfg.mervRatings) {
      const rate = cfg.rates?.[String(d)]?.[String(m)];
      if (!isNum(rate) || rate <= 0) problems.push(`Set a price rate for ${d}" depth, MERV ${m}.`);
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

/** Whole dollars plus .99, like the catalog prices. */
const to99 = (n: number) => Math.max(0.99, Math.floor(n) + 0.99);

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
  const rate = cfg.rates[String(spec.depth)][String(spec.mervRating)];
  const pack = cfg.packs.find((p) => p.quantity === spec.packQuantity)!;
  const raw = Math.max(cfg.minUnitPrice, spec.width * spec.height * rate);
  const unitPrice = to99(raw * spec.packQuantity * pack.discount);
  return {
    spec,
    key: customKey(spec),
    label: customLabel(spec),
    sku: customSku(spec),
    sizeLabel: customSizeLabel(spec),
    perFilter: Math.round((unitPrice / spec.packQuantity) * 100) / 100,
    unitPrice,
  };
}
