import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import type { RequestHandler } from 'express';
import helmetImport from 'helmet';

// helmet ships both ESM and CommonJS typings. Depending on which one the build
// environment resolves (Vercel's build picked the CommonJS ones), the default
// import is typed either as the function or as the module namespace. Cast so
// the build passes in both cases; at runtime it is always the function.
const helmet = ((helmetImport as unknown as { default?: unknown }).default ??
  helmetImport) as unknown as (options?: object) => RequestHandler;

/**
 * Everything that makes the API behave the same wherever it runs: the local
 * server (main.ts) and the Vercel function (vercel.ts) both call this.
 */
export function configureApp(app: NestExpressApplication) {
  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());

  // The Next.js frontend proxies /api/* here, so trust it for client IPs.
  // TRUST_PROXY_HOPS is how many proxies sit in front of this server.
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS ?? 1));

  app.enableCors({
    origin: (process.env.FRONTEND_URL ?? 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('KorganoTech API')
        .setDescription('Catalog, cart, orders and admin endpoints')
        .setVersion('1.0')
        .addCookieAuth('kt_session')
        .build(),
    );
    SwaggerModule.setup('api/docs', app, doc);
  }
}
