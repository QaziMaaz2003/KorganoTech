// Start-up self-test: runs each stage the API needs, with a time limit, and reports
// which one passes, fails or stalls. Never prints secrets: only whether each
// variable is set, and the database host and port.
import dns from 'node:dns/promises';

const REQUIRED = [
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN_DAYS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'FRONTEND_URL',
];

function withTimeout(promise, ms) {
  let timer;
  const limit = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`no answer after ${ms} ms`)), ms);
  });
  return Promise.race([promise, limit]).finally(() => clearTimeout(timer));
}

export default async function handler(_req, res) {
  const report = {
    node: process.version,
    region: process.env.VERCEL_REGION ?? null,
    env: Object.fromEntries(REQUIRED.map((k) => [k, Boolean(process.env[k])])),
    steps: [],
  };

  const step = async (name, ms, fn) => {
    const started = Date.now();
    try {
      const detail = await withTimeout(fn(), ms);
      report.steps.push({ name, ok: true, ms: Date.now() - started, ...(detail ? { detail } : {}) });
      return true;
    } catch (error) {
      report.steps.push({
        name,
        ok: false,
        ms: Date.now() - started,
        error: String(error?.message ?? error).split('\n')[0].slice(0, 300),
      });
      return false;
    }
  };

  let host = null;
  let port = null;
  try {
    const url = new URL(process.env.DATABASE_URL ?? '');
    host = url.hostname;
    port = url.port || '5432';
    report.database = { host, port };
  } catch {
    report.database = 'DATABASE_URL is missing or not a valid URL (check quotes, spaces, encoding)';
  }

  if (host) {
    await step('dns lookup of the database host', 8000, async () => {
      const addresses = await dns.lookup(host, { all: true });
      return addresses.map((a) => `IPv${a.family}`).join(', ');
    });
    await step('direct database query (SELECT 1)', 12000, async () => {
      const { default: pg } = await import('pg');
      const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });
      await client.connect();
      try {
        await client.query('SELECT 1');
      } finally {
        await client.end().catch(() => {});
      }
    });
  }

  let appModule;
  const loaded = await step('load the compiled app (dist/vercel.js)', 20000, async () => {
    appModule = await import('../dist/vercel.js');
  });
  if (loaded) {
    await step('create the Nest application', 25000, () => appModule.createApp());
  }

  report.allOk = report.steps.every((s) => s.ok);
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(report, null, 2));
}
