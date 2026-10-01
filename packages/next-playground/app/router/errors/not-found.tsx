/**
 * ============================================================================
 * 段级未找到 — /router/errors 的活演示
 * ============================================================================
 *
 * notFound() 渲染这份 UI,而不是 error.tsx。
 * 不需要 "use client":这里没有重试状态。
 *
 * @module app/router/errors/not-found
 */

import Link from "next/link";

export default function SegmentNotFound() {
    return (
        <div className="mx-auto max-w-6xl">
            <p className="font-mono text-[11px] tracking-[0.18em] text-signal-600 dark:text-signal-400">
                not-found.tsx
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink dark:text-neutral-50">
                这条路由没有对应的页面
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                /router/errors/missing 调用了 notFound()。这是预期中的空,不是渲染崩溃,所以 error.tsx 没有出现。
            </p>
            <Link
                href="/router/errors"
                className="mt-6 inline-flex text-sm font-medium text-ink underline decoration-signal-500 underline-offset-4 dark:text-neutral-100"
            >
                回到错误与未找到
            </Link>
        </div>
    );
}
