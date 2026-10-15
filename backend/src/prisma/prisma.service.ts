import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

/** "host:port as user" for logs — never includes the password. */
function describeDatabase(url: string | undefined): string {
  if (!url) return 'DATABASE_URL is not set';
  try {
    const u = new URL(url);
    return `${u.hostname}:${u.port || '5432'} as ${decodeURIComponent(u.username)}`;
  } catch {
    return 'DATABASE_URL is not a valid URL (check for quotes, spaces or an unencoded password)';
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // Prisma 7 supplies the connection through a driver adapter. Supabase's
    // pooler presents a certificate signed by Supabase's own CA, so the
    // connection is encrypted but not verified against the system store.
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
        // Without a limit, an unreachable database makes every request hang until
        // the host kills it, with nothing in the logs. Fail fast and say why.
        connectionTimeoutMillis: 10_000,
      }),
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log(`Connecting to ${describeDatabase(process.env.DATABASE_URL)}`);
    await this.$connect();
    // $connect() may connect lazily, so run a real query to surface problems now.
    await this.$queryRaw`SELECT 1`;
    this.logger.log('Database connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
