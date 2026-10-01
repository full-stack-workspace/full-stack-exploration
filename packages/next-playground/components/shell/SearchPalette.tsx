/**
 * ============================================================================
 * SearchPalette — 站点搜索(Cmd+K 静态索引)
 * ============================================================================
 *
 * 顶栏搜索入口 + 命令面板。索引在模块级从专题注册表(TOPICS)派生,
 * 无需服务端、无需构建脚本——注册表本身就是 TS 模块,直接 import。
 *
 * 交互:
 * - Cmd+K / Ctrl+K 唤起,Esc 或点击遮罩关闭
 * - ↑/↓ 选择,Enter 跳转(useRouter)
 * - 子串匹配 title / keywords / description / 分类名,空查询展示全部专题
 *
 * a11y: role="dialog" + aria-modal,输入框唤起后自动聚焦,
 * 结果列表 role="listbox"/option 并同步 aria-selected。
 *
 * @module components/shell/SearchPalette
 * @client
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { TopicMeta } from "@/config/topics";
import { getCategoryMeta,TOPICS } from "@/config/topics";
import { cn } from "@/lib/utils";

/* =================================================================
 * 静态索引(模块级派生,一次构建终身使用)
 * ================================================================ */

interface SearchEntry {
    topic: TopicMeta;
    /** 分类名,结果行右侧的 kicker */
    categoryTitle: string;
    /** 小写拼接的匹配域:标题 + 关键词 + 描述 + 分类名 */
    haystack: string;
}

const SEARCH_INDEX: SearchEntry[] = TOPICS.filter(
    (t) => (t.status ?? "done") !== "planned",
).map((topic) => {
    const categoryTitle = getCategoryMeta(topic.category)?.title ?? "";
    return {
        topic,
        categoryTitle,
        haystack: [
            topic.title,
            topic.description,
            categoryTitle,
            ...(topic.keywords ?? []),
        ]
            .join(" ")
            .toLowerCase(),
    };
});

/* =================================================================
 * 组件
 * ================================================================ */

/**
 * 搜索入口按钮 + 命令面板。挂在顶栏右侧,自管开关状态,
 * 全局监听 Cmd+K / Ctrl+K;跳转、Esc、点击遮罩都会收起并清空查询。
 */
export function SearchPalette() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) {return SEARCH_INDEX;}
        return SEARCH_INDEX.filter((entry) => entry.haystack.includes(q));
    }, [query]);

    // 关闭时一并清空查询与选中态,下次唤起是全新面板
    const close = () => {
        setOpen(false);
        setQuery("");
        setSelected(0);
    };

    // Cmd+K / Ctrl+K 全局唤起或收起;Esc 关闭(面板打开时)
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                if (open) {close();} else {setOpen(true);}
            } else if (event.key === "Escape" && open) {
                close();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    // 唤起后聚焦输入框(同步外部系统:DOM focus)
    useEffect(() => {
        if (open) {
            inputRef.current?.focus();
        }
    }, [open]);

    const go = (entry: SearchEntry) => {
        close();
        router.push(entry.topic.path);
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelected((i) => Math.min(i + 1, results.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelected((i) => Math.max(i - 1, 0));
        } else if (event.key === "Enter") {
            event.preventDefault();
            const entry = results[selected];
            if (entry) {go(entry);}
        }
    };

    return (
        <>
            {/* 顶栏入口:窄屏只留放大镜,sm 起补 ⌘K 提示 */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-mist px-2.5 text-neutral-600 transition-colors hover:bg-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-panel-night"
                aria-label="搜索专题(Cmd+K)"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <kbd className="hidden font-mono text-[10px] tracking-wider text-neutral-400 sm:inline dark:text-neutral-500">
                    ⌘K
                </kbd>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/40 px-4 pt-[12vh] backdrop-blur-sm"
                    onClick={close}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="搜索专题"
                        className="w-full max-w-lg overflow-hidden rounded-2xl border border-mist bg-panel shadow-2xl dark:border-neutral-700 dark:bg-panel-night"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={onKeyDown}
                    >
                        <div className="flex items-center gap-2.5 border-b border-mist px-4 dark:border-neutral-800">
                            <svg className="h-4 w-4 shrink-0 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                    setSelected(0);
                                }}
                                placeholder="搜索专题、关键词、分类…"
                                aria-label="搜索专题"
                                className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                            />
                            <kbd className="shrink-0 rounded border border-mist px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
                                ESC
                            </kbd>
                        </div>

                        {results.length > 0 ? (
                            <ul role="listbox" aria-label="搜索结果" className="max-h-[50vh] overflow-y-auto py-2">
                                {results.map((entry, index) => (
                                    <li
                                        key={entry.topic.path}
                                        role="option"
                                        aria-selected={index === selected}
                                        className={cn(
                                            "cursor-pointer px-4 py-2.5",
                                            index === selected
                                                ? "bg-panel dark:bg-night"
                                                : "",
                                        )}
                                        onMouseEnter={() => setSelected(index)}
                                        onClick={() => go(entry)}
                                    >
                                        <div className="flex items-baseline justify-between gap-3">
                                            <span className="text-sm font-medium text-ink dark:text-neutral-100">
                                                {entry.topic.title}
                                            </span>
                                            <span className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-signal-600 dark:text-signal-400">
                                                {entry.categoryTitle}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                                            {entry.topic.description}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="px-4 py-10 text-center text-sm text-neutral-400 dark:text-neutral-500">
                                没有匹配「{query}」的专题
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
