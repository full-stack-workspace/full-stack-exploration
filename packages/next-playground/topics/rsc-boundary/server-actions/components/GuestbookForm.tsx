/**
 * ============================================================================
 * GuestbookForm — 留言表单(Client)
 * ============================================================================
 *
 * 用 useActionState 把 Server Action 绑定到 <form action>:
 * - JS 可用时:提交不刷新页面,返回的 state 驱动 pending/报错提示
 * - JS 不可用时:表单退化为原生 POST,Action 照常执行(渐进增强)
 *
 * 这里只用了一小片 Client 叶子;留言列表仍由 Server Component 渲染。
 *
 * @module topics/rsc-boundary/server-actions/components/GuestbookForm
 * @client
 */

"use client";

import { useActionState } from "react";

import { postMessage } from "../actions";
import { MESSAGE_MAX_LENGTH, type MessageActionState } from "../store";

/** 表单初始状态:尚未提交 */
const INITIAL_STATE: MessageActionState = { ok: false, error: null };

export function GuestbookForm() {
    // isPending 在 action 执行期间为 true,用于禁用按钮防止重复提交
    const [state, formAction, isPending] = useActionState(
        postMessage,
        INITIAL_STATE,
    );

    return (
        <form action={formAction} className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
                <input
                    name="author"
                    type="text"
                    placeholder="昵称(可留空,默认匿名)"
                    maxLength={20}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-indigo-400 sm:w-48 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-indigo-600"
                />
                <input
                    name="content"
                    type="text"
                    required
                    maxLength={MESSAGE_MAX_LENGTH}
                    placeholder={`写点什么…(最多 ${MESSAGE_MAX_LENGTH} 字)`}
                    className="w-full flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-indigo-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-indigo-600"
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-indigo-500 disabled:opacity-50"
                >
                    {isPending ? "提交中…" : "提交"}
                </button>
            </div>
            {state.error && (
                <p className="text-xs text-rose-600 dark:text-rose-400">
                    {state.error}
                </p>
            )}
            {state.ok && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    提交成功,列表已由服务端重新渲染
                </p>
            )}
        </form>
    );
}
