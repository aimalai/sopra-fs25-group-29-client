import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "image.tmdb.org",                          
      "sopra-fs25-group-29-server.oa.r.appspot.com" 
    ],
  },
  //  `rewrites()` possible too
};

export default nextConfig;
