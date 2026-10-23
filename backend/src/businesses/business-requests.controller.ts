import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_DOCUMENT_BYTES } from '../cloudinary/cloudinary.service.js';
import { RateLimit } from '../common/decorators/rate-limit.decorator.js';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { BusinessRequestDto, ReorderDto } from './dto/business.dto.js';
import { BusinessesService } from './businesses.service.js';

@Controller('business')
export class BusinessController {
  constructor(private readonly businesses: BusinessesService) {}

  /** Public "Request a free business account" form, with an optional filter-list upload. */
  // 5 submissions per 10 minutes per IP.
  @RateLimit({ limit: 5, ttl: 600_000 })
  @Post('requests')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENT_BYTES } }))
  request(
    @Body() dto: BusinessRequestDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Ip() ip: string,
  ) {
    return this.businesses.requestAccount(dto, file, ip);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.businesses.getMine(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @RateLimit({ limit: 30, ttl: 60_000 })
  @Post('me/reorder')
  @HttpCode(200)
  reorder(@CurrentUser() user: AuthUser, @Body() dto: ReorderDto) {
    return this.businesses.reorder(user.id, dto);
  }
}
