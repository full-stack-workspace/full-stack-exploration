/**
 * ============================================================================
 * StreamPlayground — 真实 SSE 流式演练(Client)
 * ============================================================================
 *
 * fetch('/api/ai/stream') 后用 res.body.getReader() 逐 chunk 解码,
 * 按 SSE 空行分帧、解析 `data:` 行,把 token 追加到渲染区。
 *
 * 观测指标：
 * - TTFT(首 token 时间):发起请求到第一个 chunk 到达
 * - 总耗时:发起请求到 [DONE]
 * - 已收 token 数:直观感受「边生成边渲染」
 *
 * 取消 = AbortController 中断 fetch,服务端 cancel 回调停止推送
 * (真实场景同步停掉上游 LLM 调用 = 省计费)。
 *
 * @module topics/ai-native/streaming-endpoint/components/StreamPlayground
 * @client
 */

"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** 演练状态机:idle → streaming → done | aborted */
type Phase = "idle" | "streaming" | "done" | "aborted";

const PHASE_LABEL: Record<Phase, string> = {
    idle: "待开始",
    streaming: "流式生成中",
    done: "已完成",
    aborted: "已取消",
};

const PHASE_STYLE: Record<Phase, string> = {
    idle: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
    streaming: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    aborted: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

/** 单个 SSE 事件的载荷(与服务端 route.ts 的契约) */
interface TokenEvent {
    token: string;
}

/** 毫秒 → 展示文本;null 表示尚未产生 */
const fmtMs = (ms: number | null) => (ms === null ? "—" : `${ms.toFixed(0)} ms`);

export function StreamPlayground() {
    const [phase, setPhase] = useState<Phase>("idle");
    const [text, setText] = useState("");
    const [tokenCount, setTokenCount] = useState(0);
    const [ttft, setTtft] = useState<number | null>(null);
    const [total, setTotal] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    // AbortController 存 ref:取消动作不需要触发渲染
    const abortRef = useRef<AbortController | null>(null);

    /** 开始一轮流式请求 */
    const start = async () => {
        // 重复点击时先中断上一轮,避免两条流交错写同一渲染区
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setPhase("streaming");
        setText("");
        setTokenCount(0);
        setTtft(null);
        setTotal(null);
        setError(null);

        const startedAt = performance.now();
        // TTFT 只记一次:用局部变量判断,setState 是异步的
        let firstChunkAt: number | null = null;

        try {
            const res = await fetch("/api/ai/stream", { signal: controller.signal });
            if (!res.ok || !res.body) {throw new Error(`HTTP ${res.status}`);}

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            // 跨 chunk 的不完整 SSE 帧留在 buffer,等下一 chunk 补齐
            let buffer = "";

            for (;;) {
                const { done, value } = await reader.read();
                if (done) {break;}
                if (firstChunkAt === null) {
                    firstChunkAt = performance.now();
                    setTtft(firstChunkAt - startedAt);
                }
                buffer += decoder.decode(value, { stream: true });

                // SSE 帧以空行分隔;pop 出的尾段可能不完整,留给下一轮
                const frames = buffer.split("\n\n");
                buffer = frames.pop() ?? "";
                for (const frame of frames) {
                    const line = frame.trim();
                    if (!line.startsWith("data:")) {continue;}
                    const data = line.slice(5).trim();
                    if (data === "[DONE]") {continue;}
                    const { token } = JSON.parse(data) as TokenEvent;
                    setText((prev) => prev + token);
                    setTokenCount((n) => n + 1);
                }
            }

            setTotal(performance.now() - startedAt);
            setPhase("done");
        } catch (err) {
            if (controller.signal.aborted) {
                // 主动取消:记录已用时长,说明服务端此刻停止了推送
                setTotal(performance.now() - startedAt);
                setPhase("aborted");
            } else {
                setError(err instanceof Error ? err.message : String(err));
                setPhase("idle");
            }
        }
    };

    /** 取消:中断 fetch,服务端 ReadableStream 的 cancel 回调随之触发 */
    const cancel = () => abortRef.current?.abort();

    return (
        <div className="space-y-4">
            {/* 操作行:开始 / 取消 */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={start}
                    disabled={phase === "streaming"}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    开始流式生成
                </button>
                <button
                    type="button"
                    onClick={cancel}
                    disabled={phase !== "streaming"}
                    className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-rose-400 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-rose-600 dark:hover:text-rose-400"
                >
                    取消
                </button>
                <span className={cn("rounded-full px-3 py-1 text-xs font-medium", PHASE_STYLE[phase])}>
                    {PHASE_LABEL[phase]}
                </span>
            </div>

            {/* 指标行:TTFT / 总耗时 / token 数 */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "TTFT 首 token", value: fmtMs(ttft) },
                    { label: phase === "aborted" ? "已用时长(取消)" : "总耗时", value: fmtMs(total) },
                    { label: "已收 token", value: String(tokenCount) },
                ].map((m) => (
                    <div
                        key={m.label}
                        className="rounded-xl border border-neutral-200/60 p-3 dark:border-neutral-800/60"
                    >
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">{m.label}</p>
                        <p className="mt-1 font-mono text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                            {m.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* 渲染区:token 逐个追加;流式中显示光标 */}
            <div className="min-h-32 rounded-xl border border-neutral-200/60 bg-neutral-50/60 p-4 dark:border-neutral-800/60 dark:bg-neutral-950/60">
                {error ? (
                    <p className="text-sm text-rose-600 dark:text-rose-400">请求失败:{error}</p>
                ) : text ? (
                    <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                        {text}
                        {phase === "streaming" && (
                            <span className="ml-0.5 inline-block h-4 w-2 animate-pulse rounded-sm bg-violet-500 align-text-bottom" />
                        )}
                    </p>
                ) : (
                    <p className="text-sm text-neutral-400 dark:text-neutral-500">
                        点击「开始流式生成」,观察 token 逐个到达 —— 也可以半路点「取消」
                    </p>
                )}
            </div>

            <p className="text-xs text-neutral-400 dark:text-neutral-500">
                打开 DevTools Network 面板看 /api/ai/stream:响应类型是 EventStream,chunk 随时间逐个到达,而不是一次性下载
            </p>
        </div>
    );
}
