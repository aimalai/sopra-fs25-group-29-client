import type { NextConfig } from "next";

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
        destination: "http://localhost:8080/ws/:path*",
      },
    ];
  },
};

export default nextConfig;
