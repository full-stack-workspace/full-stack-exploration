/**
 * ============================================================================
 * Root Layout — infra-fe 演示页面
 * ============================================================================
 *
 * ⚠️ 此布局仅供 infra-fe 工具库的演示页面使用，不是独立应用。
 *
 * 包含：
 * - FOUC 防闪烁脚本
 * - ThemeProvider 包裹整树
 * - 全局 Header 导航
 *
 * @module app/layout
 */
import "./globals.css";

import Header from "@demo/components/Header";
import { ThemeProvider } from "@demo/components/ThemeProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3002"),
  title: {
    default: "infra-fe — 前端基础工具与基础设施库",
    template: "%s | infra-fe",
  },
  description:
    "infra-fe 提供可复用的 TypeScript 工具函数、React Hooks 和类型守卫。此站点仅用于演示和文档。",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "infra-fe",
    title: "infra-fe — 前端基础工具与基础设施库",
    description:
      "infra-fe 提供可复用的 TypeScript 工具函数、React Hooks 和类型守卫。此站点仅用于演示和文档。",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {/* FOUC 防闪烁 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var e=t||(p?'dark':'light');document.documentElement.classList.add(e)})()`,
          }}
        />
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
