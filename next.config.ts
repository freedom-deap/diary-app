import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1", "192.168.2.100"],
  experimental: {
    serverActions: {
      // FormDataの境界情報を含めて受信し、アプリ側で合計50MBに制限する。
      bodySizeLimit: "52mb",
    },
  },
};

export default nextConfig;
