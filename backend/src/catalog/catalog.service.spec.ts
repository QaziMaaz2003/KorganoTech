import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CatalogService } from './catalog.service.js';

const hidden = { slug: { notIn: ['pathogen', 'environmental'] } };

function service(overrides: Record<string, unknown> = {}) {
  const prisma = {
    category: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn() },
    product: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    productVariant: { findMany: vi.fn().mockResolvedValue([]) },
    ...overrides,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { svc: new CatalogService(prisma as any), prisma };
}

describe('CatalogService hides the Pathogen and Environmental categories', () => {
  it('leaves them out of the category list', async () => {
    const { svc, prisma } = service();
    await svc.listCategories();
    expect(prisma.category.findMany.mock.calls[0][0].where).toEqual(hidden);
  });

  it('leaves them out of product lists, even when asked for by category', async () => {
    const { svc, prisma } = service();
    await svc.listProducts({ category: 'pathogen' } as never);
    const where = prisma.product.findMany.mock.calls[0][0].where;
    expect(where.category).toEqual({ slug: { equals: 'pathogen', ...hidden.slug } });
  });

  it('does not find their category page or product pages', async () => {
    const { svc, prisma } = service();
    prisma.category.findUnique.mockResolvedValue({ id: 'c1', slug: 'pathogen' });
    await expect(svc.getCategory('pathogen')).rejects.toBeInstanceOf(NotFoundException);
    await expect(svc.getProduct('pathogen-air-filter')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.product.findFirst.mock.calls[0][0].where.category).toEqual(hidden);
  });
});
