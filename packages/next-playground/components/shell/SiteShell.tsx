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
import { useEffect, useState } from "react";

import { BrandMark } from "@/components/BrandMark";
import {
    CATEGORIES,
    getCategoryByPath,
    getCategoryFirstPath,
    getTopicsByCategory,
} from "@/config/topics";
import { SITE_NAME, SITE_SLOGAN } from "@/lib/topic-meta";
import { cn } from "@/lib/utils";

import { useTheme } from "../ThemeProvider";

/* =================================================================
 * 品牌区
 * ================================================================ */

const Brand = () => (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5">
        <BrandMark className="h-8 w-8" />
        <div className="hidden sm:block">
            <p className="font-display text-[15px] leading-none font-semibold tracking-[-0.03em] text-ink dark:text-neutral-50">
                {SITE_NAME}
            </p>
            <p className="mt-1 text-[11px] leading-none text-copper-600 dark:text-copper-400">
                {SITE_SLOGAN}
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-rule text-neutral-600 transition-colors hover:bg-white dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
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
/**
 * 窄屏顶栏放不下七个分类名。目录面板是那时的完整索引:
 * 分类编号与首页账本一致,点进专题后收起。
 */
function DirectoryMenu({
    open,
    pathname,
    onNavigate,
}: {
    open: boolean;
    pathname: string;
    onNavigate: () => void;
}) {
    const currentCategory = getCategoryByPath(pathname);
    if (!open) {
        return null;
    }

    return (
        <div className="absolute inset-x-0 top-14 z-50 max-h-[min(70vh,32rem)] overflow-y-auto border-b border-rule bg-paper px-4 py-4 shadow-[0_16px_40px_-24px_rgba(21,32,43,0.45)] sm:px-6 xl:hidden dark:border-neutral-800 dark:bg-neutral-950">
            <nav className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2">
                {CATEGORIES.map((category, index) => {
                    const active = currentCategory?.key === category.key;
                    const order = String(index + 1).padStart(2, "0");
                    return (
                        <div key={category.key}>
                            <p className="font-mono text-[11px] tracking-[0.18em] text-copper-600 dark:text-copper-400">
                                {order}
                            </p>
                            <Link
                                href={getCategoryFirstPath(category.key)}
                                onClick={onNavigate}
                                className={cn(
                                    "mt-1 block text-sm font-semibold",
                                    active
                                        ? "text-ink dark:text-neutral-50"
                                        : "text-neutral-600 dark:text-neutral-300",
                                )}
                            >
                                {category.title}
                            </Link>
                            <ul className="mt-2 space-y-1">
                                {getTopicsByCategory(category.key).map((topic) => {
                                    const topicActive =
                                        pathname === topic.path ||
                                        pathname.startsWith(`${topic.path}/`);
                                    return (
                                        <li key={topic.path}>
                                            <Link
                                                href={topic.path}
                                                onClick={onNavigate}
                                                className={cn(
                                                    "block py-1 text-sm",
                                                    topicActive
                                                        ? "text-ink dark:text-neutral-50"
                                                        : "text-neutral-500 hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-50",
                                                )}
                                            >
                                                {topic.title}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}

export function SiteShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    // 当前路径所属分类,决定顶栏高亮与侧边栏内容;首页不属于任何分类
    const currentCategory = getCategoryByPath(pathname);

    useEffect(() => {
        if (!menuOpen) {
            return;
        }
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    return (
        <div className="flex min-h-full flex-1 flex-col">
            {/* 顶栏:品牌贴左缘(与侧边栏对齐)+ 分类导航 + 主题切换 */}
            <header className="sticky top-0 z-50 w-full border-b border-rule bg-paper/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90">
                <div className="flex h-14 items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
                    <Brand />
                    <nav className="nav-scroll hidden items-center gap-1 overflow-x-auto xl:flex">
                        <Link
                            href="/"
                            className={cn(
                                "relative shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                pathname === "/"
                                    ? "text-ink dark:text-neutral-50"
                                    : "text-neutral-500 hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-50",
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
                                            ? "text-ink dark:text-neutral-50"
                                            : "text-neutral-500 hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-50",
                                    )}
                                >
                                    {c.title}
                                    {active && (
                                        <span className="absolute right-3 bottom-1 left-3 h-px bg-copper-500" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="rounded-md border border-rule px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] text-ink xl:hidden dark:border-neutral-700 dark:text-neutral-100"
                            aria-expanded={menuOpen}
                            aria-controls="site-directory"
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            {menuOpen ? "收起" : "目录"}
                        </button>
                        <ThemeToggle />
                    </div>
                </div>
                <div id="site-directory">
                    <DirectoryMenu
                        open={menuOpen}
                        pathname={pathname}
                        onNavigate={() => setMenuOpen(false)}
                    />
                </div>
            </header>

            {/* 主体:侧边栏贴视口左缘通高吸附,内容区占满剩余宽度 */}
            <div className="flex flex-1">
                {currentCategory && (
                    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-rule py-8 pr-4 pl-4 sm:pl-6 lg:block lg:pl-8 dark:border-neutral-800">
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
                                                ? "border-l-2 border-copper-500 bg-white font-medium text-ink dark:bg-neutral-900 dark:text-neutral-50"
                                                : "border-l-2 border-transparent text-neutral-600 hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-50",
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
