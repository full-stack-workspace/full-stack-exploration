/**
 * ============================================================================
 * Root Layout — 根布局
 * ============================================================================
 *
 * Next.js App Router 的根布局,包裹所有页面。
 *
 * 功能职责:
 * - 定义全局 metadata(title.template 供专题页统一后缀)
 * - 注入全局样式与防主题闪烁内联脚本
 * - 挂载 ThemeProvider 与 SiteShell(注册表驱动的顶栏/侧边栏壳层)
 *
 * @module layout
 */

import "./globals.css";

import type { Metadata } from "next";

import Footer from "../components/Footer";
import { SiteShell } from "../components/shell/SiteShell";
import { ThemeProvider } from "../components/ThemeProvider";
import { HOME_TITLE, SITE_NAME } from "../lib/topic-meta";

/**
 * 全局元数据配置。
 *
 * 设计要点:
 * - title.template 提供统一后缀,专题页经 getTopicMetadata 只给标题主体
 * - Open Graph / Twitter Card 保证社交分享预览
 * - metadataBase 为相对路径 metadata 提供基础 URL
 */
export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "按专题组织的 Next.js 16 工程实践站点:渲染策略、Server/Client 边界、路由机制、数据缓存与 AI-Native 应用的对照演示与决策梳理。",
  keywords: [
    "Next.js",
    "React",
    "App Router",
    "RSC",
    "ISR",
    "Streaming",
    "AI-Native",
  ],
  authors: [{ name: "Next Playground" }],
  creator: "Next Playground",
  publisher: "Next Playground",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description:
      "把生产里的 Next.js 判断写成可运行的对照:渲染、边界、缓存与 AI-Native,按专题展开。",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

/**
 * @param props.children - 当前路由的页面内容,经 SiteShell 以 RSC 载荷传递
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-neutral-50 dark:bg-neutral-950">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var e=t||(p?'dark':'light');document.documentElement.classList.add(e)})()`,
          }}
        />
        <ThemeProvider>
          <SiteShell>{children}</SiteShell>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
