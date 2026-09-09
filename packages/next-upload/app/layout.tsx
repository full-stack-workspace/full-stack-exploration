/**
 * ============================================================================
 * Root Layout — Chunked Upload Lab
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
import Script from "next/script";

import HashScroller from "@/components/HashScroller";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3001"),
  ),
  title: {
    default: "Chunked Upload Lab — 大文件分片上传实验室",
    template: "%s | Chunked Upload Lab",
  },
  description:
    "在线体验大文件分片上传、断点续传、秒传、并发调度与服务端流式合并，完整观察文件从浏览器到服务端的传输过程。",
  applicationName: "Chunked Upload Lab",
  keywords: ["大文件上传", "分片上传", "断点续传", "秒传", "Chunked Upload", "Next.js"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Chunked Upload Lab",
    title: "Chunked Upload Lab — 大文件分片上传实验室",
    description:
      "拖入一个大文件，亲眼看见 Hash、切片、并发上传、断点续传与流式合并的完整过程。",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {/* FOUC 防闪烁：由 Next.js 在 hydration 前注入，不参与 React 客户端树。 */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){var t=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var e=t||(p?'dark':'light');document.documentElement.classList.add(e)})()`}
        </Script>
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <HashScroller />
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
