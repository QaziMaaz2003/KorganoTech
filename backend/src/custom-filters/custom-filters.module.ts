import { Module } from '@nestjs/common';
import { CustomFilterService } from './custom-filter.service.js';
import { CustomFiltersController } from './custom-filters.controller.js';

@Module({
  controllers: [CustomFiltersController],
  providers: [CustomFilterService],
  exports: [CustomFilterService],
})
export class CustomFiltersModule {}
