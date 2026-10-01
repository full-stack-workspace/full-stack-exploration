/**
 * ============================================================================
 * SiteShell — 站点壳层(顶栏 + 侧边栏 + 内容区)
 * ============================================================================
 *
 * 全站唯一的布局壳,由 app/layout.tsx 挂载。
 * 导航数据 100% 派生自 config/topics.tsx 注册表:
 *
 * - 顶栏:品牌 + 分类导航(lg 起可见,目录面板兜底窄屏)+ 搜索(⌘K)+ 主题切换
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
import { SearchPalette } from "./SearchPalette";

/* =================================================================
 * 品牌区
 * ================================================================ */

const Brand = () => (
    <Link
        href="/"
        transitionTypes={["nav-back"]}
        className="group flex shrink-0 items-center gap-2.5"
    >
        <BrandMark className="h-8 w-8" />
        {/* 超小屏也保留站点名(只收起 slogan),保证任何宽度下品牌可感知 */}
        <div>
            <p className="font-display text-sm leading-none font-semibold tracking-[-0.03em] whitespace-nowrap text-ink sm:text-[15px] dark:text-neutral-50">
                {SITE_NAME}
            </p>
            <p className="mt-1 hidden text-[11px] leading-none text-signal-600 sm:block dark:text-signal-400">
                {SITE_SLOGAN}
            </p>
        </div>
    </Link>
);

/* =================================================================
 * 主题切换按钮
 * ================================================================ */

const ThemeToggle = () => {
    const { toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-mist text-neutral-600 transition-colors hover:bg-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-panel-night"
            aria-label="切换主题"
        >
            <svg className="h-5 w-5 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg className="hidden h-5 w-5 dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        </button>
    );
};

/* =================================================================
 * 壳层
 * ================================================================ */

/**
 * 窄屏顶栏放不下七个分类名。目录面板是那时的完整索引:
 * 分类 kicker 与首页地图一致,点进专题后收起。
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
        <div className="absolute inset-x-0 top-14 z-50 max-h-[min(70vh,32rem)] overflow-y-auto border-b border-mist bg-paper px-4 py-4 shadow-[0_16px_40px_-24px_rgba(12,22,32,0.45)] sm:px-6 lg:hidden dark:border-neutral-800 dark:bg-night">
            <nav className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2">
                {CATEGORIES.map((category) => {
                    const active = currentCategory?.key === category.key;
                    return (
                        <div key={category.key}>
                            <Link
                                href={getCategoryFirstPath(category.key)}
                                transitionTypes={["nav-forward"]}
                                onClick={onNavigate}
                                className={cn(
                                    "font-mono text-[11px] tracking-[0.18em]",
                                    active
                                        ? "text-signal-600 dark:text-signal-400"
                                        : "text-neutral-500 dark:text-neutral-400",
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
                                                transitionTypes={["nav-forward"]}
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
            <header
                className="sticky top-0 z-50 w-full border-b border-mist bg-paper/90 backdrop-blur-md dark:border-neutral-800 dark:bg-night/90"
                style={{ viewTransitionName: "site-header" }}
            >
                <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
                    <Brand />
                    {/* lg 起显示分类导航;lg~xl 之间收紧字号与间距,配合 nav-scroll 横向滚动兜底 */}
                    <nav className="nav-scroll hidden items-center gap-0.5 overflow-x-auto lg:flex xl:gap-1">
                        <Link
                            href="/"
                            transitionTypes={["nav-back"]}
                            className={cn(
                                "relative shrink-0 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors xl:px-3 xl:text-sm",
                                pathname === "/"
                                    ? "text-ink dark:text-neutral-50"
                                    : "text-neutral-500 hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-50",
                            )}
                        >
                            首页
                            {pathname === "/" && (
                                <span className="absolute inset-x-2.5 bottom-1 h-px bg-signal xl:inset-x-3" />
                            )}
                        </Link>
                        {CATEGORIES.map((c) => {
                            const active = currentCategory?.key === c.key;
                            return (
                                <Link
                                    key={c.key}
                                    href={getCategoryFirstPath(c.key)}
                                    className={cn(
                                        "relative shrink-0 rounded-lg px-2.5 py-2 text-[13px] font-medium whitespace-nowrap transition-colors xl:px-3 xl:text-sm",
                                        active
                                            ? "text-ink dark:text-neutral-50"
                                            : "text-neutral-500 hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-50",
                                    )}
                                >
                                    {c.title}
                                    {active && (
                                        <span className="absolute inset-x-2.5 bottom-1 h-px bg-signal xl:inset-x-3" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="flex items-center gap-2">
                        <SearchPalette />
                        {/* 目录按钮:lg 以下分类导航收起时出现,与导航断点对齐 */}
                        <button
                            type="button"
                            className="flex items-center gap-1.5 rounded-lg border border-mist px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] text-ink lg:hidden dark:border-neutral-700 dark:text-neutral-100"
                            aria-expanded={menuOpen}
                            aria-controls="site-directory"
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" />
                            </svg>
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
                    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-mist py-8 pr-4 pl-4 sm:pl-6 lg:block lg:pl-8 dark:border-neutral-800">
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
                                                ? "border-l-2 border-signal bg-panel font-medium text-ink dark:bg-panel-night dark:text-neutral-50"
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
