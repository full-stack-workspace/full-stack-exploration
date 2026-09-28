/**
 * ============================================================================
 * RouterCacheDemo — Router Cache 交互演示(Client)
 * ============================================================================
 *
 * Router Cache 是客户端内存里的 RSC 载荷缓存:访问过的路由会被记住,
 * 前进/后退导航直接复用,不向服务器重新取数。
 *
 * 演示方式:
 * - 两个 Link 跳到其他专题页,再用浏览器前进/后退回来:
 *   缓存命中时页面秒开、无网络请求(DevTools Network 无文档请求)
 * - 「router.refresh()」按钮:主动丢弃当前路由的缓存并重新向服务器
 *   请求 RSC 载荷 —— 这是客户端唯一「强制重取」的旋钮
 *
 * @module topics/data/cache-layers/components/RouterCacheDemo
 * @client
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RouterCacheDemo() {
    const router = useRouter();
    // refresh 没有完成回调,用本地状态给个即时反馈提示用户观察 Network
    const [refreshedAt, setRefreshedAt] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Link
                    href="/data/route-handlers"
                    className="rounded-lg bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/70"
                >
                    去 Route Handler 页 →
                </Link>
                <Link
                    href="/rendering/isr"
                    className="rounded-lg bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/70"
                >
                    去 ISR 页 →
                </Link>
                <button
                    onClick={() => {
                        router.refresh();
                        setRefreshedAt(new Date().toISOString().slice(11, 19));
                    }}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                    router.refresh() 强制重取本页
                </button>
            </div>
            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                操作路径:点上面任一链接离开,再按浏览器「后退」回来 —— 打开
                DevTools Network 对照:后退命中 Router Cache,不产生新的文档/RSC 请求;
                点 refresh 按钮则会立刻看到一次新的 RSC 载荷请求。
                {refreshedAt && (
                    <span className="mt-1 block text-indigo-600 dark:text-indigo-400">
                        已于 {refreshedAt} UTC 调用 refresh(),请观察 Network 面板
                    </span>
                )}
            </p>
        </div>
    );
}
