import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  // VoltAgentパッケージを外部化（明示指定）
  serverExternalPackages: ["@voltagent/core", "@voltagent/vercel-ai"],
};

export default nextConfig;
