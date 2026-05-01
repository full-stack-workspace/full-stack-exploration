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
import "./globals.css";

/**
 * 全局元数据配置
 *
 * 定义所有页面的默认 metadata，会被子页面继承或覆盖。
 * 用于 SEO 优化和浏览器标签页显示。
 */
export const metadata: Metadata = {
  title: "Next.js Demo",
  description: "A modern Next.js application with Tailwind CSS",
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
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
