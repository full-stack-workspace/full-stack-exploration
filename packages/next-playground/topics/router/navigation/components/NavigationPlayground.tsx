/**
 * ============================================================================
 * NavigationPlayground — 导航行为演练(Client)
 * ============================================================================
 *
 * 演示 useRouter 的四种导航方式与 Link 的 prefetch 对照:
 * - 实时显示当前 pathname,验证 push 与 replace 对历史栈的不同影响
 * - push:新增一条历史记录,可 back 回来
 * - replace:替换当前记录,back 会跳过它
 * - back:后退;refresh:丢弃 Router Cache 强制重取本段 RSC 载荷
 * - 对照链接:prefetch={false} 的 Link 不会在进入视口时预取
 *
 * @module topics/router/navigation/components/NavigationPlayground
 * @client
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function NavigationPlayground() {
    const router = useRouter();
    const pathname = usePathname();
    // refresh 没有完成回调,本地时间戳只作「已触发」的即时反馈
    const [refreshedAt, setRefreshedAt] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            {/* 当前路径指示:验证 push/replace 后地址栏与历史栈的变化 */}
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                当前 pathname:
                <code className="mx-1 rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-sky-700 dark:bg-neutral-800 dark:text-sky-300">
                    {pathname}
                </code>
            </p>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => router.push("/router/conventions")}
                    className="rounded-lg bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:hover:bg-sky-900/70"
                >
                    push → /router/conventions
                </button>
                <button
                    onClick={() => router.replace("/router/conventions")}
                    className="rounded-lg bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/70"
                >
                    replace → /router/conventions
                </button>
                <button
                    onClick={() => router.back()}
                    className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                    back()
                </button>
                <button
                    onClick={() => {
                        router.refresh();
                        setRefreshedAt(new Date().toISOString().slice(11, 19));
                    }}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                    refresh() 重取本页
                </button>
            </div>

            {/* prefetch 对照:两个链接指向同一目标,差别只在预取行为 */}
            <div className="rounded-xl border border-neutral-200/60 p-4 dark:border-neutral-800/60">
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    prefetch 对照(打开 DevTools Network,先清空,再滚动让链接进入视口)
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                    <Link
                        href="/router/dynamic-routes"
                        className="rounded-lg border border-sky-200 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-950/40"
                    >
                        默认 Link(自动预取)
                    </Link>
                    <Link
                        href="/router/dynamic-routes"
                        prefetch={false}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
                    >
                        prefetch={false}(点击才请求)
                    </Link>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    生产构建下,默认 Link 进入视口就会预取目标路由的 RSC 载荷;
                    prefetch={false} 的链接只有真正点击时才发请求 —— 两者目标相同,时机不同。
                </p>
            </div>

            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                历史栈实验:先 push 一次再 back,能回到本页;先 replace 再 back,
                本页这条记录已被替换,会直接退到更早的页面。
                {refreshedAt && (
                    <span className="mt-1 block text-indigo-600 dark:text-indigo-400">
                        已于 {refreshedAt} UTC 调用 refresh(),Network 面板应出现一次新的 RSC 请求
                    </span>
                )}
            </p>
        </div>
    );
}
