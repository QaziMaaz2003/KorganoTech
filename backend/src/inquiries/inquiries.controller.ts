import { Body, Controller, HttpCode, Ip, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreateInquiryDto, NewsletterDto } from './dto/inquiry.dto.js';
import { InquiriesService } from './inquiries.service.js';

@Controller()
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  // 5 submissions per 10 minutes per IP.
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  @Post('inquiries')
  @HttpCode(201)
  create(@Body() dto: CreateInquiryDto, @Ip() ip: string) {
    return this.inquiries.create(dto, ip);
  }

  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  @Post('newsletter')
  @HttpCode(201)
  subscribe(@Body() dto: NewsletterDto) {
    return this.inquiries.subscribe(dto);
  }
}
