import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  async redirects() {
    return [{
      source: "/:path*",
      has: [{ type: "host", value: "lifeofmo-seven.vercel.app" }],
      destination: "https://lifeofmo.com/:path*",
      permanent: true,
    }];
  },
};

export default nextConfig;
