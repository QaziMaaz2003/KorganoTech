import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export const MAX_LINE_QTY = 99;

export class CartLineDto {
  @IsString()
  @MaxLength(40)
  variantId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LINE_QTY)
  quantity: number;
}

export class UpdateCartItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LINE_QTY)
  quantity: number;
}

export class CartLinesDto {
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CartLineDto)
  items: CartLineDto[];
}
