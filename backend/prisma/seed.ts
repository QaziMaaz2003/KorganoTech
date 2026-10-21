/**
 * Seeds the KorganoTech store: settings, the three programs (categories),
 * HVAC products with size × MERV × pack variants, the two not-yet-purchasable
 * programs, and the admin account.
 *
 * Placeholder product photos are uploaded to Cloudinary first, so the database
 * holds Cloudinary URLs exactly as it does for admin uploads.
 *
 * Safe to re-run: everything is upserted by slug / SKU / email.
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '../src/generated/prisma/client.js';

const here = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }),
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ─── Images ──────────────────────────────────────────────────────────────────

type Img = { url: string; publicId: string; width: number; height: number };

async function upload(file: string): Promise<Img> {
  const name = file.replace(/\.[a-z]+$/, '');
  const res = await cloudinary.uploader.upload(join(here, 'seed-assets', file), {
    public_id: `korganotech/seed/${name}`,
    overwrite: true,
    resource_type: 'image',
  });
  return { url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const actualSize = (w: number, h: number, d: number) =>
  `${w - 0.5} x ${h - 0.5} x ${Math.max(d - 0.25, 0.25)}`;

/** Deterministic pseudo-random stock so re-seeding is stable. */
function stockFor(sku: string) {
  let h = 0;
  for (const c of sku) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const r = h % 100;
  if (r < 4) return 0; // a few sold-out variants
  if (r < 14) return 3 + (h % 6); // some low-stock variants
  return 20 + (h % 140);
}

const to99 = (n: number) => Math.max(0.99, Math.floor(n) + 0.99);

interface HvacLine {
  slug: string;
  name: string;
  filterType: string;
  depth: number;
  sizes: [number, number][];
  perFilter: Record<11 | 13, number>;
  packs: { qty: number; discount: number }[];
  isFeatured: boolean;
  badge?: string;
  sortOrder: number;
}

const hvacLines: HvacLine[] = [
  {
    slug: 'pleated-hvac-air-filter-1-inch',
    name: 'Pleated HVAC Air Filter — 1"',
    filterType: 'Pleated',
    depth: 1,
    sizes: [
      [10, 20], [12, 24], [14, 20], [14, 25], [16, 20], [16, 24], [16, 25],
      [18, 24], [20, 20], [20, 24], [20, 25], [20, 30], [24, 24], [25, 25],
    ],
    perFilter: { 11: 8.25, 13: 10.5 },
    packs: [
      { qty: 4, discount: 1 },
      { qty: 6, discount: 0.95 },
      { qty: 12, discount: 0.88 },
    ],
    isFeatured: true,
    badge: 'Best Seller',
    sortOrder: 1,
  },
  {
    slug: 'pleated-hvac-air-filter-2-inch',
    name: 'Pleated HVAC Air Filter — 2"',
    filterType: 'Pleated',
    depth: 2,
    sizes: [[16, 20], [16, 25], [20, 20], [20, 25], [24, 24]],
    perFilter: { 11: 13.5, 13: 16.5 },
    packs: [
      { qty: 4, discount: 1 },
      { qty: 6, discount: 0.95 },
      { qty: 12, discount: 0.88 },
    ],
    isFeatured: true,
    sortOrder: 2,
  },
  {
    slug: 'deep-pleat-hvac-air-filter-4-inch',
    name: 'Deep Pleat HVAC Air Filter — 4"',
    filterType: 'Deep Pleat',
    depth: 4,
    sizes: [[16, 25], [20, 20], [20, 25]],
    perFilter: { 11: 27.5, 13: 32.5 },
    packs: [
      { qty: 2, discount: 1 },
      { qty: 4, discount: 0.95 },
      { qty: 6, discount: 0.9 },
    ],
    isFeatured: true,
    badge: 'New',
    sortOrder: 3,
  },
];

// Copy from the original korganotech.com.
const HVAC_DESCRIPTION =
  'KorganoTech specializes in manufacturing high-performance MERV 11 and MERV 13 air filters using traditional melt blown filtration media and engineered to improve indoor air quality by reducing airborne pollutants and other harmful particulates.\n\nDesigned with a pleated construction to contribute to a cleaner and fresher indoor environment. Suitable for use in furnaces, air conditioners, heating systems, or HVAC systems.\n\nKorganoTech is a registered U.S. trademark # 7565070.';

const HVAC_FEATURES = [
  'High-performance MERV 11 and MERV 13 filtration',
  'Traditional melt blown filtration media',
  'Pleated construction for a cleaner and fresher indoor environment',
  'Reduces airborne pollutants and other harmful particulates',
  'Suitable for furnaces, air conditioners, heating systems, or HVAC systems',
];

const PATHOGEN_DESCRIPTION =
  'KorganoTech is developing a nanotechnology-based air filter designed to effectively capture and neutralize airborne pathogens, ensuring cleaner and safer indoor environments.\n\nKorganoTech Pathogen Air Filter is currently under development. Once developed and validated, it is expected to effectively capture and neutralize harmful airborne pathogens. Its efficacy is being validated through rigorous third-party certification testing to ensure compliance with EPA regulations and industry standards for air quality and safety. It is not yet registered as a pesticide or pesticide device.\n\n*Disclaimer: The KorganoTech Pathogen Air Filter is currently in the research and development phase and is not yet commercially available. Information presented on KorganoTech Pathogen Air Filters is intended for investor and informational purposes only and should not be construed as an endorsement, claim, or guarantee of performance until validated through regulatory approvals.';

const PATHOGEN_FEATURES = [
  'Nanotechnology-based air filter (technology under development)',
  'Known antimicrobial bioactive metal particles (BMPs) such as silver, copper and metal oxides',
  'Ultra-high surface area, porous nanowire web to capture pathogens of all sizes',
  'Designed to neutralize captured pathogens without electricity',
];

const ENVIRONMENTAL_DESCRIPTION =
  'Landfill gas passes through a selective CO₂ filter media. CO₂ is held in the media and methane passes through for recovery. The system senses when the media is loaded, swaps cartridges automatically, and regenerates the media with low-energy heat so it can be reused.\n\nWorking with Lawrence Livermore National Laboratory (LLNL), we have designed a system that combines a selective CO₂ media filter, optical sensing, automated cartridge exchange and low-energy regeneration.';

const ENVIRONMENTAL_FEATURES = [
  'CO₂ capture media integrated with a MERV 13 particulate layer',
  'Gas-entry and gas-exit cartridge architecture',
  'Automated regeneration with low-energy heat',
  'Reusable sorbent platform developed with LLNL',
];

// ─── Seed ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Uploading placeholder images to Cloudinary…');
  const [hvacImg, heroImg, pathogenImg, envImg] = await Promise.all([
    upload('filter-hvac.jpg'),
    upload('hero-filter.jpg'),
    upload('filter-pathogen.jpg'),
    upload('filter-environmental.jpg'),
  ]);

  console.log('Store settings…');
  await prisma.storeSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      storeName: 'KorganoTech',
      address: '69 E Airway Blvd, Livermore, CA 94551',
      shippingFee: 9.99,
      freeShippingThreshold: 75,
      taxRate: 0,
      codEnabled: true,
      announcement: 'Free shipping on orders over $75 · Cash on Delivery available',
    },
    update: {},
  });

  console.log('Categories…');
  const categories = {
    hvac: await prisma.category.upsert({
      where: { slug: 'hvac' },
      create: {
        slug: 'hvac',
        name: 'Traditional HVAC Air Filters',
        tagline: 'America’s #1 Pleated HVAC Air Filter',
        description: HVAC_DESCRIPTION,
        statusLabel: 'Available Now',
        imageUrl: hvacImg.url,
        imagePublicId: hvacImg.publicId,
        sortOrder: 1,
      },
      update: { imageUrl: hvacImg.url, imagePublicId: hvacImg.publicId },
    }),
    pathogen: await prisma.category.upsert({
      where: { slug: 'pathogen' },
      create: {
        slug: 'pathogen',
        name: 'Pathogen Air Filters',
        tagline: 'Technology Under Development',
        description:
          'KorganoTech is developing a nanotechnology-based air filter designed to effectively capture and neutralize airborne pathogens, ensuring cleaner and safer indoor environments.',
        statusLabel: 'Under Development',
        imageUrl: pathogenImg.url,
        imagePublicId: pathogenImg.publicId,
        sortOrder: 2,
      },
      update: { imageUrl: pathogenImg.url, imagePublicId: pathogenImg.publicId },
    }),
    environmental: await prisma.category.upsert({
      where: { slug: 'environmental' },
      create: {
        slug: 'environmental',
        name: 'Environmental Air Filters',
        tagline: 'Landfill gas to renewable methane',
        description:
          'An automated carbon-capture and methane-recovery system developed with Lawrence Livermore National Laboratory. Separate CO₂ from landfill gas with a reusable filter media.',
        statusLabel: 'Under Development',
        imageUrl: envImg.url,
        imagePublicId: envImg.publicId,
        sortOrder: 3,
      },
      update: { imageUrl: envImg.url, imagePublicId: envImg.publicId },
    }),
  };

  console.log('HVAC products and variants…');
  for (const line of hvacLines) {
    const product = await prisma.product.upsert({
      where: { slug: line.slug },
      create: {
        slug: line.slug,
        name: line.name,
        categoryId: categories.hvac.id,
        shortDescription: `${line.filterType} HVAC air filter in MERV 11 and MERV 13, made with traditional melt blown filtration media. ${line.depth}" depth.`,
        description: HVAC_DESCRIPTION,
        features: HVAC_FEATURES,
        specs: [
          { label: 'Filter type', value: `${line.filterType} HVAC air filter` },
          { label: 'Depth (nominal)', value: `${line.depth}"` },
          { label: 'MERV ratings', value: 'MERV 11, MERV 13' },
          { label: 'Filtration media', value: 'Traditional melt blown media' },
          { label: 'Construction', value: 'Pleated' },
          { label: 'Use', value: 'Furnaces, air conditioners, heating systems, HVAC systems' },
          { label: 'Trademark', value: 'U.S. registered trademark #7565070' },
        ],
        filterType: line.filterType,
        status: 'ACTIVE',
        isPurchasable: true,
        isFeatured: line.isFeatured,
        badge: line.badge ?? null,
        sortOrder: line.sortOrder,
        images: {
          create: [
            { ...hvacImg, alt: line.name, isPrimary: true, sortOrder: 0 },
            { ...heroImg, alt: `${line.name} — airflow`, sortOrder: 1 },
          ],
        },
      },
      update: {},
    });

    for (const [w, h] of line.sizes) {
      const size = `${w}x${h}x${line.depth}`;
      const areaFactor = w * h > 500 ? 1.15 : 1;
      for (const merv of [11, 13] as const) {
        for (const pack of line.packs) {
          const sku = `KT-${w}X${h}X${line.depth}-M${merv}-${pack.qty}PK`;
          const list = line.perFilter[merv] * areaFactor * pack.qty;
          const price = to99(list * pack.discount);
          await prisma.productVariant.upsert({
            where: { sku },
            create: {
              productId: product.id,
              sku,
              size,
              width: w,
              height: h,
              depth: line.depth,
              actualSize: actualSize(w, h, line.depth),
              mervRating: merv,
              packQuantity: pack.qty,
              price,
              compareAtPrice: pack.discount < 1 ? to99(list) : null,
              stock: stockFor(sku),
              lowStockThreshold: 10,
            },
            update: {},
          });
        }
      }
    }
  }

  console.log('Pathogen and Environmental programs…');
  await prisma.product.upsert({
    where: { slug: 'pathogen-air-filter' },
    create: {
      slug: 'pathogen-air-filter',
      name: 'KorganoTech Pathogen Air Filter',
      categoryId: categories.pathogen.id,
      shortDescription:
        'A nanotechnology-based air filter designed to capture and neutralize airborne pathogens. Technology under development.',
      description: PATHOGEN_DESCRIPTION,
      features: PATHOGEN_FEATURES,
      specs: [
        { label: 'Status', value: 'Research and development phase' },
        { label: 'Technology', value: 'Bioactive metal particles in a porous nanowire web' },
        { label: 'Regulatory', value: 'Not yet registered as a pesticide or pesticide device' },
        { label: 'EPA Establishment Number', value: '102482-CA-1' },
      ],
      filterType: 'Nanotechnology',
      status: 'ACTIVE',
      isPurchasable: false,
      isFeatured: false,
      badge: 'In Development',
      availabilityNote: 'Not yet commercially available — technology under development.',
      sortOrder: 10,
      images: { create: [{ ...pathogenImg, alt: 'KorganoTech Pathogen Air Filter', isPrimary: true }] },
      variants: {
        create: [
          ['16x20x1', 16, 20, 1],
          ['16x25x1', 16, 25, 1],
          ['20x25x1', 20, 25, 1],
        ].map(([size, w, h, d]) => ({
          sku: `KT-PATH-${String(size).toUpperCase()}`,
          size: String(size),
          width: Number(w),
          height: Number(h),
          depth: Number(d),
          actualSize: actualSize(Number(w), Number(h), Number(d)),
          mervRating: 13,
          packQuantity: 1,
          price: 39.99,
          stock: 0,
        })),
      },
    },
    update: {},
  });

  await prisma.product.upsert({
    where: { slug: 'environmental-co2-capture-filter' },
    create: {
      slug: 'environmental-co2-capture-filter',
      name: 'Environmental CO₂ Capture Filter',
      categoryId: categories.environmental.id,
      shortDescription:
        'A reusable CO₂ capture cartridge, the heart of the landfill-gas system. In development for landfill applications.',
      description: ENVIRONMENTAL_DESCRIPTION,
      features: ENVIRONMENTAL_FEATURES,
      specs: [
        { label: 'Application', value: 'Landfill gas (CH₄ + CO₂) separation' },
        { label: 'Media', value: 'Encapsulated liquid carbonate sorbent' },
        { label: 'Particulate layer', value: 'MERV 13' },
        { label: 'Regeneration', value: 'Low-energy heat; media is reused' },
        { label: 'Technology readiness', value: 'TRL 6' },
        { label: 'Partner', value: 'Lawrence Livermore National Laboratory' },
      ],
      filterType: 'Sorbent media',
      status: 'ACTIVE',
      isPurchasable: false,
      isFeatured: false,
      badge: 'In Development',
      availabilityNote: 'In development · landfill application. Contact us to host a demonstration.',
      sortOrder: 20,
      images: { create: [{ ...envImg, alt: 'Environmental CO₂ capture filter module', isPrimary: true }] },
      variants: {
        create: [
          {
            sku: 'KT-ENV-CARTRIDGE',
            size: 'Standard cartridge',
            mervRating: 13,
            packQuantity: 1,
            price: 0,
            stock: 0,
          },
        ],
      },
    },
    update: {},
  });

  console.log('Admin account…');
  const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? '';
  if (!email || password.length < 8) {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin account.');
  } else {
    await prisma.user.upsert({
      where: { email },
      create: {
        email,
        firstName: 'KorganoTech',
        lastName: 'Admin',
        role: 'ADMIN',
        passwordHash: await bcrypt.hash(password, 12),
        cart: { create: {} },
      },
      update: { role: 'ADMIN', isActive: true },
    });
  }

  const [products, variants] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
  ]);
  console.log(`Done: ${products} products, ${variants} variants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
