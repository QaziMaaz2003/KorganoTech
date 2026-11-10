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
  ValidateIf,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CheckoutDto } from '../../orders/dto/orders.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const lower = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

/** The public "Request a free business account" form (sent as multipart). */
export class BusinessRequestDto {
  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'Name is required.' })
  @MaxLength(120)
  name: string;

  @Transform(lower)
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(160)
  email: string;

  @Transform(trim)
  @IsString()
  @MinLength(5, { message: 'Phone number is required.' })
  @MaxLength(40)
  phone: string;

  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'Company is required.' })
  @MaxLength(160)
  company: string;

  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'Address is required.' })
  @MaxLength(300)
  address: string;

  /** "Have you ever ordered KorganoTech filters through korganotech.com or Walmart.com?" */
  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'Please tell us whether you have ordered from us before.' })
  @MaxLength(2000)
  orderedBefore: string;

  /** Honeypot: real users never fill this in. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}

export class CreateBusinessDto {
  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'Company name is required.' })
  @MaxLength(160)
  name: string;

  @IsOptional() @Transform(trim) @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(300) address?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(2000) notes?: string;

  /** The request this account is being created from. */
  @IsOptional() @IsString() @MaxLength(40) inquiryId?: string;

  /** Login email for the business. Existing customers are linked; new ones get a temporary password. */
  @Transform(lower)
  @IsEmail({}, { message: 'Enter a valid login email.' })
  @MaxLength(160)
  loginEmail: string;

  @IsOptional() @Transform(trim) @IsString() @MaxLength(60) firstName?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(60) lastName?: string;
}

export class UpdateBusinessDto {
  @IsOptional() @Transform(trim) @IsString() @MinLength(1) @MaxLength(160) name?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(300) address?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class AddBusinessUserDto {
  @Transform(lower)
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(160)
  email: string;

  @IsOptional() @Transform(trim) @IsString() @MaxLength(60) firstName?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(60) lastName?: string;
}

const SIZE_TYPES = ['NOMINAL', 'EXACT'] as const;

/** One line on a business's list: a size, MERV rating, how many filters and the agreed price per filter. */
export class BusinessFilterDto {
  @Type(() => Number) @IsNumber() @Min(1) @Max(200) width: number;
  @Type(() => Number) @IsNumber() @Min(1) @Max(200) height: number;
  @Type(() => Number) @IsNumber() @Min(0.25) @Max(20) depth: number;
  @Type(() => Number) @IsInt() @Min(1) @Max(16) mervRating: number;
  @IsIn(SIZE_TYPES) sizeType: (typeof SIZE_TYPES)[number];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  quantity: number;

  /** Agreed price for one filter. Can be added or changed later. */
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100000) unitPrice?: number;

  @IsOptional() @Transform(trim) @IsString() @MaxLength(80) label?: string;
}

export class UpdateBusinessFilterDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100000) quantity?: number;
  /** Send null to clear the price. */
  @IsOptional() @Type(() => Number) @ValidateIf((_o, v) => v !== null) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100000) unitPrice?: number | null;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(80) label?: string;
  @IsOptional() @IsIn(SIZE_TYPES) sizeType?: (typeof SIZE_TYPES)[number];
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(10000) sortOrder?: number;
}

export class OrderItemDto {
  @IsString() @MaxLength(40) filterId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  quantity: number;
}

/** A business places an order for some of the lines on its list. Delivery address as at checkout. */
export class BusinessOrderDto extends CheckoutDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Choose at least one filter to order.' })
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class ImportSheetDto {
  /** merge: update matching lines and add new ones. replace: the sheet becomes the whole list. */
  @IsOptional() @IsIn(['merge', 'replace']) mode?: 'merge' | 'replace';
  /** false = preview only (default); true = save. Sent as a form field, so a string. */
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  apply?: boolean;
}

export class BusinessListQueryDto extends PaginationQueryDto {}
