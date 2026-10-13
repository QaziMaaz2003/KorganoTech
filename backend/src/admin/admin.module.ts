import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module.js';
import { AdminContentService } from './admin-content.service.js';
import { AdminCustomersService } from './admin-customers.service.js';
import { AdminDashboardService } from './admin-dashboard.service.js';
import { AdminInventoryService } from './admin-inventory.service.js';
import { AdminOrdersService } from './admin-orders.service.js';
import { AdminProductsService } from './admin-products.service.js';
import {
  AdminContentController,
  AdminCustomersController,
  AdminDashboardController,
  AdminImagesController,
  AdminInventoryController,
  AdminOrdersController,
  AdminProductsController,
  AdminVariantsController,
} from './admin.controllers.js';

@Module({
  imports: [OrdersModule],
  controllers: [
    AdminDashboardController,
    AdminProductsController,
    AdminImagesController,
    AdminVariantsController,
    AdminInventoryController,
    AdminOrdersController,
    AdminCustomersController,
    AdminContentController,
  ],
  providers: [
    AdminDashboardService,
    AdminProductsService,
    AdminInventoryService,
    AdminOrdersService,
    AdminCustomersService,
    AdminContentService,
  ],
})
export class AdminModule {}
