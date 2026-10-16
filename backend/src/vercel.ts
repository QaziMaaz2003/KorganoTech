import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { RequestHandler } from 'express';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';

/**
 * Vercel entry point. A serverless function must not call listen(): it builds
 * the app once per instance and hands each request to the underlying Express
 * handler. api/index.js (the function Vercel runs) calls this.
 */
export async function createApp(): Promise<RequestHandler> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Keep start-up quiet and fast; errors still log.
    logger: ['error', 'warn', 'log'],
  });
  configureApp(app);
  await app.init();
  return app.getHttpAdapter().getInstance() as RequestHandler;
}
