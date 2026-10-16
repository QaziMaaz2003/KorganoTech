// The one Vercel Function that serves the whole API (see vercel.json, which sends
// every path here). The compiled app in dist/ is built by `npm run build`.
import { createApp } from '../dist/vercel.js';

// Created on the first request of each instance, then reused while it stays warm.
let app;

export default async function handler(req, res) {
  app ??= createApp().catch((error) => {
    app = undefined; // let the next request retry instead of caching the failure
    throw error;
  });
  const server = await app;
  return server(req, res);
}
