import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** We only ship within the United States. */
const US_COUNTRY = /^(united states( of america)?|u.?s.?(a.?)?)$/i;
const US_ONLY = { message: 'We currently ship to the United States only.' };

export class UpdateProfileDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  lastName?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(30)
  phone?: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(72)
  @Matches(/(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number.',
  })
  newPassword: string;
}

export class AddressDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(40)
  label?: string;

  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'Full name is required.' })
  @MaxLength(120)
  fullName: string;

  @Transform(trim)
  @IsString()
  @MinLength(5, { message: 'Phone number is required.' })
  @MaxLength(30)
  phone: string;

  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'Street address is required.' })
  @MaxLength(160)
  line1: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  line2?: string;

  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'City is required.' })
  @MaxLength(80)
  city: string;

  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'State is required.' })
  @MaxLength(80)
  state: string;

  @Transform(trim)
  @IsString()
  @MinLength(3, { message: 'ZIP / postal code is required.' })
  @MaxLength(20)
  postalCode: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(80)
  @Matches(US_COUNTRY, US_ONLY)
  country?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional() @Transform(trim) @IsString() @MaxLength(40) label?: string;
  @IsOptional() @Transform(trim) @IsString() @MinLength(1) @MaxLength(120) fullName?: string;
  @IsOptional() @Transform(trim) @IsString() @MinLength(5) @MaxLength(30) phone?: string;
  @IsOptional() @Transform(trim) @IsString() @MinLength(1) @MaxLength(160) line1?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(160) line2?: string;
  @IsOptional() @Transform(trim) @IsString() @MinLength(1) @MaxLength(80) city?: string;
  @IsOptional() @Transform(trim) @IsString() @MinLength(1) @MaxLength(80) state?: string;
  @IsOptional() @Transform(trim) @IsString() @MinLength(3) @MaxLength(20) postalCode?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(80) @Matches(US_COUNTRY, US_ONLY) country?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
