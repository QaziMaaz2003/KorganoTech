import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CartService } from './cart.service.js';
import { CartLineDto, CartLinesDto, UpdateCartItemDto } from './dto/cart.dto.js';

@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  /** Public: prices a guest cart held in localStorage. */
  @Post('quote')
  @HttpCode(200)
  quote(@Body() dto: CartLinesDto) {
    return this.cart.quote(dto.items);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.cart.getCart(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('items')
  add(@CurrentUser() user: AuthUser, @Body() dto: CartLineDto) {
    return this.cart.addItem(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('items/:id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cart.updateItem(user.id, id, dto.quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('items/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cart.removeItem(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  clear(@CurrentUser() user: AuthUser) {
    return this.cart.clear(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('merge')
  @HttpCode(200)
  merge(@CurrentUser() user: AuthUser, @Body() dto: CartLinesDto) {
    return this.cart.merge(user.id, dto.items);
  }
}
