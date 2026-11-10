/**
 * Loads the client's real HVAC catalog (prisma/data/catalog.json, taken from the
 * "Prices List" workbook): 43 standard sizes x MERV 11 / MERV 13 = 86 products,
 * each sold in 2-, 4- and 6-packs.
 *
 * - Uploads the supplied product images (prisma/data/source/*.png) to Cloudinary.
 * - Upserts products and variants by slug / SKU, so it is safe to re-run. Re-running
 *   refreshes prices and copy but never replaces photos an admin has added.
 * - Archives the three old placeholder HVAC products (kept so old orders still link).
 * - Applies the store settings from the client's answers (free shipping over $50,
 *   phone number, custom-filter rules back to the code defaults).
 *
 * Run:  npm run db:import-catalog
 * Writing to the live Supabase database needs CONFIRM_PRODUCTION=yes.
 */
import 'dotenv/config';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { v2 as cloudinary } from 'cloudinary';
import { Prisma, PrismaClient } from '../src/generated/prisma/client.js';

const here = dirname(fileURLToPath(import.meta.url));
const url = process.env.DATABASE_URL ?? '';
const host = (() => {
  try {
    return new URL(url).host;
  } catch {
    return '(invalid DATABASE_URL)';
  }
})();
if (/supabase/i.test(host) && process.env.CONFIRM_PRODUCTION !== 'yes') {
  console.error(
    `Refusing to write to ${host} without CONFIRM_PRODUCTION=yes. Point DATABASE_URL at a test database or confirm explicitly.`,
  );
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: url,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  }),
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ─── Data ────────────────────────────────────────────────────────────────────

interface Row {
  size: string;
  width: number;
  height: number;
  depth: number;
  merv: 11 | 13;
  price2: number;
  price4: number;
  price6: number;
}
const rows: Row[] = JSON.parse(readFileSync(join(here, 'data', 'catalog.json'), 'utf8'));
const PACKS = [
  { qty: 2, key: 'price2' },
  { qty: 4, key: 'price4' },
  { qty: 6, key: 'price6' },
] as const;

const OLD_PLACEHOLDER_SLUGS = [
  'pleated-hvac-air-filter-1-inch',
  'pleated-hvac-air-filter-2-inch',
  'deep-pleat-hvac-air-filter-4-inch',
];

const HVAC_DESCRIPTION =
  'KorganoTech specializes in manufacturing high-performance MERV 11 and MERV 13 air filters using traditional melt blown filtration media and engineered to improve indoor air quality by reducing airborne pollutants and other harmful particulates.\n\nDesigned with a pleated construction to contribute to a cleaner and fresher indoor environment. Suitable for use in furnaces, air conditioners, heating systems, or HVAC systems.\n\nKorganoTech is a registered U.S. trademark # 7565070.';

const MERV_COPY = {
  11: {
    short:
      'Pleated air filter that captures household dust, pollen, pet dander and mold spores. A good everyday choice for most homes and offices.',
    features: [
      'MERV 11 advanced home filtration',
      'Helps capture household dust, pollen, mold spores, pet dander, dust mites and smoke particles',
      'A smart balance of filtration and airflow',
      'Traditional melt blown filtration media with pleated construction',
      'Suitable for furnaces, air conditioners, heating systems or HVAC systems',
    ],
    efficiency: [
      ['Capture efficiency, 3.0-10.0 µm', '85%+'],
      ['Capture efficiency, 1.0-3.0 µm', '65-80%'],
      ['Capture efficiency, 0.3-1.0 µm', '20-35%'],
    ],
  },
  13: {
    short:
      'Higher-efficiency pleated filter that also captures fine particles such as smoke and some bacteria. Recommended for allergy-sensitive homes and better indoor air quality.',
    features: [
      'MERV 13 high-efficiency home filtration',
      'Enhanced filtration for finer airborne particles: fine dust, smoke particles, bacteria, mold spores, pet dander and pollen',
      'Recommended for allergy-sensitive homes and better indoor air quality',
      'Traditional melt blown filtration media with pleated construction',
      'Suitable for furnaces, air conditioners, heating systems or HVAC systems',
    ],
    efficiency: [
      ['Capture efficiency, 3.0-10.0 µm', '90%+'],
      ['Capture efficiency, 1.0-3.0 µm', '85%+'],
      ['Capture efficiency, 0.3-1.0 µm', '50%+'],
    ],
  },
} as const;

const REPLACEMENT: Record<number, string> = {
  1: 'Every 1-3 months',
  2: 'Every 3-6 months',
  4: 'Every 6-12 months',
};

const sku = (r: Row, pack: number) => `KT-${r.width}${r.height}${r.depth}-M${r.merv}-${pack}PK`;
const slugOf = (r: Row) => `${r.size}-merv-${r.merv}-pleated-air-filter`;
const cents = (n: number) => Math.round(n * 100) / 100;
/** Actual size per the client: 1/2" smaller in width and length, 1/4" smaller in thickness (16x20x2 -> 15.5 x 19.5 x 1.75). */
const actualSize = (r: Row) => `${r.width - 0.5} x ${r.height - 0.5} x ${r.depth - 0.25}`;

// ─── Images ──────────────────────────────────────────────────────────────────

type Img = { url: string; publicId: string; width: number; height: number };
const IMAGE_FILES = {
  merv11: 'image 3-M11.png',
  merv13: 'image 3-M13.png',
  compare: 'image 1.png',
  install: 'Image- install.png',
} as const;

async function uploadImages(): Promise<Record<keyof typeof IMAGE_FILES, Img>> {
  const out = {} as Record<keyof typeof IMAGE_FILES, Img>;
  for (const [key, file] of Object.entries(IMAGE_FILES) as [keyof typeof IMAGE_FILES, string][]) {
    const path = join(here, 'data', 'source', file);
    if (!existsSync(path)) throw new Error(`Missing image: ${path}`);
    const publicId = `korganotech/catalog/${key}`;
    try {
      const res = await cloudinary.uploader.upload(path, { public_id: publicId, overwrite: true, resource_type: 'image' });
      out[key] = { url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height };
      console.log(`  uploaded ${file} -> ${res.secure_url}`);
    } catch (e) {
      // Re-running when the images are already on Cloudinary: reuse them if the upload itself fails.
      if (process.env.REUSE_UPLOADED_IMAGES !== 'yes') throw e;
      const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}.png`;
      out[key] = { url, publicId, width: 1254, height: 1254 };
      console.log(`  upload failed, reusing ${url}`);
    }
  }
  return out;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Target database: ${host}`);
  console.log('Uploading images to Cloudinary…');
  const img = await uploadImages();

  console.log('Category…');
  const hvac = await prisma.category.findUnique({ where: { slug: 'hvac' } });
  if (!hvac) throw new Error('The "hvac" category does not exist. Run `npm run db:seed` first.');
  await prisma.category.update({
    where: { id: hvac.id },
    data: { imageUrl: img.compare.url, imagePublicId: img.compare.publicId },
  });

  // Pathogen and Environmental are information only: list them after the sellable filters, unfeatured.
  await prisma.product.updateMany({
    where: { category: { slug: { in: ['pathogen', 'environmental'] } } },
    data: { isFeatured: false, badge: null, sortOrder: 1000 },
  });

  console.log('Archiving the old placeholder HVAC products…');
  const archived = await prisma.product.updateMany({
    where: { slug: { in: OLD_PLACEHOLDER_SLUGS } },
    data: { status: 'ARCHIVED' },
  });
  console.log(`  ${archived.count} archived`);

  console.log(`Products and variants (${rows.length} products)…`);
  let n = 0;
  for (const r of rows) {
    n += 1;
    const copy = MERV_COPY[r.merv];
    const name = `${r.size} MERV ${r.merv} Pleated Air Filter`;
    const data = {
      name,
      categoryId: hvac.id,
      shortDescription: copy.short,
      description: `${copy.short}\n\n${HVAC_DESCRIPTION}`,
      features: [...copy.features],
      specs: [
        { label: 'Nominal size', value: r.size },
        { label: 'Depth (nominal)', value: `${r.depth}"` },
        { label: 'MERV rating', value: String(r.merv) },
        { label: 'Construction', value: 'Pleated' },
        { label: 'Filtration media', value: 'Traditional melt blown media' },
        ...copy.efficiency.map(([label, value]) => ({ label, value })),
        { label: 'Suggested replacement', value: REPLACEMENT[r.depth] },
        { label: 'Pack options', value: '2, 4 or 6 filters' },
        { label: 'Use', value: 'Furnaces, air conditioners, heating systems, HVAC systems' },
        { label: 'Trademark', value: 'U.S. registered trademark #7565070' },
      ],
      filterType: 'Pleated',
      status: 'ACTIVE' as const,
      isPurchasable: true,
      isFeatured: false,
      badge: null,
      availabilityNote: null,
      sortOrder: 100 + n,
    };
    const primary = r.merv === 11 ? img.merv11 : img.merv13;
    const product = await prisma.product.upsert({
      where: { slug: slugOf(r) },
      create: {
        slug: slugOf(r),
        ...data,
        images: {
          create: [
            { ...primary, alt: `${name} - what it captures`, isPrimary: true, sortOrder: 0 },
            { ...img.compare, alt: `MERV 11 and MERV 13 air filters compared`, sortOrder: 1 },
            { ...img.install, alt: 'How to install your air filter in three steps', sortOrder: 2 },
          ],
        },
      },
      update: data,
    });

    for (const pack of PACKS) {
      const price = cents(r[pack.key] * pack.qty);
      const code = sku(r, pack.qty);
      await prisma.productVariant.upsert({
        where: { sku: code },
        create: {
          productId: product.id,
          sku: code,
          size: r.size,
          width: r.width,
          height: r.height,
          depth: r.depth,
          actualSize: actualSize(r),
          mervRating: r.merv,
          packQuantity: pack.qty,
          price,
          compareAtPrice: null,
          // Made in-house and always available: no stock tracking, never shown as low or sold out.
          stock: 100000,
          lowStockThreshold: 0,
          isActive: true,
        },
        update: { price, compareAtPrice: null, stock: 100000, lowStockThreshold: 0, isActive: true, actualSize: actualSize(r) },
      });
    }
    if (n % 20 === 0) console.log(`  ${n}/${rows.length}`);
  }

  console.log('Store settings…');
  await prisma.storeSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      freeShippingThreshold: 50,
      supportPhone: '925-989-8726',
      announcement: 'Free shipping on orders over $50',
      customFilter: Prisma.DbNull,
    },
    update: {
      freeShippingThreshold: 50,
      supportPhone: '925-989-8726',
      announcement: 'Free shipping on orders over $50',
      // Back to the rules in code (the client's base charge + per sq in prices).
      customFilter: Prisma.DbNull,
    },
  });

  const [products, variants] = await Promise.all([
    prisma.product.count({ where: { category: { slug: 'hvac' }, status: 'ACTIVE' } }),
    prisma.productVariant.count({ where: { product: { category: { slug: 'hvac' }, status: 'ACTIVE' } } }),
  ]);
  console.log(`Done. ${products} active HVAC products, ${variants} variants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
