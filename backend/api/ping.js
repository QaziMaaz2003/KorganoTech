// Smallest possible function: no imports, no app. If /api/ping answers, Vercel is
// running functions for this project and any failure is inside the app itself.
export default function handler(_req, res) {
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json');
  res.end(
    JSON.stringify({
      pong: true,
      node: process.version,
      region: process.env.VERCEL_REGION ?? null,
      time: new Date().toISOString(),
    }),
  );
}
