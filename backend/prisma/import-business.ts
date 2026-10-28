/**
 * Loads a customer's saved filter list (the client's "customer filter list" workbook) into one
 * business account, with each school / building as the label of its lines.
 *
 * The workbook is converted to prisma/data/source/customer-lines.json first (that folder is
 * gitignored: it holds customer data and never goes to GitHub). Then:
 *
 *   npm run db:import-business -- --name "District name" [--replace]
 *
 * How lines are mapped:
 * - A size in the 43 standard sizes becomes a catalog filter (MERV 11 unless --merv 13).
 * - Any other size becomes an exact (custom) size, if it fits the custom-size rules.
 * - The sheet gives a count of filters; the account stores packs. Counts divisible by 6 become
 *   6-packs, then by 4 become 4-packs, otherwise 2-packs; an odd count rounds up to the next pack of 2.
 * - Lines with no size, no quantity, or a size we cannot make are skipped and reported.
 *
 * A report of every defaulted, rounded, custom or skipped line is written next to the source file.
 * Writing to the live Supabase database needs CONFIRM_PRODUCTION=yes.
 */
import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../src/generated/prisma/client.js';
import {
  customKey,
  DEFAULT_CUSTOM_FILTER_CONFIG,
  validateSpec,
  type CustomSpec,
} from '../src/custom-filters/custom-filter.config.js';

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(here, 'data', 'source');

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string, fallback: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const businessName = opt('name', 'School district (rename in Admin)');
const merv = Number(opt('merv', '11'));

const url = process.env.DATABASE_URL ?? '';
const host = (() => {
  try {
    return new URL(url).host;
  } catch {
    return '(invalid DATABASE_URL)';
  }
})();
if (/supabase/i.test(host) && process.env.CONFIRM_PRODUCTION !== 'yes') {
  console.error(`Refusing to write to ${host} without CONFIRM_PRODUCTION=yes.`);
  process.exit(1);
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: url,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  }),
});

interface SourceLine {
  building: string | null;
  size: string;
  qty: number;
}
interface Source {
  customers: { name: string; lines: SourceLine[] }[];
}

/** A count of filters as packs of 6, 4 or 2 (odd counts round up to the next even number). */
export function toPacks(count: number): { pack: 2 | 4 | 6; packs: number; roundedUp: boolean } {
  if (count % 6 === 0) return { pack: 6, packs: count / 6, roundedUp: false };
  if (count % 4 === 0) return { pack: 4, packs: count / 4, roundedUp: false };
  if (count % 2 === 0) return { pack: 2, packs: count / 2, roundedUp: false };
  return { pack: 2, packs: (count + 1) / 2, roundedUp: true };
}

const sizeRe = /^(\d+(?:\.\d+)?)X(\d+(?:\.\d+)?)X(\d+(?:\.\d+)?)$/;

async function main() {
  console.log(`Target database: ${host}`);
  const source: Source = JSON.parse(readFileSync(join(SOURCE, 'customer-lines.json'), 'utf8'));

  const variants = await prisma.productVariant.findMany({
    where: { product: { category: { slug: 'hvac' }, status: 'ACTIVE' }, mervRating: merv },
    select: { id: true, size: true, packQuantity: true },
  });
  if (!variants.length) throw new Error('No HVAC catalog found. Run `npm run db:import-catalog` first.');
  const variantFor = new Map(variants.map((v) => [`${v.size}|${v.packQuantity}`, v.id]));
  const standardSizes = new Set(variants.map((v) => v.size));
  const customCfg = DEFAULT_CUSTOM_FILTER_CONFIG;

  type Row = { label: string; variantId?: string; spec?: CustomSpec; packs: number };
  const out: Row[] = [];
  const report: string[] = [];
  const merged = new Map<string, { label: string; size: string; qty: number }>();
  const counts = { standard: 0, custom: 0, rounded: 0, skipped: 0 };

  for (const customer of source.customers) {
    const school = customer.name.trim();
    for (const line of customer.lines) {
      const where = `${school}${line.building ? ` / ${line.building}` : ''}`;
      const label = line.building ? `${school} - ${line.building.trim()}` : school;
      if (!line.size) {
        counts.skipped += 1;
        report.push(`SKIPPED   ${where}: quantity ${line.qty} but no filter size`);
        continue;
      }
      if (!(line.qty > 0)) {
        counts.skipped += 1;
        report.push(`SKIPPED   ${where}: ${line.size} has quantity 0`);
        continue;
      }
      const key = `${label}|${line.size}`;
      const prev = merged.get(key);
      if (prev) prev.qty += line.qty;
      else merged.set(key, { label, size: line.size, qty: line.qty });
    }
  }

  for (const { label, size, qty } of merged.values()) {
    const m = sizeRe.exec(size);
    if (!m) {
      counts.skipped += 1;
      report.push(`SKIPPED   ${label}: "${size}" is not a size`);
      continue;
    }
    const [w, h, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const normalized = `${w}x${h}x${d}`;
    const { pack, packs, roundedUp } = toPacks(qty);
    if (roundedUp) {
      counts.rounded += 1;
      report.push(`ROUNDED   ${label}: ${normalized} needs ${qty} filters, odd count, listed as ${packs} x ${pack}-pack (${packs * pack} filters)`);
    }
    if (standardSizes.has(normalized)) {
      const variantId = variantFor.get(`${normalized}|${pack}`);
      if (!variantId) {
        counts.skipped += 1;
        report.push(`SKIPPED   ${label}: no ${pack}-pack variant for ${normalized}`);
        continue;
      }
      counts.standard += 1;
      out.push({ label, variantId, packs });
      continue;
    }
    const spec: CustomSpec = { width: w, height: h, depth: d, mervRating: merv, packQuantity: pack };
    try {
      validateSpec(spec, customCfg);
    } catch (e) {
      counts.skipped += 1;
      report.push(`SKIPPED   ${label}: ${normalized} cannot be made as a custom size (${(e as Error).message})`);
      continue;
    }
    counts.custom += 1;
    report.push(`CUSTOM    ${label}: ${normalized} is not a standard size, listed as an exact custom size (${packs} x ${pack}-pack, MERV ${merv})`);
    out.push({ label, spec, packs });
  }

  report.unshift(
    `Business: ${businessName}`,
    `MERV defaulted to ${merv} for every line (the sheet has no MERV column).`,
    `${counts.standard} standard lines, ${counts.custom} exact custom-size lines, ${counts.rounded} rounded up, ${counts.skipped} skipped.`,
    '',
  );
  writeFileSync(join(SOURCE, 'import-report.txt'), report.join('\n') + '\n', 'utf8');
  console.log(report.slice(0, 4).join('\n'));
  console.log(`Full report: ${join(SOURCE, 'import-report.txt')}`);

  if (flag('dry-run')) {
    console.log('Dry run: nothing written.');
    return;
  }

  let business = await prisma.business.findFirst({ where: { name: businessName } });
  if (business) {
    const existing = await prisma.businessFilter.count({ where: { businessId: business.id } });
    if (existing && !flag('replace')) {
      throw new Error(`"${businessName}" already has ${existing} filters. Use --replace to rebuild its list.`);
    }
    if (existing) await prisma.businessFilter.deleteMany({ where: { businessId: business.id } });
  } else {
    business = await prisma.business.create({
      data: {
        name: businessName,
        notes:
          'Filter list imported from the customer filter list workbook. MERV was not in the sheet, so every line is MERV ' +
          `${merv}. Counts of filters were converted to packs (6, then 4, then 2). Check with the customer before ordering.`,
      },
    });
  }

  await prisma.businessFilter.createMany({
    data: out.map((r, i) => ({
      businessId: business.id,
      label: r.label,
      variantId: r.variantId ?? null,
      customKey: r.spec ? customKey(r.spec) : null,
      customSpec: r.spec ? (r.spec as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
      quantity: r.packs,
      sortOrder: i,
    })),
  });
  console.log(`Done. "${businessName}" now lists ${out.length} filters.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
