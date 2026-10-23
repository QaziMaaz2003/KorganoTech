import { Type } from 'class-transformer';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

/** The customer's custom-size request. Exact limits come from the admin-set config. */
export class CustomSpecDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  width: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  height: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.25)
  @Max(20)
  depth: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(16)
  mervRating: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  packQuantity: number;
}
