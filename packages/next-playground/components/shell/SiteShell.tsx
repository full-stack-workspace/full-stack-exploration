/**
 * ============================================================================
 * SiteShell — 站点壳层(顶栏 + 侧边栏 + 内容区)
 * ============================================================================
 *
 * 全站唯一的布局壳,由 app/layout.tsx 挂载。
 * 导航数据 100% 派生自 config/topics.tsx 注册表:
 *
 * - 顶栏:品牌 + 分类导航(数组顺序即注册顺序)+ 主题切换
 * - 侧边栏:贴视口左缘、通高吸附,展示当前分类的专题列表(首页不渲染)
 * - 内容区:{children} 以 RSC 载荷传入,不被客户端边界拦截
 *
 * 本组件是 Client Component(需要 usePathname 高亮与主题切换),
 * 但只包布局壳;专题页内容经 children 保持 Server Component 渲染。
 *
 * @module components/shell/SiteShell
 * @client
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/BrandMark";
import {
    CATEGORIES,
    getCategoryByPath,
    getCategoryFirstPath,
    getTopicsByCategory,
} from "@/config/topics";
import { cn } from "@/lib/utils";

import { useTheme } from "../ThemeProvider";

/* =================================================================
 * 品牌区
 * ================================================================ */

const Brand = () => (
    <Link href="/" className="group flex shrink-0 items-center gap-3">
        <BrandMark className="h-9 w-9 transition-transform duration-200 group-hover:scale-105" />
        <div className="hidden sm:block">
            <h1 className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-lg leading-tight font-bold text-transparent">
                Next Playground
            </h1>
            <p className="text-xs leading-tight text-neutral-400 dark:text-neutral-500">
                生产级工程决策
            </p>
        </div>
    </Link>
);

/* =================================================================
 * 主题切换按钮
 * ================================================================ */

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            aria-label={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
        >
            {theme === "light" ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )}
        </button>
    );
};

/* =================================================================
 * 壳层
 * ================================================================ */

/**
 * @param props.children - 当前路由的页面内容(RSC 载荷)
 */
export function SiteShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    // 当前路径所属分类,决定顶栏高亮与侧边栏内容;首页不属于任何分类
    const currentCategory = getCategoryByPath(pathname);

    return (
        <div className="flex min-h-full flex-1 flex-col">
            {/* 顶栏:品牌贴左缘(与侧边栏对齐)+ 分类导航 + 主题切换 */}
            <header className="sticky top-0 z-50 w-full border-b border-neutral-200/60 bg-white/80 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-950/80">
                <div className="flex h-16 items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
                    <Brand />
                    <nav className="flex items-center gap-1 overflow-x-auto">
                        <Link
                            href="/"
                            className={cn(
                                "relative shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                pathname === "/"
                                    ? "text-primary-600 dark:text-primary-400"
                                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50",
                            )}
                        >
                            首页
                        </Link>
                        {CATEGORIES.map((c) => {
                            const active = currentCategory?.key === c.key;
                            return (
                                <Link
                                    key={c.key}
                                    href={getCategoryFirstPath(c.key)}
                                    className={cn(
                                        "relative shrink-0 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                                        active
                                            ? "text-primary-600 dark:text-primary-400"
                                            : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50",
                                    )}
                                >
                                    {c.title}
                                    {active && (
                                        <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary-500" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                    <ThemeToggle />
                </div>
            </header>

            {/* 主体:侧边栏贴视口左缘通高吸附,内容区占满剩余宽度 */}
            <div className="flex flex-1">
                {currentCategory && (
                    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-neutral-200/60 py-8 pr-4 pl-4 sm:pl-6 lg:block lg:pl-8 dark:border-neutral-800/60">
                        {/* 分类标题区 */}
                        <div className="mb-4 flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", currentCategory.theme.dot)} />
                            <h2 className={cn("text-sm font-semibold", currentCategory.theme.text)}>
                                {currentCategory.title}
                            </h2>
                        </div>
                        <p className="mb-4 text-xs leading-relaxed text-neutral-400 dark:text-neutral-500">
                            {currentCategory.subtitle}
                        </p>
                        {/* 专题列表 */}
                        <nav className="space-y-1">
                            {getTopicsByCategory(currentCategory.key).map((t) => {
                                const active =
                                    pathname === t.path ||
                                    pathname.startsWith(`${t.path}/`);
                                return (
                                    <Link
                                        key={t.path}
                                        href={t.path}
                                        className={cn(
                                            "block rounded-lg px-3 py-2 text-sm transition-colors",
                                            active
                                                ? "bg-primary-50 font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                                                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
                                        )}
                                    >
                                        {t.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>
                )}
                <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12">{children}</main>
            </div>
        </div>
    );
}
