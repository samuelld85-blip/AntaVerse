import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.12"],
};

export default nextConfig;
