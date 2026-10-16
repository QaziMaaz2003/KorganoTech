// The one Vercel Function that serves the whole API (see vercel.json, which sends
// every path here). The compiled app in dist/ is built by `npm run build`.
//
// The app is loaded lazily and with a time limit, so a start-up problem answers
// with a readable error instead of hanging until Vercel gives up.

const START_LIMIT_MS = 25_000;

// Created on the first request of each instance, then reused while it stays warm.
let app;

function start() {
  app ??= import('../dist/vercel.js')
    .then((m) => m.createApp())
    .catch((error) => {
      app = undefined; // let the next request retry instead of caching the failure
      throw error;
    });
  return app;
}

function withTimeout(promise, ms) {
  let timer;
  const limit = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`start-up took longer than ${ms} ms`)), ms);
  });
  return Promise.race([promise, limit]).finally(() => clearTimeout(timer));
}

export default async function handler(req, res) {
  let server;
  try {
    server = await withTimeout(start(), START_LIMIT_MS);
  } catch (error) {
    console.error('API failed to start:', error);
    res.statusCode = 503;
    res.setHeader('content-type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'error',
        message: 'The API failed to start.',
        reason: String(error?.message ?? error).split('\n')[0].slice(0, 300),
      }),
    );
    return;
  }
  return server(req, res);
}
