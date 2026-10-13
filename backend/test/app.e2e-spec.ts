import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

// Runs against the database in DATABASE_URL.
describe('KorganoTech API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('GET /api/health', () =>
    request(app.getHttpServer()).get('/api/health').expect(200));

  it('GET /api/categories lists the three programs', async () => {
    const res = await request(app.getHttpServer()).get('/api/categories').expect(200);
    expect(res.body.map((c: { slug: string }) => c.slug)).toEqual(
      expect.arrayContaining(['hvac', 'pathogen', 'environmental']),
    );
  });

  it('rejects admin routes without a session', () =>
    request(app.getHttpServer()).get('/api/admin/stats').expect(401));

  afterAll(async () => {
    await app.close();
  });
});
