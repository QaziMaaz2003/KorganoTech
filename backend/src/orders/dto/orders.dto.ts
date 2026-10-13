import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from '../../users/dto/users.dto.js';

export class CheckoutDto {
  /** Use a saved address… */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  addressId?: string;

  /** …or provide one inline. */
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsBoolean()
  saveAddress?: boolean;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsIn(['COD'], { message: 'Cash on Delivery is the only payment method available.' })
  paymentMethod: 'COD';
}

export const ORDER_FILTERS = ['all', 'active', 'delivered', 'cancelled'] as const;

export class MyOrdersQueryDto {
  @IsOptional()
  @IsIn(ORDER_FILTERS)
  status?: (typeof ORDER_FILTERS)[number];
}
