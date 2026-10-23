import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { RateLimit } from '../common/decorators/rate-limit.decorator.js';
import { CustomFilterService } from './custom-filter.service.js';
import { CustomSpecDto } from './dto/custom-filter.dto.js';

/** Public: the order form reads its limits here and prices a size as you type. */
@Controller('custom-filters')
export class CustomFiltersController {
  constructor(private readonly custom: CustomFilterService) {}

  @Get('config')
  config() {
    return this.custom.getPublicConfig();
  }

  @RateLimit({ limit: 120, ttl: 60_000 })
  @Post('quote')
  @HttpCode(200)
  async quote(@Body() dto: CustomSpecDto) {
    const q = await this.custom.quote(dto);
    return {
      label: q.label,
      sizeLabel: q.sizeLabel,
      perFilter: q.perFilter,
      unitPrice: q.unitPrice,
      packQuantity: q.spec.packQuantity,
    };
  }
}
