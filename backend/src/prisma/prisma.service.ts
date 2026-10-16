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
        // Each serverless instance keeps its own small pool; many instances can
        // run at once, so a big pool per instance would exhaust the database.
        max: Number(process.env.DB_POOL_MAX ?? (process.env.VERCEL ? 3 : 10)),
        idleTimeoutMillis: 10_000,
        // Without a limit, an unreachable database makes every request hang until
        // the host kills it, with nothing in the logs. Fail fast and say why.
        connectionTimeoutMillis: 10_000,
      }),
    });
  }

  onModuleInit(): void {
    this.logger.log(`Connecting to ${describeDatabase(process.env.DATABASE_URL)}`);
    // Deliberately not awaited. The server must start listening right away:
    // serverless hosts only route traffic once the server is up, so waiting on
    // the database here turned a slow or failing connection into a silent hang.
    // Each query connects on demand; a failure here is logged and surfaces on
    // /api/health.
    void this.$connect()
      .then(() => this.$queryRaw`SELECT 1`)
      .then(() => this.logger.log('Database connected'))
      .catch((e: Error) =>
        this.logger.error(`Database connection failed: ${e.message}`),
      );
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
