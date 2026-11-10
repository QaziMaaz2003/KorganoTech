import ExcelJS from 'exceljs';

/**
 * The standard customer order sheet KorganoTech fills in for each recurring customer:
 *
 *   Customer name | Pleasanton
 *   School | Building | Filter size | Nominal or Exact | MERV rating | Quantity | Price/filter | Total price
 *
 * Quantity is a number of filters. Price/filter is the agreed price for one filter.
 * Total price is just quantity x price and is recalculated, never read back.
 */

export type SizeType = 'NOMINAL' | 'EXACT';

export interface SheetLine {
  /** Where it is used, e.g. "Amadore - Building 1". */
  label: string | null;
  width: number;
  height: number;
  depth: number;
  mervRating: number;
  sizeType: SizeType;
  quantity: number;
  unitPrice: number | null;
}

export interface ParsedSheet {
  customerName: string | null;
  lines: (SheetLine & { row: number })[];
  errors: { row: number; message: string }[];
  warnings: { row: number; message: string }[];
}

export const SHEET_HEADERS = [
  'School',
  'Building',
  'Filter size',
  'Nominal or Exact',
  'MERV rating',
  'Quantity',
  'Price/filter',
  'Total price',
] as const;

/** Stable identity of a line: the same size, MERV and size type at the same place. */
export const lineKey = (l: Pick<SheetLine, 'width' | 'height' | 'depth' | 'mervRating' | 'sizeType'>) =>
  `${l.width}x${l.height}x${l.depth}-M${l.mervRating}-${l.sizeType === 'EXACT' ? 'E' : 'N'}`;

/** "12 x 16 x 1" */
export const sizeLabel = (l: Pick<SheetLine, 'width' | 'height' | 'depth'>) =>
  `${l.width} x ${l.height} x ${l.depth}`;

/** Actual dimensions: a nominal filter is 1/2" smaller each way and 1/4" thinner; an exact one is as given. */
export function actualSize(l: Pick<SheetLine, 'width' | 'height' | 'depth' | 'sizeType'>): string {
  if (l.sizeType === 'EXACT') return sizeLabel(l);
  return `${trim(l.width - 0.5)} x ${trim(l.height - 0.5)} x ${trim(l.depth - 0.25)}`;
}

const trim = (n: number) => String(Number(n.toFixed(3)));

function cellText(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') {
    if ('result' in v && v.result !== undefined && v.result !== null) return cellText(v.result as ExcelJS.CellValue);
    if ('richText' in v) return v.richText.map((t) => t.text).join('').trim();
    if ('text' in v && typeof v.text === 'string') return v.text.trim();
  }
  return '';
}

const num = (s: string): number | null => {
  const cleaned = s.replace(/[$,\s]/g, '');
  if (cleaned === '' || !/^-?\d*\.?\d+$/.test(cleaned)) return null;
  return Number(cleaned);
};

const sizeRe = /^(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)$/i;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

const COLUMN_NAMES: Record<string, string[]> = {
  school: ['school'],
  building: ['building'],
  size: ['filtersize', 'size'],
  type: ['nominalorexact', 'nominalexact', 'type'],
  merv: ['mervrating', 'merv'],
  quantity: ['quantity', 'qty'],
  price: ['pricefilter', 'priceperfilter', 'price'],
};

export function labelFor(school: string, building: string): string | null {
  const s = school.trim();
  const b = building.trim();
  if (s && b) return /^\d+$/.test(b) ? `${s} - Building ${b}` : `${s} - ${b}`;
  return s || (b ? (/^\d+$/.test(b) ? `Building ${b}` : b) : null);
}

export async function parseBusinessSheet(buffer: Buffer | ArrayBuffer): Promise<ParsedSheet> {
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.load(buffer as ExcelJS.Buffer);
  } catch {
    throw new Error('That file could not be read. Please upload an Excel (.xlsx) file.');
  }
  const ws = wb.worksheets[0];
  if (!ws) throw new Error('The workbook has no sheets.');

  const result: ParsedSheet = { customerName: null, lines: [], errors: [], warnings: [] };

  // Find the header row (the one that has "Filter size") and the customer name above it.
  let headerRow = -1;
  const cols: Partial<Record<keyof typeof COLUMN_NAMES, number>> = {};
  const maxScan = Math.min(ws.rowCount, 30);
  for (let r = 1; r <= maxScan; r++) {
    const row = ws.getRow(r);
    const sparse: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell, c) => {
      sparse[c] = cellText(cell.value);
    });
    const texts = Array.from(sparse, (t) => t ?? '');
    const at = texts.findIndex((t) => norm(t) === 'customername');
    if (at >= 0) {
      const name = texts.slice(at + 1).find((t) => t);
      if (name) result.customerName = name;
    }
    const matched: typeof cols = {};
    texts.forEach((t, c) => {
      for (const [key, names] of Object.entries(COLUMN_NAMES)) {
        if (names.includes(norm(t)) && matched[key as keyof typeof COLUMN_NAMES] === undefined) {
          matched[key as keyof typeof COLUMN_NAMES] = c;
        }
      }
    });
    if (matched.size !== undefined && matched.quantity !== undefined) {
      headerRow = r;
      Object.assign(cols, matched);
      break;
    }
  }
  if (headerRow < 0) {
    throw new Error(
      'Could not find the header row. The sheet needs the columns: School, Building, Filter size, Nominal or Exact, MERV rating, Quantity, Price/filter.',
    );
  }

  const get = (row: ExcelJS.Row, key: keyof typeof COLUMN_NAMES) =>
    cols[key] === undefined ? '' : cellText(row.getCell(cols[key]!).value);

  const byKey = new Map<string, SheetLine & { row: number }>();
  for (let r = headerRow + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const sizeRaw = get(row, 'size');
    const qtyRaw = get(row, 'quantity');
    const schoolRaw = get(row, 'school');
    // Blank rows and free-text notes (no size, no quantity) are ignored.
    if (!sizeRaw && !qtyRaw) continue;
    // A note typed under the table (often a merged cell) has no size and no numeric quantity.
    if (!sizeRe.test(sizeRaw.replace(/\s+/g, ' ').trim()) && num(qtyRaw) === null) continue;
    const fail = (message: string) => result.errors.push({ row: r, message });
    const warn = (message: string) => result.warnings.push({ row: r, message });

    const m = sizeRe.exec(sizeRaw.replace(/\s+/g, ' ').trim());
    if (!m) {
      fail(sizeRaw ? `"${sizeRaw}" is not a size. Use width x height x depth, e.g. 16 x 25 x 1.` : 'Filter size is missing.');
      continue;
    }
    const [width, height, depth] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (width < 1 || width > 200 || height < 1 || height > 200 || depth < 0.25 || depth > 20) {
      fail(`${sizeRaw} is outside the allowed size range.`);
      continue;
    }

    const mervText = get(row, 'merv');
    const merv = num(mervText.replace(/merv/i, ''));
    if (merv === null || !Number.isInteger(merv) || merv < 1 || merv > 16) {
      fail(mervText ? `MERV rating "${mervText}" is not valid.` : 'MERV rating is missing.');
      continue;
    }

    const typeText = get(row, 'type').toLowerCase();
    let sizeType: SizeType = 'NOMINAL';
    if (typeText.startsWith('e')) sizeType = 'EXACT';
    else if (!typeText.startsWith('n')) warn('Nominal or Exact was blank, so it is treated as Nominal.');

    const qty = num(qtyRaw);
    if (qty === null || !Number.isInteger(qty) || qty < 0) {
      fail(qtyRaw ? `Quantity "${qtyRaw}" is not a whole number.` : 'Quantity is missing.');
      continue;
    }
    if (qty === 0) {
      warn('Quantity is 0, so the line was skipped.');
      continue;
    }
    if (qty > 100000) {
      fail('Quantity is too large.');
      continue;
    }

    const priceText = get(row, 'price');
    const price = priceText === '' ? null : num(priceText);
    if (priceText !== '' && (price === null || price < 0 || price > 100000)) {
      fail(`Price/filter "${priceText}" is not a valid amount.`);
      continue;
    }
    if (price === null) warn('No price per filter, so this line cannot be ordered until a price is added.');

    const line: SheetLine & { row: number } = {
      row: r,
      label: labelFor(schoolRaw, get(row, 'building')),
      width,
      height,
      depth,
      mervRating: merv,
      sizeType,
      quantity: qty,
      unitPrice: price === null ? null : Math.round(price * 100) / 100,
    };
    const key = `${line.label ?? ''}|${lineKey(line)}`;
    const dup = byKey.get(key);
    if (dup) {
      warn(`Same filter and place as row ${dup.row}: quantities were added together.`);
      dup.quantity += line.quantity;
      if (line.unitPrice !== null) dup.unitPrice = line.unitPrice;
    } else {
      byKey.set(key, line);
    }
  }
  result.lines = [...byKey.values()];
  if (!result.lines.length && !result.errors.length) {
    result.warnings.push({ row: headerRow, message: 'The sheet has no filter lines.' });
  }
  return result;
}

export interface ExportLine extends SheetLine {
  school: string;
  building: string;
}

/** Builds the standard sheet, filled with a business's current list (or empty with two example rows). */
export async function buildBusinessSheet(
  customerName: string,
  lines: ExportLine[],
  withExamples = false,
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'KorganoTech';
  const ws = wb.addWorksheet('Order list');
  ws.addRow(['Customer name', customerName]);
  ws.getRow(1).font = { bold: true };
  const header = ws.addRow([...SHEET_HEADERS]);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B3FA6' } };

  const rows: ExportLine[] = withExamples
    ? [
        { school: 'School name', building: '1', label: null, width: 12, height: 16, depth: 1, mervRating: 11, sizeType: 'NOMINAL', quantity: 10, unitPrice: 12 },
        { school: 'School name', building: '3', label: null, width: 12, height: 20, depth: 2, mervRating: 13, sizeType: 'EXACT', quantity: 55, unitPrice: 16.5 },
      ]
    : lines;
  rows.forEach((l, i) => {
    const r = ws.addRow([
      l.school,
      l.building,
      sizeLabel(l),
      l.sizeType === 'EXACT' ? 'Exact' : 'Nominal',
      `MERV ${l.mervRating}`,
      l.quantity,
      l.unitPrice,
      null,
    ]);
    const n = i + 3;
    r.getCell(8).value = { formula: `IF(AND(ISNUMBER(F${n}),ISNUMBER(G${n})),F${n}*G${n},"")`, result: l.unitPrice === null ? undefined : Math.round(l.quantity * l.unitPrice * 100) / 100 };
    r.getCell(7).numFmt = '"$"#,##0.00';
    r.getCell(8).numFmt = '"$"#,##0.00';
  });
  if (withExamples) {
    ws.addRow([]);
    ws.addRow(['', 'Replace the example rows with the customer’s filters. Quantity is a number of filters; Price/filter is the agreed price for one filter. Total price is calculated.']);
  }
  [22, 14, 16, 18, 14, 11, 14, 14].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  ws.views = [{ state: 'frozen', ySplit: 2 }];
  return Buffer.from(await wb.xlsx.writeBuffer());
}
