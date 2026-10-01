/**
 * ============================================================================
 * AfterDemo — after()「响应后执行」的客户端演示(Client)
 * ============================================================================
 *
 * 操作路径:
 * 1. 「读取当前计数」GET /api/after-demo,记下 delayedWrites
 * 2. 「POST 一次」→ 响应立即返回,body 里 delayedWritesAtResponse 是旧值
 * 3. 组件等 400ms 后自动再 GET 一次:计数 +1 ——
 *    写入发生在响应发出之后,这正是 after() 的语义证据
 *
 * after() 不读请求数据、不影响渲染缓存,只是「响应后的收尾任务通道」,
 * 因此它不受 Suspense 边界规则约束(本格是 Client fetch 演示,
 * 面板本体也不在请求时取数)。
 *
 * @module topics/data/dynamic-apis/components/AfterDemo
 * @client
 */

"use client";

import { useState } from "react";

/** 一次 POST 实验的完整观测记录 */
interface AfterObservation {
    /** POST 响应体里记录的「响应发出那一刻」的计数 */
    atResponse: number;
    /** 400ms 后重读到的计数(应 = atResponse + 1) */
    afterDelay: number | null;
}

export function AfterDemo() {
    const [count, setCount] = useState<number | null>(null);
    const [observation, setObservation] = useState<AfterObservation | null>(null);
    const [pending, setPending] = useState(false);

    const readCount = async () => {
        const res = await fetch("/api/after-demo");
        const data = (await res.json()) as { delayedWrites: number };
        setCount(data.delayedWrites);
    };

    const triggerPost = async () => {
        setPending(true);
        try {
            const res = await fetch("/api/after-demo", { method: "POST" });
            const data = (await res.json()) as {
                delayedWritesAtResponse: number;
            };
            setObservation({
                atResponse: data.delayedWritesAtResponse,
                afterDelay: null,
            });
            // after() 回调里人为延迟了 300ms,等 400ms 再读必能看到 +1
            await new Promise((resolve) => setTimeout(resolve, 400));
            const check = await fetch("/api/after-demo");
            const checked = (await check.json()) as { delayedWrites: number };
            setCount(checked.delayedWrites);
            setObservation({
                atResponse: data.delayedWritesAtResponse,
                afterDelay: checked.delayedWrites,
            });
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={readCount}
                    className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                    读取当前计数
                </button>
                <button
                    onClick={triggerPost}
                    disabled={pending}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                    {pending ? "等待 after 落账…" : "POST 触发一次延迟写入"}
                </button>
                {count !== null && (
                    <p className="font-mono text-xs text-neutral-600 dark:text-neutral-300">
                        delayedWrites = {count}
                    </p>
                )}
            </div>
            {observation && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs leading-relaxed text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                    <p>
                        响应体里的计数:<strong>{observation.atResponse}</strong>
                        (响应发出那一刻,after 尚未执行)
                    </p>
                    <p className="mt-1">
                        400ms 后重读:
                        <strong>
                            {observation.afterDelay ?? "读取中…"}
                        </strong>
                        {observation.afterDelay !== null &&
                            observation.afterDelay > observation.atResponse &&
                            " —— +1 已落账,写入确实发生在响应之后"}
                    </p>
                </div>
            )}
        </div>
    );
}
