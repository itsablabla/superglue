import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "50mb",
  },
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/api-keys",
        permanent: false,
      },
    ];
  },
  env: {
    DISABLE_TELEMETRY: "true",
  },
};

export default nextConfig;
