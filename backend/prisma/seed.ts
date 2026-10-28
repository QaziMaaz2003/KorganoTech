/**
 * Seeds the KorganoTech store: settings, the three programs (categories),
 * the two not-yet-purchasable programs, and the admin account. The real HVAC
 * catalog (86 products x 3 packs) is loaded by `npm run db:import-catalog`.
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
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
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

// Copy from the original korganotech.com.
const HVAC_DESCRIPTION =
  'KorganoTech specializes in manufacturing high-performance MERV 11 and MERV 13 air filters using traditional melt blown filtration media and engineered to improve indoor air quality by reducing airborne pollutants and other harmful particulates.\n\nDesigned with a pleated construction to contribute to a cleaner and fresher indoor environment. Suitable for use in furnaces, air conditioners, heating systems, or HVAC systems.\n\nKorganoTech is a registered U.S. trademark # 7565070.';

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
  const [hvacImg, pathogenImg, envImg] = await Promise.all([
    upload('filter-hvac.jpg'),
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
      supportPhone: '925-989-8726',
      shippingFee: 9.99,
      freeShippingThreshold: 50,
      taxRate: 0,
      checkoutEnabled: true,
      announcement: 'Free shipping on orders over $50',
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

  // HVAC products come from the client's price list: run `npm run db:import-catalog` after seeding.

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
          actualSize: null,
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
