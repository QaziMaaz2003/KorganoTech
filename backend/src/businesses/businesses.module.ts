import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module.js';
import { AdminBusinessesController } from './admin-businesses.controller.js';
import { BusinessController } from './business-requests.controller.js';
import { BusinessesService } from './businesses.service.js';

@Module({
  imports: [OrdersModule],
  controllers: [BusinessController, AdminBusinessesController],
  providers: [BusinessesService],
})
export class BusinessesModule {}
