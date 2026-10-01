import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

import { SECURITY_HEADERS } from "./lib/security-headers";

const nextConfig: NextConfig = {
  // 浏览器工具走 127.0.0.1 时,开发资源不能被当成跨源拦掉
  allowedDevOrigins: ["127.0.0.1"],
  // 全站开启 Cache Components:取数默认动态,缓存用 "use cache" 显式声明;
  // PPR(静态壳 + Suspense 动态洞)由此成为自然结果,无需独立开关
  cacheComponents: true,
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // 安全响应头只挂 /security/*(活演示,见 /security/headers 专题):
  // 全站 CSP 需要 proxy.ts 逐请求生成 nonce,静态 headers() 给不了;
  // 若贸然全站下发,根 layout 的防闪烁内联脚本会被自己的 CSP 拦掉
  async headers() {
    return [
      {
        source: "/security/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
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

// @next/bundle-analyzer 是 webpack 插件,Turbopack 构建下不产出报告;
// analyze 脚本因此显式带 --webpack 回退跑一次(见 /engineering/build-deploy)。
// openAnalyzer: false 避免构建时弹浏览器,报告写到 .next/analyze/*.html
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
})(nextConfig);
