/**
 * ============================================================================
 * InvalidateButtons — 两种失效语义的触发按钮(Client)
 * ============================================================================
 *
 * 两个 <form action> 各绑定一个 Server Action,保持渐进增强:
 * 无 JS 时退化为原生 POST,失效照样发生(只是少了 pending 反馈)。
 *
 * 交互叶子的唯一职责是按 pending 禁用按钮;「点击后该看到什么」
 * 的解释文案是静态的,留在按钮下方 —— 时间戳的差异由用户刷新观察,
 * 不需要组件状态参与。
 *
 * @module topics/data/revalidation/components/InvalidateButtons
 * @client
 */

"use client";

import { useFormStatus } from "react-dom";

import {
    invalidateWithRevalidateTag,
    invalidateWithUpdateTag,
} from "../actions";

/**
 * 提交按钮。useFormStatus 必须是 <form> 的子孙,
 * 读父表单本次提交的 pending,不需要 props 透传。
 */
function TriggerButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
            {pending ? "失效中…" : label}
        </button>
    );
}

export function InvalidateButtons() {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <form
                action={invalidateWithRevalidateTag}
                className="rounded-xl border border-neutral-200/60 p-4 dark:border-neutral-800/60"
            >
                <TriggerButton label='revalidateTag(tag, "max")' />
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    <strong>stale-while-revalidate</strong>:点击后本页立刻重取,
                    但拿到的仍是<strong>旧时间戳</strong>(旧值先回、后台重建);
                    再手动刷新一次,新时间戳才出现。
                </p>
            </form>
            <form
                action={invalidateWithUpdateTag}
                className="rounded-xl border border-neutral-200/60 p-4 dark:border-neutral-800/60"
            >
                <TriggerButton label="updateTag(tag)" />
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    <strong>立即过期</strong>:只能在 Server Action 里调用;
                    点击后本页重取会等缓存重建完成,
                    响应里直接就是<strong>新时间戳</strong>(read-your-own-writes)。
                </p>
            </form>
        </div>
    );
}
