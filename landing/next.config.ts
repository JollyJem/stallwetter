import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/app", destination: "/app/", permanent: false },
      { source: "/app/tests", destination: "/app/tests/", permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/app/", destination: "/app/index.html" },
      { source: "/app/tests/", destination: "/app/tests/index.html" },
    ];
  },
};

export default nextConfig;
