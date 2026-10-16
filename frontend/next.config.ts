import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:3001";
// Cloudinary account that hosts product images (the "cloud name" in its console).
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "dmaf8fdeu";

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
      { protocol: "https", hostname: "res.cloudinary.com", pathname: `/${CLOUDINARY_CLOUD_NAME}/**` },
      // Photography used by the Environmental Filters page (URLs carry query params,
      // so this pattern has no `search` restriction)
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
