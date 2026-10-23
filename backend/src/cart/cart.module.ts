import { Module } from '@nestjs/common';
import { CustomFiltersModule } from '../custom-filters/custom-filters.module.js';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';

@Module({
  imports: [CustomFiltersModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
