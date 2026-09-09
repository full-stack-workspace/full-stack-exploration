/**
 * ============================================================================
 * Header — next-upload
 * ============================================================================
 *
 * 顶部导航栏。
 *
 * 职责：
 * - 站点 Logo
 * - 「工作原理」页面链接（协议 / 状态机 / 目录布局）
 * - 主题切换按钮
 * - 显示活跃任务数 badge（Phase F 之后，从 useUploadStore 读 in-progress 任务数）
 *
 * @module components/Header
 */

"use client";

import { BookOpen, CloudUpload, Moon, Sun } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { selectActiveCount,useUploadStore } from "@/lib/upload/store";

import { useTheme } from "./ThemeProvider";

/**
 * Header — 顶部 sticky 导航栏
 *
 * 上传任务计数直接订阅 Zustand 派生 selector，其他导航内容保持稳定。
 */
export default function Header() {
  const { theme, toggleTheme } = useTheme();
  // 从 store 读活跃任务数（hashing/checking/uploading/merging）
  const activeCount = useUploadStore(selectActiveCount);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="relative flex size-9 items-center justify-center overflow-hidden rounded-lg bg-primary-600 text-white shadow-sm shadow-primary-900/20 dark:bg-primary-500 dark:text-slate-950">
            <CloudUpload className="size-5 transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
            <span className="absolute inset-x-1.5 bottom-1 flex gap-0.5" aria-hidden="true">
              <span className="h-px flex-1 bg-data-400" />
              <span className="h-px flex-1 bg-data-400" />
              <span className="h-px flex-1 bg-signal-400" />
            </span>
          </div>
          <div className="leading-none">
            <span className="block text-[15px] font-semibold tracking-[-0.02em]">
              Chunked Upload Lab
            </span>
            <span className="mt-1 hidden text-[10px] text-muted-foreground sm:block">
              大文件分片上传实验室
            </span>
          </div>
        </Link>

        {/* 右侧操作区 */}
        <nav aria-label="主导航" className="flex items-center gap-1 sm:gap-2">
          {activeCount > 0 && (
            <Badge variant="secondary" className="mr-1 gap-1.5 rounded-md px-2 font-normal sm:mr-2">
              <span className="size-1.5 rounded-full bg-data-500 motion-safe:animate-pulse" />
              {activeCount} 个任务
            </Badge>
          )}
          <Link
            href="/#workbench"
            className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:block"
          >
            上传工作台
          </Link>
          <Link
            href="/about"
            className="flex min-h-10 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
          >
            <BookOpen className="size-4" aria-hidden="true" />
            原理拆解
          </Link>
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "切换到暗色" : "切换到亮色"}
            className="rounded-md"
          >
            {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </Button>
        </nav>
      </div>
    </header>
  );
}
