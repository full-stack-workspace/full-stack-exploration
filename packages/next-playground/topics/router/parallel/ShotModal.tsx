/**
 * ============================================================================
 * ShotModal — 拦截路由里的弹层
 * ============================================================================
 *
 * 从列表用 Link 点进来时,这条 URL 被 (.)shot 拦截,渲染成弹层,
 * 底下的列表保持挂载。硬导航(地址栏回车、刷新)不会走到这里。
 *
 * 焦点管理(手写精简版,教学用):
 * - 打开时焦点移进弹层,关闭后归还给触发前的元素
 * - Tab / Shift+Tab 在弹层内的可聚焦元素间循环(焦点圈定)
 * - 弹层挂载期间,body 下其余分支挂 inert + aria-hidden,背景不可聚焦不可读
 * - Esc 关闭
 * 生产环境别手写这套:边界(portal、嵌套弹层、焦点还原竞态)很多,
 * 直接用 radix / headless ui 等库的焦点陷阱。
 *
 * @module topics/router/parallel/ShotModal
 * @client
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import type { Shot } from "./shots";

/**
 * @param shot - 当前镜头。关闭用 router.back(),回到拦截前的列表 URL
 */
export function ShotModal({ shot }: { shot: Shot }) {
    const router = useRouter();
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) {return;}

        // 记录打开前的焦点,关闭时归还,否则键盘用户会「丢位置」
        const previouslyFocused =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
        // 初始焦点进弹层容器本身(tabIndex=-1 使 div 可编程聚焦)
        dialog.focus();

        // 背景屏蔽:body 直接子元素里,除弹层所在分支外全部挂 inert + aria-hidden,
        // 同时挡住指针交互、Tab 聚焦与读屏器遍历
        const hiddenSiblings: HTMLElement[] = [];
        for (const child of Array.from(document.body.children)) {
            if (child instanceof HTMLElement && !child.contains(dialog)) {
                child.setAttribute("inert", "");
                child.setAttribute("aria-hidden", "true");
                hiddenSiblings.push(child);
            }
        }

        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                router.back();
                return;
            }
            if (event.key !== "Tab") {return;}
            // 焦点圈定:在弹层内可聚焦元素首尾之间循环
            const focusables = dialog.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            );
            if (focusables.length === 0) {return;}
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        window.addEventListener("keydown", onKey);

        return () => {
            window.removeEventListener("keydown", onKey);
            // 还原背景与焦点,顺序无关但都不可省
            for (const el of hiddenSiblings) {
                el.removeAttribute("inert");
                el.removeAttribute("aria-hidden");
            }
            previouslyFocused?.focus();
        };
    }, [router]);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-4 sm:items-center"
            onClick={() => router.back()}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="shot-modal-title"
                tabIndex={-1}
                className="w-full max-w-md border border-rule bg-white p-6 outline-none dark:border-neutral-700 dark:bg-neutral-900"
                onClick={(event) => event.stopPropagation()}
            >
                <p className="font-mono text-[11px] tracking-[0.18em] text-signal-600 dark:text-signal-400">
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
                        className="text-sm text-ink underline decoration-signal-500 underline-offset-4 dark:text-neutral-100"
                    >
                        硬导航到完整页
                    </a>
                </div>
            </div>
        </div>
    );
}
