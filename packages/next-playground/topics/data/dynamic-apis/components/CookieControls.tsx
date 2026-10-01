/**
 * ============================================================================
 * CookieControls — 写/清演示 cookie 的按钮(Client)
 * ============================================================================
 *
 * 两个 <form action> 分别绑定设置与清除 action,保持渐进增强。
 * action 内部 refresh() 让本页重取,上方 CookiePanel 的读值随响应更新。
 *
 * @module topics/data/dynamic-apis/components/CookieControls
 * @client
 */

"use client";

import { useFormStatus } from "react-dom";

import { clearDemoCookie, setDemoCookie } from "../actions";

function SetButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
            {pending ? "写入中…" : "cookies().set 写入"}
        </button>
    );
}

function ClearButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
            {pending ? "清除中…" : "cookies().delete 清除"}
        </button>
    );
}

export function CookieControls() {
    return (
        <div className="flex flex-wrap gap-3">
            <form action={setDemoCookie}>
                <SetButton />
            </form>
            <form action={clearDemoCookie}>
                <ClearButton />
            </form>
        </div>
    );
}
