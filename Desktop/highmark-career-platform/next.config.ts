import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // 允许上传大文件
  serverRuntimeConfig: {
    maxFileSize: "10mb",
  },
};

export default nextConfig;
