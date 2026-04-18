import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ddragon.leagueoflegends.com",
      },
      {
        protocol: "https",
        hostname: "raw.communitydragon.org",
      },
      {
        protocol: "https",
        hostname: "www.communitydragon.org",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
