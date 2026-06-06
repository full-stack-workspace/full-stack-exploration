/**
 * ============================================================================
 * Next.js 配置 — next-upload
 * ============================================================================
 *
 * 默认配置即可：
 * - Route Handlers 处理 multipart/form-data 无需特殊 body 解析配置（App Router 用 Request.formData() 流式接收）
 * - Web Worker 通过 new Worker(new URL('@/workers/hash.worker.ts', import.meta.url)) 即可
 *
 * @module next.config
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
