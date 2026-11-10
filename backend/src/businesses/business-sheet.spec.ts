import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import {
  actualSize,
  buildBusinessSheet,
  labelFor,
  lineKey,
  parseBusinessSheet,
  type ExportLine,
} from './business-sheet.js';

/** Builds a workbook laid out exactly like the client's "customer order info" sample. */
async function clientSheet(rows: (string | number | null)[][], customer = 'Pleasanton') {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  ws.addRow(['Customer name ', customer]);
  ws.addRow(['School', 'Building', 'Filter size', 'Nominal or Exact', 'MERV rating', 'Quantity', 'Price/filter', 'Total price']);
  rows.forEach((r) => ws.addRow(r));
  return Buffer.from(await wb.xlsx.writeBuffer());
}

describe('reading the standard order sheet', () => {
  it("reads the client's sample rows", async () => {
    const parsed = await parseBusinessSheet(
      await clientSheet([
        ['Amadore', 1, '12 x 16 x 1', 'Nominal', 'MERV 11', 10, 12, 120],
        ['Amadore', 3, '12 x 20 x 2', 'Exact', 'MERV 13', 55, 16.5, 907.5],
      ]),
    );
    expect(parsed.errors).toEqual([]);
    expect(parsed.customerName).toBe('Pleasanton');
    expect(parsed.lines).toHaveLength(2);
    expect(parsed.lines[0]).toMatchObject({
      label: 'Amadore - Building 1',
      width: 12,
      height: 16,
      depth: 1,
      mervRating: 11,
      sizeType: 'NOMINAL',
      quantity: 10,
      unitPrice: 12,
    });
    expect(parsed.lines[1]).toMatchObject({ sizeType: 'EXACT', mervRating: 13, quantity: 55, unitPrice: 16.5 });
  });

  it('ignores free-text notes and blank rows', async () => {
    const parsed = await parseBusinessSheet(
      await clientSheet([
        ['A', 1, '10x20x1', 'Nominal', 11, 4, 9.5, null],
        [null, 'Idea is to open this generic file by KorganoTech and add customer order information', null, null, null, null, null, null],
        [],
      ]),
    );
    expect(parsed.errors).toEqual([]);
    expect(parsed.lines).toHaveLength(1);
  });

  it('accepts sizes written several ways and MERV as plain numbers', async () => {
    const parsed = await parseBusinessSheet(
      await clientSheet([
        ['S', 'Gym', '16X25X1', 'nominal', 13, 2, 14, null],
        ['S', 'Gym', '15.5 × 19.5 × 1.75', 'Exact', 'merv 11', 3, '$13.50', null],
      ]),
    );
    expect(parsed.errors).toEqual([]);
    expect(parsed.lines[0]).toMatchObject({ width: 16, height: 25, depth: 1, label: 'S - Gym' });
    expect(parsed.lines[1]).toMatchObject({ width: 15.5, height: 19.5, depth: 1.75, unitPrice: 13.5 });
  });

  it('reports a clear error per bad row and keeps the good ones', async () => {
    const parsed = await parseBusinessSheet(
      await clientSheet([
        ['A', 1, 'big filter', 'Nominal', 11, 4, 9, null],
        ['A', 1, '10x20x1', 'Nominal', 'MERV x', 4, 9, null],
        ['A', 1, '10x20x1', 'Nominal', 11, 'lots', 9, null],
        ['A', 1, '10x20x1', 'Nominal', 11, 4, 'free', null],
        ['A', 2, '12x12x1', 'Nominal', 11, 4, 9, null],
      ]),
    );
    expect(parsed.errors.map((e) => e.row)).toEqual([3, 4, 5, 6]);
    expect(parsed.errors[0].message).toMatch(/not a size/);
    expect(parsed.errors[1].message).toMatch(/MERV/);
    expect(parsed.errors[2].message).toMatch(/whole number/);
    expect(parsed.errors[3].message).toMatch(/Price/);
    expect(parsed.lines).toHaveLength(1);
  });

  it('skips zero quantities, warns about missing prices and combines duplicates', async () => {
    const parsed = await parseBusinessSheet(
      await clientSheet([
        ['A', 1, '10x20x1', 'Nominal', 11, 0, 9, null],
        ['A', 1, '12x12x1', 'Nominal', 11, 4, null, null],
        ['A', 1, '14x14x1', 'Nominal', 11, 2, 9, null],
        ['A', 1, '14x14x1', 'Nominal', 11, 3, 10, null],
      ]),
    );
    expect(parsed.errors).toEqual([]);
    expect(parsed.lines).toHaveLength(2);
    expect(parsed.lines[0].unitPrice).toBeNull();
    expect(parsed.lines[1]).toMatchObject({ quantity: 5, unitPrice: 10 });
    expect(parsed.warnings.map((w) => w.message).join(' ')).toMatch(/Quantity is 0/);
    expect(parsed.warnings.map((w) => w.message).join(' ')).toMatch(/No price/);
    expect(parsed.warnings.map((w) => w.message).join(' ')).toMatch(/added together/);
  });

  it('refuses a file without the header row or that is not a workbook', async () => {
    const wb = new ExcelJS.Workbook();
    wb.addWorksheet('x').addRow(['hello', 'world']);
    await expect(parseBusinessSheet(Buffer.from(await wb.xlsx.writeBuffer()))).rejects.toThrow(/header row/);
    await expect(parseBusinessSheet(Buffer.from('not an excel file'))).rejects.toThrow(/could not be read/);
  });
});

describe('writing the standard order sheet', () => {
  it('round-trips a list through export and import', async () => {
    const lines: ExportLine[] = [
      { school: 'Foothill', building: 'A', label: 'Foothill - A', width: 16, height: 20, depth: 2, mervRating: 13, sizeType: 'NOMINAL', quantity: 13, unitPrice: 17.25 },
      { school: 'Foothill', building: '2', label: 'Foothill - Building 2', width: 12, height: 14, depth: 1, mervRating: 11, sizeType: 'EXACT', quantity: 4, unitPrice: null },
    ];
    const parsed = await parseBusinessSheet(await buildBusinessSheet('Pleasanton', lines));
    expect(parsed.customerName).toBe('Pleasanton');
    expect(parsed.errors).toEqual([]);
    expect(parsed.lines.map((l) => [l.label, lineKey(l), l.quantity, l.unitPrice])).toEqual([
      ['Foothill - A', '16x20x2-M13-N', 13, 17.25],
      ['Foothill - Building 2', '12x14x1-M11-E', 4, null],
    ]);
  });

  it('the blank template is itself a valid sheet', async () => {
    const parsed = await parseBusinessSheet(await buildBusinessSheet('Customer name', [], true));
    expect(parsed.errors).toEqual([]);
    expect(parsed.lines).toHaveLength(2);
  });
});

describe('sheet helpers', () => {
  it('labels a school and building', () => {
    expect(labelFor('Amadore', '1')).toBe('Amadore - Building 1');
    expect(labelFor('Amadore', 'Large Gym')).toBe('Amadore - Large Gym');
    expect(labelFor('Amadore', '')).toBe('Amadore');
    expect(labelFor('', '')).toBeNull();
  });

  it('works out the actual size from the nominal size', () => {
    // The client's rule: 1/2" smaller each way, 1/4" thinner.
    expect(actualSize({ width: 16, height: 20, depth: 2, sizeType: 'NOMINAL' })).toBe('15.5 x 19.5 x 1.75');
    expect(actualSize({ width: 16, height: 20, depth: 2, sizeType: 'EXACT' })).toBe('16 x 20 x 2');
  });
});
