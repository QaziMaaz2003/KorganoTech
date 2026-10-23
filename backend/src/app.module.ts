import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AdminModule } from './admin/admin.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BusinessesModule } from './businesses/businesses.module.js';
import { CartModule } from './cart/cart.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { CloudinaryModule } from './cloudinary/cloudinary.module.js';
import { CustomFiltersModule } from './custom-filters/custom-filters.module.js';
import { RateLimitGuard } from './common/guards/rate-limit.guard.js';
import { DecimalInterceptor } from './common/interceptors/decimal.interceptor.js';
import { HealthController } from './health/health.controller.js';
import { InquiriesModule } from './inquiries/inquiries.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SettingsModule,
    CloudinaryModule,
    AuthModule,
    UsersModule,
    PaymentsModule,
    CustomFiltersModule,
    CatalogModule,
    CartModule,
    BusinessesModule,
    OrdersModule,
    InquiriesModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    // Baseline rate limit for the whole API; sensitive routes narrow it with @RateLimit().
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_INTERCEPTOR, useClass: DecimalInterceptor },
  ],
})
export class AppModule {}
