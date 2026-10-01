/**
 * ============================================================================
 * RawStreamViewer — UI Message Stream 原始协议帧查看器(Client)
 * ============================================================================
 *
 * 绕过 useChat,直接 fetch POST /api/ai/sdk-chat,把响应体按原文
 * 逐 chunk 摊开 —— 让读者看到 SDK 客户端替他们解析的协议帧长什么样。
 *
 * 注意:这里的手写 reader 循环是「演示协议」而不是「替代 useChat」;
 * 它只读不解,恰好反衬 useChat 在背后做了多少事(分帧、半帧拼接、
 * 帧类型分发、消息合并)。
 *
 * @module topics/ai-native/ai-sdk/components/RawStreamViewer
 * @client
 */

"use client";

import { useEffect, useRef, useState } from "react";

/** 与 useChat 的 DefaultChatTransport 同构的最小请求体 */
const DEMO_BODY = {
    messages: [
        {
            id: "raw-demo",
            role: "user",
            parts: [{ type: "text", text: "展示协议帧" }],
        },
    ],
};

export function RawStreamViewer() {
    const [raw, setRaw] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // AbortController 存 ref:取消动作不需要触发渲染
    const abortRef = useRef<AbortController | null>(null);

    // 卸载清理:中途导航离开要中断 fetch
    useEffect(() => () => abortRef.current?.abort(), []);

    /** 抓一轮原始协议帧:读流但不解析,原样拼到展示区 */
    const capture = async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setRaw("");
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/ai/sdk-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(DEMO_BODY),
                signal: controller.signal,
            });
            if (!res.ok || !res.body) {throw new Error(`HTTP ${res.status}`);}

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            for (;;) {
                const { done, value } = await reader.read();
                if (done) {break;}
                setRaw((prev) => prev + decoder.decode(value, { stream: true }));
            }
        } catch (err) {
            if (!controller.signal.aborted) {
                setError(err instanceof Error ? err.message : String(err));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={capture}
                    disabled={loading}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "抓取中……" : "抓取一轮原始协议帧"}
                </button>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    POST 与聊天框同一个端点,但读流不解析 —— 看到的就是 useChat 收到的原文
                </p>
            </div>

            {error && (
                <p className="text-sm text-rose-600 dark:text-rose-400">请求失败:{error}</p>
            )}

            {raw && (
                <pre className="max-h-72 overflow-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
                    {raw}
                </pre>
            )}
        </div>
    );
}
