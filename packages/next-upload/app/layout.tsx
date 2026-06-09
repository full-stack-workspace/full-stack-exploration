/**
 * ============================================================================
 * Root Layout — next-upload (final)
 * ============================================================================
 *
 * 完整版根布局：
 * - FOUC 防闪烁脚本（在 React hydrate 前先把 theme class 套上 <html>）
 * - ThemeProvider 包裹整树
 * - 全局 Header（含主题切换 + active badge）
 * - Sonner Toaster 全局通知
 *
 * @module app/layout
 */
import "./globals.css";

import type { Metadata } from "next";

import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3001"),
  title: {
    default: "next-upload — 大文件分片上传 Demo",
    template: "%s | next-upload",
  },
  description: "演示 Next.js 16 Route Handlers + Web Worker hash + Zustand 状态机 + shadcn/ui 的大文件分片上传 e2e 闭环。",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "next-upload",
    title: "next-upload — 大文件分片上传 Demo",
    description: "演示 Next.js 16 Route Handlers + Web Worker hash + Zustand 状态机 + shadcn/ui 的大文件分片上传 e2e 闭环。",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {/* FOUC 防闪烁：在 hydrate 前同步应用 theme class */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var e=t||(p?'dark':'light');document.documentElement.classList.add(e)})()`,
          }}
        />
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
