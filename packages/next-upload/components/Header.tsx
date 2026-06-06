/**
 * ============================================================================
 * Header — next-upload
 * ============================================================================
 *
 * 顶部导航栏。
 *
 * 职责：
 * - 站点 Logo
 * - 「关于」页面链接
 * - 主题切换按钮
 * - 显示活跃任务数 badge（Phase F 之后，从 useUploadStore 读 in-progress 任务数）
 *
 * @module components/Header
 */
"use client";

import Link from "next/link";
import { Moon, Sun, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "./ThemeProvider";

/**
 * Header — 顶部 sticky 导航栏
 *
 * 注意：activeCount 暂时硬编码为 0，Task H1 会接入真实的 useUploadStore。
 */
export default function Header() {
  const { theme, toggleTheme } = useTheme();
  // TODO(F-phase): 替换为 useUploadStore((s) => 活跃任务数)
  const activeCount = 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white shadow-sm">
            <Upload className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">next-upload</span>
        </Link>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <Badge variant="secondary" className="font-mono">
              active: {activeCount}
            </Badge>
          )}
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "切换到暗色" : "切换到亮色"}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
