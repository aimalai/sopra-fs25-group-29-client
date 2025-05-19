// next.config.ts
import type { NextConfig } from "next";

const isVercel = !!process.env.VERCEL; 
const BACKEND_HOST = isVercel
  ? "https://sopra-fs25-group-29-server.oa.r.appspot.com"
  : "http://localhost:8080";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "image.tmdb.org",
      "sopra-fs25-group-29-server.oa.r.appspot.com"
    ],
  },
  async rewrites() {
    return [
      {
        source: "/ws/:path*",
        destination: `${BACKEND_HOST}/ws/:path*`,
      },
    ];
  },
};

export default nextConfig;
