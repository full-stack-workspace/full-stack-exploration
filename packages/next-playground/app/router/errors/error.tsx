/**
 * ============================================================================
 * 段级错误边界 — /router/errors 的活演示
 * ============================================================================
 *
 * 必须是 Client Component:reset() 依赖客户端的 Error Boundary。
 * 它替换的是这一段的 page,根布局(顶栏、侧边栏)仍然挂着。
 *
 * @module app/router/errors/error
 * @client
 */

"use client";

export default function SegmentError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="mx-auto max-w-6xl">
            <p className="font-mono text-[11px] tracking-[0.18em] text-signal-600 dark:text-signal-400">
                error.tsx
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink dark:text-neutral-50">
                这一段渲染失败了
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {error.message}
            </p>
            <button
                type="button"
                onClick={reset}
                className="mt-6 rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-ink"
            >
                重试这一段
            </button>
        </div>
    );
}
