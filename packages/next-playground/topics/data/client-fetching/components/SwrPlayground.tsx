/**
 * ============================================================================
 * SwrPlayground — SWR 特性演练(Client)
 * ============================================================================
 *
 * 用 useSWR 请求 jsonplaceholder 的 /posts/1,配两个开关直观展示
 * SWR 的两个杀手特性:
 * - revalidateOnFocus:窗口重新聚焦时自动后台重取( stale-while-revalidate )
 * - refreshInterval:按间隔轮询,适合准实时数据
 *
 * 请求计数器 + 「重新验证中」指示灯让每次后台请求都可见;
 * fetcher 直接请求 jsonplaceholder,不经过本站 Route Handler。
 *
 * @module topics/data/client-fetching/components/SwrPlayground
 * @client
 */

"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";

import { cn } from "@/lib/utils";

/** jsonplaceholder 文章结构(只取演示需要的字段) */
interface Post {
    id: number;
    title: string;
    body: string;
}

/** 轮询间隔:3s,足够短到能直观看到请求计数上涨 */
const POLL_INTERVAL = 3000;

/** 开关行:label + 状态按钮 */
function Toggle({
    label,
    desc,
    on,
    onChange,
}: {
    label: string;
    desc: string;
    on: boolean;
    onChange: (next: boolean) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!on)}
            className="flex w-full items-center justify-between gap-4 rounded-xl border border-neutral-200/60 p-3 text-left transition-colors hover:border-emerald-300 dark:border-neutral-800/60 dark:hover:border-emerald-700"
        >
            <span>
                <span className="block text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    {label}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-400 dark:text-neutral-500">
                    {desc}
                </span>
            </span>
            {/* 滑块样式开关,颜色即状态 */}
            <span
                className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                    on ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700",
                )}
            >
                <span
                    className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                        on ? "left-[22px]" : "left-0.5",
                    )}
                />
            </span>
        </button>
    );
}

export function SwrPlayground() {
    const [revalidateOnFocus, setRevalidateOnFocus] = useState(true);
    const [polling, setPolling] = useState(false);
    // 后台重取不会改变 data 内容(mock API 返回恒定),用计数器让每次请求可见
    const [fetchCount, setFetchCount] = useState(0);

    // 计数 fetcher:包一层只为让后台重取可见,请求本身仍是一次 fetch
    const countingFetcher = useCallback(async (url: string) => {
        setFetchCount((c) => c + 1);
        const res = await fetch(url);
        return (await res.json()) as Post;
    }, []);

    const { data, error, isLoading, isValidating } = useSWR<Post>(
        "https://jsonplaceholder.typicode.com/posts/1",
        countingFetcher,
        {
            revalidateOnFocus,
            // refreshInterval 为 0 时关闭轮询
            refreshInterval: polling ? POLL_INTERVAL : 0,
        },
    );

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
                <Toggle
                    label="聚焦重验证"
                    desc="开着时,切走标签页再切回来会自动后台重取"
                    on={revalidateOnFocus}
                    onChange={setRevalidateOnFocus}
                />
                <Toggle
                    label="轮询(3s)"
                    desc="开着时,每 3s 后台重取一次,观察计数器上涨"
                    on={polling}
                    onChange={setPolling}
                />
            </div>

            {/* 状态栏:请求计数 + 重验证指示灯 */}
            <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-neutral-100 px-3 py-1 font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    已发请求 {fetchCount} 次
                </span>
                <span
                    className={cn(
                        "rounded-full px-3 py-1 font-medium transition-colors",
                        isValidating
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
                    )}
                >
                    {isValidating ? "重新验证中…" : "缓存有效"}
                </span>
            </div>

            {isLoading ? (
                <div className="animate-pulse space-y-2 rounded-xl border border-dashed border-neutral-300/80 p-4 dark:border-neutral-700/80">
                    <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-3 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
            ) : error ? (
                <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
                    请求失败:{String(error)}
                </p>
            ) : data ? (
                <div className="rounded-xl border border-neutral-200/60 p-4 dark:border-neutral-800/60">
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                        #{data.id} {data.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                        {data.body}
                    </p>
                    <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                        注意:后台重取时上面的卡片不闪动 —— SWR 先展示缓存(stale),拿到新数据再无缝替换
                    </p>
                </div>
            ) : null}
        </div>
    );
}
