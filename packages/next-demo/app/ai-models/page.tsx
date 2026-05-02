/**
 * ============================================================================
 * AI Models Page - AI 模型广场页面
 * ============================================================================
 *
 * 【文件目的】
 * Next.js App Router 中 AI 模型广场页面的入口文件。
 *
 * ============================================================================
 * 核心概念说明
 * ============================================================================
 *
 * 本页面演示 Next.js App Router 中两个重要的特性：
 *
 * 1. Streaming（流式传输）
 *    - 传统 SSR：等待所有数据准备完毕，再返回完整 HTML
 *    - Streaming：服务器立即返回初始 HTML，数据准备好后逐步发送更新
 *    - 优势：减少 TTFB (Time To First Byte)，加快首字节时间
 *
 * 2. Suspense（悬念边界）
 *    - React 18 引入的组件，用于包裹异步操作
 *    - 在数据加载期间显示 fallback UI
 *    - 加载完成后自动切换到实际内容
 *
 * ============================================================================
 * 架构说明
 * ============================================================================
 *
 * 组件层级：
 *
 *   page.tsx (Server Component)
 *       │
 *       └── AIModelsContent (Client Component)
 *               │
 *               ├── Header Section
 *               ├── Main Content
 *               │       │
 *               │       ├── Suspense Boundary
 *               │       │       └── ModelList
 *               │       │               └── ModelCard
 *               │       │
 *               │       └── Suspense Boundary
 *               │               └── ModelDetail
 *               │                       └── MetricBar
 *               │
 *               └── Performance Monitor
 *                       └── PerformanceMonitor
 *
 * 渲染流程：
 *
 *   1. 用户访问 /ai-models
 *   2. Next.js 加载 page.tsx（Server Component）
 *   3. Server Component 立即返回静态 HTML（Header 部分）
 *   4. 浏览器开始渲染，Suspense 显示 fallback UI
 *   5. Client Components 水合，触发数据加载
 *   6. 数据分块加载，页面逐步更新
 *   7. Streaming 完成，用户看到完整页面
 *
 * ============================================================================
 * 文件结构
 * ============================================================================
 *
 * app/ai-models/
 * ├── page.tsx           ← 当前文件：页面入口（Server Component）
 * ├── components/
 * │   ├── AIModelsContent.tsx   ← 主容器（Client Component）
 * │   ├── ModelCard.tsx          ← 模型卡片
 * │   ├── ModelList.tsx          ← 模型列表（流式加载）
 * │   ├── ModelDetail.tsx         ← 模型详情（延迟加载）
 * │   ├── MetricBar.tsx           ← 指标条
 * │   └── PerformanceMonitor.tsx  ← 性能监控
 * ├── data/
 * │   └── ai-models.ts     ← 模型数据
 * └── types/
 *     └── ai-models.ts     ← 类型定义
 *
 * ============================================================================
 */

import { AIModelsContent } from "./components/AIModelsContent";

/**
 * ============================================================================
 * AIModelsPage - 页面默认导出组件
 * ============================================================================
 *
 * 【组件类型】
 * Server Component（无需 "use client" 指令）
 *
 * 【为什么是 Server Component】
 * - page.tsx 默认导出在 App Router 中就是 Server Component
 * - Server Component 可以直接渲染 Client Component（AIModelsContent）
 * - 适合做页面的入口层，负责整体布局
 *
 * 【渲染流程】
 * 1. Next.js 识别到 /ai-models 路由
 * 2. 加载并执行 AIModelsPage 组件
 * 3. AIModelsPage 渲染 AIModelsContent
 * 4. AIModelsContent 内部处理所有交互逻辑
 *
 * 【性能优势】
 * - 静态内容（Header）在服务器端直接渲染
 * - 动态交互部分通过 Client Component 处理
 * - 充分利用 Server/Client Component 的各自优势
 */
export default function AIModelsPage() {
    return <AIModelsContent />;
}
