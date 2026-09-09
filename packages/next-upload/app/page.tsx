/**
 * ============================================================================
 * 主页 — Chunked Upload Lab（大文件分片上传实验室）
 * ============================================================================
 *
 * 布局（自上而下三段）：
 * 1. Hero — 不对称双栏：左侧定位文案 + 关键参数，右侧 PipelineChannel 数据通道
 * 2. 上传工作台（#workbench）— 并发控制 + 拖拽区 + 任务列表，功能主区
 * 3. 原理连续叙事（#how-it-works）— 步骤链 + 可展开细节，锚点通往 /about
 *
 * 注意：主页是 Server Component，但所有交互子组件都是 client（"use client"）；
 * 这是符合 App Router 范式的——server 仅负责输出静态 HTML，交互在 client 接管。
 *
 * @module app/page
 */

import { ArrowDown, ArrowRight, Check, FlaskConical } from "lucide-react";
import Link from "next/link";

import ConcurrencyControl from "@/components/ConcurrencyControl";
import PipelineChannel from "@/components/PipelineChannel";
import TaskList from "@/components/TaskList";
import { buttonVariants } from "@/components/ui/button";
import UploadDropzone from "@/components/UploadDropzone";
import { cn } from "@/lib/utils";

/* =================================================================
 * 原理步骤链数据（与 /about 的锚点一一对应）
 * ================================================================ */
const PIPELINE_STEPS = [
  {
    index: "01",
    title: "切片与哈希",
    body: "Blob.slice 切成 4 MiB 分片；SparkMD5 在 Web Worker 里增量算出整文件 MD5。",
    href: "/about#hash",
  },
  {
    index: "02",
    title: "三态判定",
    body: "check 接口按服务端目录给出秒传 / 续传 / 全新三种结论，决定还要传哪些片。",
    href: "/about#check",
  },
  {
    index: "03",
    title: "并发上传",
    body: "分片进入并发池（1–8 可调），单片失败按 1s / 2s / 4s 指数退避重试。",
    href: "/about#upload",
  },
  {
    index: "04",
    title: "流式合并",
    body: "服务端按 index 顺序流式拼接分片，产物落在 merged/<hash>.bin。",
    href: "/about#merge",
  },
] as const;

const CAPABILITIES = [
  "4 MiB 智能分片",
  "秒传与断点续传",
  "1–8 路并发",
  "Web Worker 哈希",
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* ============================================================
       * Hero — 不对称双栏：左文案 / 右数据通道
       * ============================================================ */}
      <section className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-medium text-data-700 dark:text-data-400">
            <FlaskConical className="size-4" aria-hidden="true" />
            可交互的大文件上传实验站
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-balance sm:text-6xl lg:text-[4.6rem]">
            Chunked
            <br />
            Upload Lab
          </h1>
          <p className="mt-6 max-w-xl text-lg font-medium leading-snug text-foreground sm:text-xl">
            把大文件拆成小块，稳定、并发、可恢复地传到服务端。
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            拖入文件即可观察 Hash、切片、并发传输和流式合并。暂停后继续、失败后重试，
            已上传的分片不会重复发送。
          </p>

          <ul className="mt-6 grid max-w-xl grid-cols-1 gap-x-5 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
            {CAPABILITIES.map((capability) => (
              <li key={capability} className="flex items-center gap-2">
                <Check className="size-3.5 text-data-600 dark:text-data-400" aria-hidden="true" />
                {capability}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#workbench" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
              立即体验分片上传
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
            <Link
              href="/about"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              工作原理拆解
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* 右侧：数据通道（全站唯一动态记忆点） */}
        <PipelineChannel />
      </section>

      {/* ============================================================
       * 上传工作台 — 功能主区
       * ============================================================ */}
      <section id="workbench" className="scroll-mt-20 border-t border-border/70 py-10 sm:py-14">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium text-data-700 dark:text-data-400">
              上传工作区
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              选择一个文件，看看分片如何流动
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              文件只在需要时读取为分片；Hash 在独立线程计算，上传过程不会阻塞页面交互。
            </p>
          </div>
          <ConcurrencyControl />
        </div>

        <UploadDropzone />

        <div className="mt-6">
          <TaskList />
        </div>
      </section>

      {/* ============================================================
       * 原理连续叙事 — 步骤链 + 可展开细节
       * ============================================================ */}
      <section id="how-it-works" className="scroll-mt-20 border-t border-border/70 py-10 sm:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-data-700 dark:text-data-400">
              一次上传的完整旅程
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              从一个文件，到一组可恢复的分片
            </h2>
          </div>
          <Link
            href="/about"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            完整原理拆解
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {/* 步骤链：与 /about 锚点一一对应 */}
        <ol className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE_STEPS.map((step) => (
            <li key={step.index}>
              <Link href={step.href} className="group block">
                <p className="flex items-center gap-2 font-mono text-xs text-data-600 dark:text-data-400">
                  {step.index}
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-border transition-colors group-hover:bg-data-500/50"
                  />
                </p>
                <h3 className="mt-2 text-sm font-medium group-hover:text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
              </Link>
            </li>
          ))}
        </ol>

        {/* 可展开细节：渐进展示，不抢主叙事 */}
        <div className="mt-8 divide-y divide-border/70 border-y border-border/70">
          <details className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium marker:hidden [&::-webkit-details-marker]:hidden">
              秒传是怎么命中的？
              <span
                aria-hidden="true"
                className="font-mono text-xs text-muted-foreground transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">
              check 接口拿着文件 MD5 去看{" "}
              <code className="font-mono">.uploads/merged/&lt;hash&gt;.bin</code>{" "}
              是否存在：存在即「秒传」，直接返回下载链接，一个分片都不用传。
              所以同一个文件第二次拖进来，只会看到哈希计算那一段进度。
            </p>
          </details>
          <details className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium marker:hidden [&::-webkit-details-marker]:hidden">
              断点续传恢复了什么？
              <span
                aria-hidden="true"
                className="font-mono text-xs text-muted-foreground transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">
              merged 不存在时，check 会扫描{" "}
              <code className="font-mono">.uploads/chunks/&lt;hash&gt;/</code>{" "}
              目录，把已落盘的分片 index 列表返回；客户端跳过这些分片，只传缺口。
              暂停、刷新、甚至换一天再传，都走同一条路径——服务端文件系统就是唯一的会话状态。
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
