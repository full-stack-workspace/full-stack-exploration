/**
 * ============================================================================
 * Root Layout — next-upload
 * ============================================================================
 *
 * 当前为最小可启动版本，Task H1 会扩展为：
 * - 注入 FOUC 防闪烁脚本
 * - 包裹 ThemeProvider
 * - 注入 Sonner Toaster
 * - 渲染 Header
 *
 * @module app/layout
 */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "next-upload",
  description: "大文件分片上传 demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
