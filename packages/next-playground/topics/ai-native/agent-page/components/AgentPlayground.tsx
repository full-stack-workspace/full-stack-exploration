/**
 * ============================================================================
 * AgentPlayground — Agent 长任务演练(Client)
 * ============================================================================
 *
 * GET /api/ai/agent 用 SSE 推送步骤事件,本组件渲染步骤时间线:
 * 每步 pending → running → done(或 skipped),带到达时间戳。
 *
 * 三个对照开关：
 * - 串行 vs 并行:工具调用阶段 3×800ms vs max 800ms,墙钟对比
 * - 跳过校验:墙钟减半但产出未经核对(「快但错」的取舍)
 * - 取消:AbortController 中断 fetch,服务端感知后停止后续步骤(省计费)
 *
 * @module topics/ai-native/agent-page/components/AgentPlayground
 * @client
 */

"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* =================================================================
 * 契约与常量(与服务端 app/api/ai/agent/route.ts 对齐)
 * ================================================================ */

/** 步骤事件载荷(SSE data 行的 JSON) */
interface StepEvent {
    step: string;
    status: "running" | "done" | "skipped";
    detail: string;
    /** 相对流开始的毫秒数,直接渲染为时间戳 */
    elapsed: number;
}

/** 固定步骤清单:前端预置,事件按 id 驱动状态迁移 */
const STEPS = [
    { id: "plan", label: "规划任务" },
    { id: "rag", label: "检索(RAG)" },
    { id: "tool-search", label: "工具 · 搜索文档" },
    { id: "tool-calc", label: "工具 · 计算指标" },
    { id: "tool-db", label: "工具 · 查询数据库" },
    { id: "validate", label: "结果校验" },
    { id: "summary", label: "汇总输出" },
] as const;

type StepId = (typeof STEPS)[number]["id"];
type StepStatus = "pending" | "running" | "done" | "skipped";

interface StepState {
    status: StepStatus;
    detail?: string;
    /** 到达时间(相对流开始,秒) */
    at?: number;
}

type Phase = "idle" | "running" | "done" | "aborted";

const STATUS_STYLE: Record<StepStatus, { dot: string; text: string; label: string }> = {
    pending: { dot: "bg-neutral-300 dark:bg-neutral-700", text: "text-neutral-400", label: "等待" },
    running: { dot: "bg-violet-500 animate-pulse", text: "text-violet-600 dark:text-violet-400", label: "进行中" },
    done: { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "完成" },
    skipped: { dot: "bg-amber-400", text: "text-amber-600 dark:text-amber-400", label: "已跳过" },
};

/** 初始状态:全部 pending */
const initialSteps = (): Record<StepId, StepState> =>
    Object.fromEntries(STEPS.map((s) => [s.id, { status: "pending" }])) as Record<StepId, StepState>;

/** 秒级时间戳格式化 */
const fmtSec = (ms: number) => `+${(ms / 1000).toFixed(2)}s`;

export function AgentPlayground() {
    const [mode, setMode] = useState<"serial" | "parallel">("parallel");
    const [skipValidate, setSkipValidate] = useState(false);
    const [phase, setPhase] = useState<Phase>("idle");
    const [steps, setSteps] = useState<Record<StepId, StepState>>(initialSteps);
    const [wallClock, setWallClock] = useState<number | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    /** 消费 SSE 步骤事件流,驱动时间线状态迁移 */
    const consume = async (res: Response) => {
        if (!res.body) {throw new Error("响应无 body");}
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
            const { done, value } = await reader.read();
            if (done) {break;}
            buffer += decoder.decode(value, { stream: true });
            const frames = buffer.split("\n\n");
            buffer = frames.pop() ?? "";
            for (const frame of frames) {
                const line = frame.trim();
                if (!line.startsWith("data:")) {continue;}
                const data = line.slice(5).trim();
                if (data === "[DONE]") {continue;}
                const evt = JSON.parse(data) as StepEvent;
                setSteps((prev) => ({
                    ...prev,
                    [evt.step]: { status: evt.status, detail: evt.detail, at: evt.elapsed },
                }));
            }
        }
    };

    /** 启动一轮 Agent 任务 */
    const start = async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setSteps(initialSteps());
        setPhase("running");
        setWallClock(null);
        const startedAt = performance.now();

        try {
            const res = await fetch(
                `/api/ai/agent?mode=${mode}${skipValidate ? "&skipValidate=1" : ""}`,
                { signal: controller.signal },
            );
            if (!res.ok) {throw new Error(`HTTP ${res.status}`);}
            await consume(res);
            setWallClock(performance.now() - startedAt);
            setPhase("done");
        } catch {
            if (controller.signal.aborted) {
                // 取消:剩余步骤停在 running/pending,直观看到「后面不再执行」
                setWallClock(performance.now() - startedAt);
                setPhase("aborted");
            } else {
                setPhase("idle");
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* 控制行:模式开关 + 跳过校验 + 开始/取消 */}
            <div className="flex flex-wrap items-center gap-3">
                {/* 串行 vs 并行分段开关 */}
                <div className="flex rounded-xl border border-neutral-300 p-0.5 dark:border-neutral-700">
                    {(
                        [
                            { value: "serial", label: "串行 3×800ms" },
                            { value: "parallel", label: "并行 max 800ms" },
                        ] as const
                    ).map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMode(opt.value)}
                            disabled={phase === "running"}
                            className={cn(
                                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed",
                                mode === opt.value
                                    ? "bg-violet-600 text-white"
                                    : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200",
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* 跳过校验:「快但错」取舍 */}
                <button
                    type="button"
                    onClick={() => setSkipValidate((v) => !v)}
                    disabled={phase === "running"}
                    className={cn(
                        "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                        skipValidate
                            ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
                            : "border-neutral-300 text-neutral-500 hover:text-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200",
                    )}
                >
                    {skipValidate ? "已跳过校验(快但可能错)" : "包含校验步骤(慢但对)"}
                </button>

                <button
                    type="button"
                    onClick={() => void start()}
                    disabled={phase === "running"}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    开始任务
                </button>
                <button
                    type="button"
                    onClick={() => abortRef.current?.abort()}
                    disabled={phase !== "running"}
                    className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-rose-400 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-rose-600 dark:hover:text-rose-400"
                >
                    取消
                </button>

                {wallClock !== null && (
                    <span className="rounded-full bg-neutral-100 px-3 py-1 font-mono text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        墙钟 {fmtSec(wallClock)}
                        {phase === "aborted" && "(已取消)"}
                    </span>
                )}
            </div>

            {/* 步骤时间线 */}
            <ol className="space-y-1.5">
                {STEPS.map((step) => {
                    const state = steps[step.id];
                    const style = STATUS_STYLE[state.status];
                    return (
                        <li
                            key={step.id}
                            className="flex items-center gap-3 rounded-xl border border-neutral-200/60 px-4 py-2.5 dark:border-neutral-800/60"
                        >
                            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", style.dot)} />
                            <span className="w-32 shrink-0 text-sm font-medium text-neutral-800 dark:text-neutral-100">
                                {step.label}
                            </span>
                            <span className={cn("min-w-0 flex-1 truncate text-xs", style.text)}>
                                {state.detail ?? style.label}
                            </span>
                            <span className="shrink-0 font-mono text-xs text-neutral-400 dark:text-neutral-500">
                                {state.at !== undefined ? fmtSec(state.at) : ""}
                            </span>
                        </li>
                    );
                })}
            </ol>

            <p className="text-xs text-neutral-400 dark:text-neutral-500">
                对照提示:并行把工具阶段墙钟从 ~2.4s 压到 ~0.8s,跳过校验再省 ~0.4s ——
                但跳过的代价是产出未经核对,「快但错」在 Agent 场景通常比「慢但对」更难补救
            </p>
        </div>
    );
}
