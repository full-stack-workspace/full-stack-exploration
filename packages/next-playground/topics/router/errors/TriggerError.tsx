/**
 * ============================================================================
 * TriggerError — 在渲染期抛错,交给本段 error.tsx
 * ============================================================================
 *
 * 点击后在渲染阶段抛出。事件回调里的异常不会进 error.tsx,
 * 所以这里用 state 把「点击」变成下一次渲染的抛错。
 *
 * @module topics/router/errors/TriggerError
 * @client
 */

"use client";

import { useState } from "react";

export function TriggerError() {
    const [boom, setBoom] = useState(false);
    if (boom) {
        throw new Error("演示错误:这一段的 error.tsx 接住了它,壳层还在。");
    }

    return (
        <button
            type="button"
            onClick={() => setBoom(true)}
            className="rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-ink dark:hover:bg-white"
        >
            触发这一段的渲染错误
        </button>
    );
}
