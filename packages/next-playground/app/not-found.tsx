/**
 * ============================================================================
 * 根级 404 — 这条路径不在尺子上
 * ============================================================================
 *
 * 未匹配路由与 notFound() 的全站兜底 UI。
 * Server Component 即可:纯链接,没有重试状态。
 *
 * @module app/not-found
 */

import Link from "next/link";

/** 与 BrandMark 同款的五格刻度,404 页只用纯 div 画,避免依赖客户端 id */
const BARS = [14, 20, 26, 32, 38];

export default function NotFound() {
    return (
        <div className="mx-auto max-w-6xl">
            <div className="flex h-12 items-end gap-1.5" aria-hidden="true">
                {BARS.map((h, index) => (
                    <span
                        key={h}
                        className={
                            index === BARS.length - 1
                                ? "w-1.5 rounded-sm bg-signal"
                                : "w-1.5 rounded-sm bg-ink/70 dark:bg-neutral-200/80"
                        }
                        style={{ height: `${h * 2}px` }}
                    />
                ))}
            </div>
            <p className="mt-6 font-mono text-[11px] tracking-[0.18em] text-signal-600 dark:text-signal-400">
                404 · not-found.tsx
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-ink dark:text-neutral-50">
                这条路径不在尺子上
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                地址可能已随品牌改版迁移,也可能从未存在。回首页从光谱尺子重新选,或直接看完整专题目录。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
                <Link
                    href="/"
                    className="inline-flex rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-signal-600 dark:bg-neutral-100 dark:text-ink dark:hover:bg-signal-400"
                >
                    回到首页
                </Link>
                <Link
                    href="/rendering/spectrum"
                    transitionTypes={["nav-forward"]}
                    className="text-sm font-medium text-ink underline decoration-signal decoration-1 underline-offset-4 hover:text-signal-600 dark:text-neutral-100 dark:hover:text-signal-400"
                >
                    看渲染光谱目录
                </Link>
            </div>
        </div>
    );
}
