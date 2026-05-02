import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/app", destination: "/app/index.html" },
      { source: "/app/tests", destination: "/app/tests/index.html" },
    ];
  },
};

export default nextConfig;
