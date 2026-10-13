import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export const INQUIRY_TYPES = [
  'CONTACT_SALES',
  'FRANCHISE',
  'PRODUCT_INTEREST',
  'GENERAL',
] as const;

/** The original site's Contact Sales "Product Type" options. */
export const PRODUCT_TYPES = ['MERV 13', 'MERV 11', 'Custom Size', 'Other'] as const;

export class CreateInquiryDto {
  @IsIn(INQUIRY_TYPES)
  type: (typeof INQUIRY_TYPES)[number];

  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'Name is required.' })
  @MaxLength(120)
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(160)
  email: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  company?: string;

  @IsOptional()
  @IsIn(PRODUCT_TYPES)
  productType?: (typeof PRODUCT_TYPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(40)
  productId?: string;

  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'Please include a message.' })
  @MaxLength(5000)
  message: string;

  /** Honeypot — real users never fill this in. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}

export class NewsletterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(160)
  email: string;
}
