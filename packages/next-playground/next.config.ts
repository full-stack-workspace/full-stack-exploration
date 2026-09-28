import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // 旧路径(next-demo 时期)→ 新专题路由
  async redirects() {
    return [
      { source: "/blog", destination: "/rendering/isr", permanent: true },
      { source: "/user", destination: "/rsc-boundary/props-boundary", permanent: true },
      { source: "/user/:id", destination: "/router/dynamic-routes/:id", permanent: true },
      { source: "/ai-models", destination: "/ai-native/streaming-endpoint", permanent: true },
      { source: "/about", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
