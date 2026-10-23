import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';

/** Local / traditional-server entry point. Vercel uses vercel.ts instead. */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true, // Stripe webhook signatures are verified against the raw bytes
  });
  configureApp(app);

  const port = Number(process.env.PORT ?? 3001);
  new Logger('Bootstrap').log(`Starting on Node ${process.version}, port ${port}`);
  await app.listen(port);
  new Logger('Bootstrap').log(`KorganoTech API listening on http://localhost:${port}/api`);
}

await bootstrap();
