/**
 * ============================================================================
 * Root Layout Component
 * ============================================================================
 *
 * Next.js App Router 的根布局组件。
 * 此组件包裹所有页面，是应用程序的最外层容器。
 *
 * 功能职责：
 * - 定义全局 metadata（标题、描述）
 * - 提供 HTML 文档结构
 * - 注入全局样式
 * - 渲染 Header、Footer 和页面内容
 *
 * @module layout
 * @description 应用程序的根布局，定义全局结构和元数据
 */

import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ThemeProvider } from "../components/ThemeProvider";
import "./globals.css";

/**
 * 全局元数据配置
 *
 * 定义所有页面的默认 metadata，子页面通过 metadata 或 generateMetadata 继承、覆盖。
 *
 * 设计要点：
 * - title.template 提供统一的标题后缀，子页面只需提供标题主体
 * - Open Graph 确保社交分享时显示富媒体卡片
 * - Twitter Card 兼容 Twitter/X 分享预览
 * - robots 控制搜索引擎索引行为
 * - metadataBase 为所有相对路径的 metadata 提供基础 URL
 */
export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Next.js Demo — 现代 Web 应用示例",
    template: "%s | Next.js Demo",
  },
  description:
    "基于 Next.js 16、React 19 和 Tailwind CSS 4 构建的全栈示例项目，展示服务端渲染、流式传输、API 路由等现代 Web 开发核心技术。",
  keywords: [
    "Next.js",
    "React",
    "Tailwind CSS",
    "全栈开发",
    "TypeScript",
    "Web 开发",
    "前端",
  ],
  authors: [{ name: "Next.js Demo Team" }],
  creator: "Next.js Demo Team",
  publisher: "Next.js Demo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Next.js Demo",
    title: "Next.js Demo — 现代 Web 应用示例",
    description:
      "基于 Next.js 16、React 19 和 Tailwind CSS 4 构建的全栈示例项目。",
    images: [
      {
        url: "/next.svg",
        width: 1200,
        height: 630,
        alt: "Next.js Demo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Next.js Demo — 现代 Web 应用示例",
    description:
      "基于 Next.js 16、React 19 和 Tailwind CSS 4 构建的全栈示例项目。",
    images: ["/next.svg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

/**
 * 根布局组件
 *
 * @param props.children - 由子页面组件填充的内容区域
 *
 * @example
 * // 子页面通过 props.children 接收
 * <main>{children}</main>
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var e=t||(p?'dark':'light');document.documentElement.classList.add(e)})()`,
          }}
        />
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
