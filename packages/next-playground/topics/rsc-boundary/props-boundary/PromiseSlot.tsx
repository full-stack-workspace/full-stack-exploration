/**
 * ============================================================================
 * PromiseSlot — 用 use() 解开服务端传来的 Promise
 * ============================================================================
 *
 * 函数跨不过 Server/Client 边界,Promise 可以。
 * 调用 use() 会让本组件挂起,由外层 Suspense 显示占位。
 *
 * @module topics/rsc-boundary/props-boundary/PromiseSlot
 * @client
 */

"use client";

import { use } from "react";

/**
 * @param note - 服务端创建、尚未完成的说明文字
 */
export function PromiseSlot({ note }: { note: Promise<string> }) {
    const text = use(note);
    return (
        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {text}
        </p>
    );
}
