import { parseOrderNumber, parseSize, slugify, variantLabel } from './format.js';
import { defaultActualSize } from '../../admin/admin-products.service.js';
import { ORDER_TRANSITIONS } from '../../orders/order-status.js';

describe('format helpers', () => {
  it('parses nominal sizes', () => {
    expect(parseSize('16x25x1')).toEqual({ width: 16, height: 25, depth: 1 });
    expect(parseSize('17.5 x 23.5 x 1')).toEqual({ width: 17.5, height: 23.5, depth: 1 });
    expect(parseSize('Canister')).toBeNull();
  });

  it('derives actual size from nominal', () => {
    expect(defaultActualSize('16x25x1')).toBe('15.5 x 24.5 x 0.75');
    expect(defaultActualSize('20x25x4')).toBe('19.5 x 24.5 x 3.75');
  });

  it('labels variants', () => {
    expect(variantLabel({ size: '16x25x1', mervRating: 11, packQuantity: 6 })).toBe(
      '16x25x1 · MERV 11 · 6-pack',
    );
    expect(variantLabel({ size: 'Standard', mervRating: null, packQuantity: 1 })).toBe('Standard');
  });

  it('round-trips order numbers', () => {
    expect(parseOrderNumber('KT-100001')).toBe(100001);
    expect(parseOrderNumber('100002')).toBe(100002);
    expect(Number.isNaN(parseOrderNumber('abc'))).toBe(true);
  });

  it('slugifies names', () => {
    expect(slugify('Pleated HVAC Air Filter (1")')).toBe('pleated-hvac-air-filter-1');
  });
});

describe('order transitions', () => {
  it('never leaves a terminal state', () => {
    expect(ORDER_TRANSITIONS.DELIVERED).toEqual([]);
    expect(ORDER_TRANSITIONS.CANCELLED).toEqual([]);
  });
  it('cannot cancel once shipped', () => {
    expect(ORDER_TRANSITIONS.SHIPPED).not.toContain('CANCELLED');
  });
});
