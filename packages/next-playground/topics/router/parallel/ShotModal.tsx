/**
 * ============================================================================
 * ShotModal — 拦截路由里的弹层
 * ============================================================================
 *
 * 从列表用 Link 点进来时,这条 URL 被 (.)shot 拦截,渲染成弹层,
 * 底下的列表保持挂载。硬导航(地址栏回车、刷新)不会走到这里。
 *
 * @module topics/router/parallel/ShotModal
 * @client
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { Shot } from "./shots";

/**
 * @param shot - 当前镜头。关闭用 router.back(),回到拦截前的列表 URL
 */
export function ShotModal({ shot }: { shot: Shot }) {
    const router = useRouter();

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                router.back();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [router]);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-4 sm:items-center"
            onClick={() => router.back()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="shot-modal-title"
                className="w-full max-w-md border border-rule bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900"
                onClick={(event) => event.stopPropagation()}
            >
                <p className="font-mono text-[11px] tracking-[0.18em] text-copper-600 dark:text-copper-400">
                    拦截中 · 弹层
                </p>
                <h2 id="shot-modal-title" className="font-display mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink dark:text-neutral-50">
                    {shot.label}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {shot.decision}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    列表还在这层下面。刷新,或用下面的硬导航,会看到同一条 URL 的完整页。
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-ink"
                    >
                        回到列表
                    </button>
                    <a
                        href={`/router/parallel/shot/${shot.id}`}
                        className="text-sm text-ink underline decoration-copper-500 underline-offset-4 dark:text-neutral-100"
                    >
                        硬导航到完整页
                    </a>
                </div>
            </div>
        </div>
    );
}
