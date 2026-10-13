import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CheckoutDto, MyOrdersQueryDto } from './dto/orders.dto.js';
import { OrdersService } from './orders.service.js';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post()
  place(@CurrentUser() user: AuthUser, @Body() dto: CheckoutDto) {
    return this.orders.placeOrder(user.id, user.email, dto);
  }

  @Get('me')
  listMine(@CurrentUser() user: AuthUser, @Query() query: MyOrdersQueryDto) {
    return this.orders.listMine(user.id, query);
  }

  @Get('me/:number')
  getMine(@CurrentUser() user: AuthUser, @Param('number') number: string) {
    return this.orders.getMine(user.id, number);
  }

  @Post('me/:number/cancel')
  @HttpCode(200)
  cancel(@CurrentUser() user: AuthUser, @Param('number') number: string) {
    return this.orders.cancelMine(user.id, number);
  }
}
