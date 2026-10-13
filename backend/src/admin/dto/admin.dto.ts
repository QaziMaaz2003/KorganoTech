import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const bool = ({ value }: { value: unknown }) =>
  value === true || value === 'true' ? true : value === false || value === 'false' ? false : value;

const PRODUCT_STATUSES = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;
const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;
const PAYMENT_STATUSES = ['UNPAID', 'PAID', 'REFUNDED'] as const;

// ─── Products ───────────────────────────────────────────────────────────────

export class SpecDto {
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(60) label: string;
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(200) value: string;
}

export class CreateProductDto {
  @IsString() @MaxLength(40) categoryId: string;

  @Transform(trim) @IsString() @MinLength(2, { message: 'Product name is required.' }) @MaxLength(140)
  name: string;

  @IsOptional() @Transform(trim) @IsString() @MaxLength(90)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug may only contain lowercase letters, numbers and dashes.' })
  slug?: string;

  @IsOptional() @Transform(trim) @IsString() @MaxLength(300) shortDescription?: string;
  @IsOptional() @IsString() @MaxLength(10000) description?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @MaxLength(200, { each: true })
  features?: string[];

  @IsOptional() @IsArray() @ArrayMaxSize(30) @ValidateNested({ each: true }) @Type(() => SpecDto)
  specs?: SpecDto[];

  @IsOptional() @Transform(trim) @IsString() @MaxLength(60) filterType?: string;
  @IsOptional() @IsIn(PRODUCT_STATUSES) status?: (typeof PRODUCT_STATUSES)[number];
  @IsOptional() @IsBoolean() isPurchasable?: boolean;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(40) badge?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(200) availabilityNote?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(160) seoTitle?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(320) seoDescription?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(10000) sortOrder?: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class AdminProductsQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString() @MaxLength(60) category?: string;
  @IsOptional() @IsIn(PRODUCT_STATUSES) status?: (typeof PRODUCT_STATUSES)[number];
}

// ─── Images ─────────────────────────────────────────────────────────────────

export class ReorderImagesDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(30) @IsString({ each: true }) ids: string[];
}

export class UpdateImageDto {
  @IsOptional() @Transform(trim) @IsString() @MaxLength(200) alt?: string;
  @IsOptional() @IsBoolean() isPrimary?: boolean;
}

// ─── Variants ───────────────────────────────────────────────────────────────

const SIZE_PATTERN = /^[\w .x"'-]+$/i;

export class CreateVariantDto {
  @IsOptional() @Transform(trim) @IsString() @MaxLength(60)
  @Matches(/^[A-Z0-9-]+$/i, { message: 'SKU may only contain letters, numbers and dashes.' })
  sku?: string;

  @Transform(trim) @IsString() @MinLength(1, { message: 'Size is required.' }) @MaxLength(30)
  @Matches(SIZE_PATTERN, { message: 'Size contains invalid characters.' })
  size: string;

  @IsOptional() @Transform(trim) @IsString() @MaxLength(40) actualSize?: string;

  @IsOptional() @ValidateIf((_, v) => v !== null) @Type(() => Number) @IsInt() @Min(1) @Max(20)
  mervRating?: number | null;

  @Type(() => Number) @IsInt() @Min(1) @Max(500) packQuantity: number;

  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100000) price: number;

  @IsOptional() @ValidateIf((_, v) => v !== null) @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100000)
  compareAtPrice?: number | null;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(1000000) stock?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100000) lowStockThreshold?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateVariantDto extends PartialType(CreateVariantDto) {}

export class MatrixPriceDto {
  @IsOptional() @ValidateIf((_, v) => v !== null) @Type(() => Number) @IsInt() @Min(1) @Max(20)
  mervRating?: number | null;
  @Type(() => Number) @IsInt() @Min(1) @Max(500) packQuantity: number;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100000) price: number;
  @IsOptional() @ValidateIf((_, v) => v !== null) @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  compareAtPrice?: number | null;
}

export class GenerateVariantsDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(80) @IsString({ each: true })
  @Matches(/^\s*\d+(\.\d+)?\s*x\s*\d+(\.\d+)?\s*x\s*\d+(\.\d+)?\s*$/i, {
    each: true,
    message: 'Sizes must look like 16x25x1.',
  })
  sizes: string[];

  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(30) @ValidateNested({ each: true }) @Type(() => MatrixPriceDto)
  prices: MatrixPriceDto[];

  @Type(() => Number) @IsInt() @Min(0) @Max(1000000) stock: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) lowStockThreshold?: number;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(20) @Matches(/^[A-Z0-9-]*$/i) skuPrefix?: string;
  /** Fill actual size as nominal minus ½" (W/H) and ¼" (depth). Default true. */
  @IsOptional() @IsBoolean() autoActualSize?: boolean;
}

// ─── Inventory ──────────────────────────────────────────────────────────────

export class InventoryQueryDto extends PaginationQueryDto {
  @IsOptional() @Transform(bool) @IsBoolean() lowStock?: boolean;
  @IsOptional() @IsString() @MaxLength(60) category?: string;
}

export class AdjustStockDto {
  @IsIn(['add', 'set']) mode: 'add' | 'set';
  @Type(() => Number) @IsInt() @Min(-1000000) @Max(1000000) quantity: number;
  @IsIn(['ADJUSTMENT', 'RESTOCK']) reason: 'ADJUSTMENT' | 'RESTOCK';
  @IsOptional() @Transform(trim) @IsString() @MaxLength(300) note?: string;
}

// ─── Categories ─────────────────────────────────────────────────────────────

export class UpdateCategoryDto {
  @IsOptional() @Transform(trim) @IsString() @MinLength(2) @MaxLength(80) name?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(200) tagline?: string;
  @IsOptional() @IsString() @MaxLength(4000) description?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(60) statusLabel?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(1000) sortOrder?: number;
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export class AdminOrdersQueryDto extends PaginationQueryDto {
  @IsOptional() @IsIn(ORDER_STATUSES) status?: (typeof ORDER_STATUSES)[number];
  @IsOptional() @IsIn(PAYMENT_STATUSES) paymentStatus?: (typeof PAYMENT_STATUSES)[number];
  @IsOptional() @IsString() @MaxLength(40) customerId?: string;
}

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES) status: (typeof ORDER_STATUSES)[number];
  @IsOptional() @Transform(trim) @IsString() @MaxLength(500) note?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(60) carrier?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(80) trackingNumber?: string;
}

export class UpdatePaymentDto {
  @IsIn(PAYMENT_STATUSES) paymentStatus: (typeof PAYMENT_STATUSES)[number];
  @IsOptional() @Transform(trim) @IsString() @MaxLength(500) note?: string;
}

export class UpdateTrackingDto {
  @IsOptional() @Transform(trim) @IsString() @MaxLength(60) carrier?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(80) trackingNumber?: string;
}

// ─── Customers ──────────────────────────────────────────────────────────────

export class AdminCustomersQueryDto extends PaginationQueryDto {
  @IsOptional() @IsIn(['CUSTOMER', 'ADMIN']) role?: 'CUSTOMER' | 'ADMIN';
}

export class UpdateCustomerDto {
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsIn(['CUSTOMER', 'ADMIN']) role?: 'CUSTOMER' | 'ADMIN';
}

// ─── Inquiries ──────────────────────────────────────────────────────────────

export class AdminInquiriesQueryDto extends PaginationQueryDto {
  @IsOptional() @IsIn(['CONTACT_SALES', 'FRANCHISE', 'PRODUCT_INTEREST', 'GENERAL'])
  type?: 'CONTACT_SALES' | 'FRANCHISE' | 'PRODUCT_INTEREST' | 'GENERAL';
  @IsOptional() @IsIn(['NEW', 'READ', 'ARCHIVED']) status?: 'NEW' | 'READ' | 'ARCHIVED';
}

export class UpdateInquiryDto {
  @IsIn(['NEW', 'READ', 'ARCHIVED']) status: 'NEW' | 'READ' | 'ARCHIVED';
}

// ─── Settings ───────────────────────────────────────────────────────────────

export class UpdateSettingsDto {
  @IsOptional() @Transform(trim) @IsString() @MinLength(1) @MaxLength(80) storeName?: string;

  @IsOptional() @ValidateIf((_, v) => v !== null && v !== '') @Transform(trim) @IsEmail() @MaxLength(160)
  supportEmail?: string | null;

  @IsOptional() @Transform(trim) @IsString() @MaxLength(40) supportPhone?: string | null;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(240) address?: string | null;

  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(10000)
  shippingFee?: number;

  @IsOptional() @ValidateIf((_, v) => v !== null) @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100000)
  freeShippingThreshold?: number | null;

  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 4 }) @Min(0) @Max(0.5)
  taxRate?: number;

  @IsOptional() @IsBoolean() codEnabled?: boolean;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(200) announcement?: string | null;
}
