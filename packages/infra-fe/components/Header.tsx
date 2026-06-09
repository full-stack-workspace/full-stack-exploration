/**
 * ============================================================================
 * Header — 演示页面顶栏（演示用）
 * ============================================================================
 *
 * 演示页面的全局顶栏，包含导航和主题切换。不是 infra-fe 库的一部分。
 *
 * @module components/Header
 */

"use client";

import { NavLink } from "@demo/components/NavLink";
import { useTheme } from "@demo/components/ThemeProvider";
import { Moon, Sun, Wrench } from "lucide-react";
import Link from "next/link";

import { cn } from "@/utils";

export default function Header() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground no-underline">
          <Wrench className="h-5 w-5 text-primary-500" />
          <span>infra-fe</span>
          <span className="rounded bg-primary-100 px-1.5 py-0.5 text-[10px] font-medium text-primary-700 dark:bg-primary-800 dark:text-primary-200">
            LIB
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 text-sm">
          <NavLink href="/utils">cn()</NavLink>
          <NavLink href="/hooks">Hooks</NavLink>
          <NavLink href="/types">Types</NavLink>
        </nav>

        <div className="flex-1" />

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "rounded-md p-2 text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
          )}
          aria-label="切换主题"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
