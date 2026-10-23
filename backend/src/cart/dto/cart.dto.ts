import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CustomSpecDto } from '../../custom-filters/dto/custom-filter.dto.js';

export const MAX_LINE_QTY = 99;

/** A cart line is either a catalog variant or a custom size (never both). */
export class CartLineDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  variantId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomSpecDto)
  custom?: CustomSpecDto;

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
