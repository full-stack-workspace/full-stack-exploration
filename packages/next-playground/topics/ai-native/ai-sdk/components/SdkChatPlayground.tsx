/**
 * ============================================================================
 * SdkChatPlayground — AI SDK 版聊天演练(Client)
 * ============================================================================
 *
 * 与 streaming-endpoint 专题的 StreamPlayground 同场景对照:
 * 那边手写 fetch + getReader() + SSE 分帧 + AbortController;
 * 这边 useChat 一个 Hook 接管传输、消息状态机与取消。
 *
 * 演示要点：
 * - messages 是结构化 UIMessage[](parts 数组),不是拼接字符串
 * - status 状态机(submitted / streaming / ready / error)由 SDK 维护
 * - stop() 一行取消,abort 会沿协议传播回服务端模型调用
 *
 * @module topics/ai-native/ai-sdk/components/SdkChatPlayground
 * @client
 */

"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * 传输层单例:指向本站 SDK 版端点。
 * 模块级创建 —— transport 无会话状态,不必随渲染重建。
 */
const transport = new DefaultChatTransport({ api: "/api/ai/sdk-chat" });

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

const STATUS_LABEL: Record<ChatStatus, string> = {
    ready: "就绪",
    submitted: "已提交,等首帧",
    streaming: "流式生成中",
    error: "出错了",
};

const STATUS_STYLE: Record<ChatStatus, string> = {
    ready: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
    submitted: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    streaming: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    error: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

/** 从 UIMessage 的 parts 里取出全部文本片段并拼接 */
function messageText(parts: Array<{ type: string; text?: string }>): string {
    return parts
        .filter((part) => part.type === "text")
        .map((part) => part.text ?? "")
        .join("");
}

export function SdkChatPlayground() {
    const { messages, sendMessage, status, stop, error } = useChat({ transport });
    // 输入框是受控的本地状态;v4 的 useChat 不再内置 input/handleInputChange
    const [input, setInput] = useState("");

    const busy = status === "submitted" || status === "streaming";

    /** 提交一轮对话:sendMessage 触发 transport 发 POST 并接管响应流 */
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const text = input.trim();
        if (!text || busy) {return;}
        setInput("");
        void sendMessage({ text });
    };

    return (
        <div className="space-y-4">
            {/* 消息流:user 右对齐、assistant 左对齐,流式中的末条带光标 */}
            <div className="min-h-40 space-y-3 rounded-xl border border-neutral-200/60 bg-neutral-50/60 p-4 dark:border-neutral-800/60 dark:bg-neutral-950/60">
                {messages.length === 0 && !error && (
                    <p className="text-sm text-neutral-400 dark:text-neutral-500">
                        随便问一句 —— 后端是 mock 模型,回答内容固定,但流式协议、取消与状态机都是真的
                    </p>
                )}
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            "flex",
                            message.role === "user" ? "justify-end" : "justify-start",
                        )}
                    >
                        <div
                            className={cn(
                                "max-w-[85%] rounded-xl px-3.5 py-2 text-sm leading-relaxed",
                                message.role === "user"
                                    ? "bg-violet-600 text-white"
                                    : "bg-white text-neutral-700 ring-1 ring-neutral-200/70 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-700/70",
                            )}
                        >
                            {messageText(message.parts)}
                            {message.role === "assistant" &&
                                status === "streaming" &&
                                message.id === messages[messages.length - 1]?.id && (
                                    <span className="ml-0.5 inline-block h-4 w-2 animate-pulse rounded-sm bg-violet-500 align-text-bottom" />
                                )}
                        </div>
                    </div>
                ))}
                {error && (
                    <p className="text-sm text-rose-600 dark:text-rose-400">
                        请求失败:{error.message}
                    </p>
                )}
            </div>

            {/* 操作行:输入 + 发送/停止 + 状态徽标 */}
            <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
                <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="问点什么……"
                    className="min-w-0 flex-1 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-violet-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                />
                <button
                    type="submit"
                    disabled={busy || !input.trim()}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    发送
                </button>
                <button
                    type="button"
                    onClick={() => void stop()}
                    disabled={!busy}
                    className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-rose-400 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-rose-600 dark:hover:text-rose-400"
                >
                    停止
                </button>
                <span className={cn("rounded-full px-3 py-1 text-xs font-medium", STATUS_STYLE[status])}>
                    {STATUS_LABEL[status]}
                </span>
            </form>

            <p className="text-xs text-neutral-400 dark:text-neutral-500">
                整个组件没有 fetch、没有 reader 循环、没有 AbortController —— 传输与状态机都在 useChat 里;
                打开 DevTools Network 看 /api/ai/sdk-chat,它仍是一条逐帧到达的 EventStream
            </p>
        </div>
    );
}
