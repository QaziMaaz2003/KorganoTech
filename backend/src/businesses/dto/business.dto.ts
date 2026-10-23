import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CustomSpecDto } from '../../custom-filters/dto/custom-filter.dto.js';
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

export class BusinessFilterDto {
  @IsOptional() @IsString() @MaxLength(40) variantId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomSpecDto)
  custom?: CustomSpecDto;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;

  @IsOptional() @Transform(trim) @IsString() @MaxLength(80) label?: string;
}

export class UpdateBusinessFilterDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(99) quantity?: number;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(80) label?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(10000) sortOrder?: number;
}

export class ReorderItemDto {
  @IsString() @MaxLength(40) filterId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;
}

export class ReorderDto {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}

export class BusinessListQueryDto extends PaginationQueryDto {}
