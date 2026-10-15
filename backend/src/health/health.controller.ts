import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      // Say what failed so a bad DATABASE_URL is obvious without server logs.
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'unreachable',
        reason: (e as Error).message.split('\n')[0].slice(0, 300),
      });
    }
    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}
