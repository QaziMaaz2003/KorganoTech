import { computeTotals, D } from './money.js';

const settings = { shippingFee: D('9.99'), freeShippingThreshold: D(75), taxRate: D('0.0725') };

describe('computeTotals', () => {
  it('charges shipping below the free-shipping threshold', () => {
    const t = computeTotals(D('40.00'), settings);
    expect(t.shippingFee.toNumber()).toBe(9.99);
    expect(t.tax.toNumber()).toBe(2.9);
    expect(t.total.toNumber()).toBe(52.89);
    expect(t.freeShippingRemaining?.toNumber()).toBe(35);
  });

  it('ships free at or above the threshold', () => {
    const t = computeTotals(D('75.00'), settings);
    expect(t.shippingFee.toNumber()).toBe(0);
    expect(t.freeShippingRemaining).toBeNull();
  });

  it('charges nothing for an empty cart', () => {
    expect(computeTotals(D(0), settings).total.toNumber()).toBe(0);
  });

  it('avoids float drift', () => {
    const t = computeTotals(D('0.1').add(D('0.2')), { ...settings, taxRate: D(0) });
    expect(t.subtotal.toString()).toBe('0.3');
  });
});
