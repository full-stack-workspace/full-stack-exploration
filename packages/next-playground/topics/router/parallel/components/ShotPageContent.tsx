/**
 * ============================================================================
 * ShotPageContent — 镜头完整页内容(Server Component)
 * ============================================================================
 *
 * 硬导航/刷新 /router/parallel/shot/[id] 时渲染的完整页内容,
 * 与拦截时弹层(ShotModal)展示同一条镜头的不同形态。
 *
 * 按包约定,展示性内容放在 topics/ 下,app/ 薄壳只留 metadata 与渲染。
 *
 * @module topics/router/parallel/components/ShotPageContent
 */

import Link from "next/link";

import type { Shot } from "../shots";

/**
 * @param shot - 当前镜头(由薄壳查好并处理 notFound 后传入)
 */
export function ShotPageContent({ shot }: { shot: Shot }) {
    return (
        <div className="mx-auto max-w-6xl">
            <p className="font-mono text-[11px] tracking-[0.18em] text-signal-600 dark:text-signal-400">
                完整页 · 未被拦截
            </p>
            <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.03em] text-ink dark:text-neutral-50">
                {shot.label}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {shot.decision}
                你是直接打开这条 URL 的,所以没有弹层,列表也不在这下面。
            </p>
            <Link
                href="/router/parallel"
                className="mt-6 inline-flex text-sm font-medium text-ink underline decoration-signal-500 underline-offset-4 dark:text-neutral-100"
            >
                回到列表
            </Link>
        </div>
    );
}
