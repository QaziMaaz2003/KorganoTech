import { Module } from '@nestjs/common';
import { CustomFiltersModule } from '../custom-filters/custom-filters.module.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { StripeWebhookController } from './stripe-webhook.controller.js';

@Module({
  imports: [CustomFiltersModule],
  controllers: [OrdersController, StripeWebhookController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
