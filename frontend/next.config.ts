import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The browser talks to the NestJS API through this origin, so the httpOnly
  // session cookie is first-party in development and production alike.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
  images: {
    remotePatterns: [
      // Product images uploaded through the admin dashboard
      new URL("https://res.cloudinary.com/dmaf8fdeu/**"),
      // Photography used by the Environmental Filters page
      new URL("https://images.unsplash.com/**"),
    ],
  },
};

export default nextConfig;
