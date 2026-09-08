/**
 * ============================================================================
 * 主页 — next-upload
 * ============================================================================
 *
 * 布局：
 * - 标题 + 简介
 * - UploadDropzone
 * - ConcurrencyControl
 * - TaskList（Tabs）
 *
 * 注意：主页是 Server Component，但所有子组件都是 client（"use client"）；
 * 这是符合 App Router 范式的——server 仅负责输出静态 HTML，交互在 client 接管。
 *
 * @module app/page
 */

import Link from "next/link";

import ConcurrencyControl from "@/components/ConcurrencyControl";
import TaskList from "@/components/TaskList";
import UploadDropzone from "@/components/UploadDropzone";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">大文件分片上传</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          演示 Next.js 16 Route Handlers + Web Worker MD5 + Zustand 状态机 + shadcn/ui。{" "}
          <Link href="/about" className="text-foreground underline-offset-4 hover:underline">
            查看工作原理
          </Link>
        </p>
      </header>

      <UploadDropzone />

      <ConcurrencyControl />

      <TaskList />
    </div>
  );
}
