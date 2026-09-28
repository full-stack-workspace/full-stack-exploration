/**
 * ============================================================================
 * GenUiPlayground — Generative UI 演练(Client)
 * ============================================================================
 *
 * 输入问题 → Route Handler 模拟「模型决定调用哪个工具」→
 * 返回结构化 { tool, payload, reply } → 前端按 tool 名做组件映射,
 * 在同一条消息流里混排文本气泡与真实 React 组件卡片。
 *
 * 关键:模型输出的是结构化工具调用,渲染成什么组件是 UI 层的决定,
 * 而不是把 payload 序列化成文本让用户自己读。
 *
 * @module topics/ai-native/generative-ui/components/GenUiPlayground
 * @client
 */

"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import type { ToolCallResult } from "../types";
import { StockCard } from "./StockCard";
import { TodoCard } from "./TodoCard";
import { WeatherCard } from "./WeatherCard";

/** 消息流里的一条消息;assistant 消息携带判别联合的工具调用结果 */
interface ChatMessage {
    id: number;
    role: "user" | "assistant";
    /** assistant 的工具调用结果;textOnly 时 tool 为 null */
    result?: ToolCallResult;
    /** user 消息的文本 */
    text?: string;
}

/** 示例提示:一键填入并发送 */
const EXAMPLES = ["北京天气", "AAPL 股价", "今日待办"];

/** 按 tool 名渲染对应组件 —— Generative UI 的「组件映射表」就在这一处 */
function ToolRenderer({ result }: { result: ToolCallResult }) {
    switch (result.tool) {
        case "weather":
            return <WeatherCard payload={result.payload} />;
        case "stock":
            return <StockCard payload={result.payload} />;
        case "todo":
            return <TodoCard payload={result.payload} />;
        default:
            return null;
    }
}

export function GenUiPlayground() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [pending, setPending] = useState(false);

    /** 发送问题并渲染工具调用结果 */
    const ask = async (question: string) => {
        const q = question.trim();
        if (!q || pending) {return;}
        setPending(true);
        setInput("");
        setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: q }]);

        try {
            const res = await fetch(`/api/ai/generative-ui?q=${encodeURIComponent(q)}`);
            if (!res.ok) {throw new Error(`HTTP ${res.status}`);}
            const result = (await res.json()) as ToolCallResult;
            setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", result }]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: "assistant",
                    result: { tool: null, reply: `请求失败:${err instanceof Error ? err.message : String(err)}` },
                },
            ]);
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* 消息流:文本气泡与组件卡片混排 */}
            <div className="max-h-96 space-y-3 overflow-y-auto rounded-xl border border-neutral-200/60 bg-neutral-50/60 p-4 dark:border-neutral-800/60 dark:bg-neutral-950/60">
                {messages.length === 0 && !pending && (
                    <p className="py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
                        输入问题或点下方示例,观察工具调用结果如何渲染成组件而不是 JSON
                    </p>
                )}
                {messages.map((msg) =>
                    msg.role === "user" ? (
                        <div key={msg.id} className="flex justify-end">
                            <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-violet-600 px-4 py-2 text-sm text-white">
                                {msg.text}
                            </p>
                        </div>
                    ) : (
                        <div key={msg.id} className="space-y-2">
                            {/* 文本气泡:模型的自然语言回复 */}
                            <p className="max-w-[80%] rounded-2xl rounded-bl-sm border border-neutral-200/60 bg-white px-4 py-2 text-sm text-neutral-700 dark:border-neutral-800/60 dark:bg-neutral-900 dark:text-neutral-300">
                                {msg.result?.reply}
                            </p>
                            {/* 工具调用产物:按 tool 名映射成组件 */}
                            {msg.result && <ToolRenderer result={msg.result} />}
                        </div>
                    ),
                )}
                {pending && (
                    <p className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-neutral-200/60 bg-white px-4 py-2 text-sm text-neutral-400 dark:border-neutral-800/60 dark:bg-neutral-900 dark:text-neutral-500">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-violet-300 border-t-violet-600" />
                        模型正在决定调用哪个工具…
                    </p>
                )}
            </div>

            {/* 输入行 + 示例提示 */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    void ask(input);
                }}
                className="flex gap-2"
            >
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="试试:北京天气 / AAPL 股价 / 今日待办"
                    className="min-w-0 flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-violet-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
                <button
                    type="submit"
                    disabled={pending || !input.trim()}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    发送
                </button>
            </form>
            <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                    <button
                        key={ex}
                        type="button"
                        onClick={() => void ask(ex)}
                        disabled={pending}
                        className={cn(
                            "rounded-full border border-violet-200 px-3 py-1 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-50",
                            "disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-950/40",
                        )}
                    >
                        {ex}
                    </button>
                ))}
            </div>
        </div>
    );
}
