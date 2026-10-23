import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module.js';
import { CustomFiltersModule } from '../custom-filters/custom-filters.module.js';
import { AdminBusinessesController } from './admin-businesses.controller.js';
import { BusinessController } from './business-requests.controller.js';
import { BusinessesService } from './businesses.service.js';

@Module({
  imports: [CartModule, CustomFiltersModule],
  controllers: [BusinessController, AdminBusinessesController],
  providers: [BusinessesService],
})
export class BusinessesModule {}
