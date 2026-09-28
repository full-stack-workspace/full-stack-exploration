/**
 * ============================================================================
 * TodoCard — 待办工具调用的渲染产物
 * ============================================================================
 *
 * 模型返回 { tool: "todo", payload } 时渲染此卡片。
 *
 * @module topics/ai-native/generative-ui/components/TodoCard
 */

import { cn } from "@/lib/utils";

import type { TodoPayload } from "../types";

export function TodoCard({ payload }: { payload: TodoPayload }) {
    const doneCount = payload.items.filter((i) => i.done).length;
    return (
        <div className="w-full max-w-sm rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm dark:border-neutral-800/60 dark:bg-neutral-900">
            <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    {payload.date}待办
                </p>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {doneCount}/{payload.items.length} 已完成
                </span>
            </div>
            <ul className="mt-3 space-y-2">
                {payload.items.map((item) => (
                    <li key={item.text} className="flex items-center gap-2.5 text-sm">
                        <span
                            className={cn(
                                "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                                item.done
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-neutral-300 dark:border-neutral-600",
                            )}
                        >
                            {item.done ? "✓" : ""}
                        </span>
                        <span
                            className={cn(
                                item.done
                                    ? "text-neutral-400 line-through dark:text-neutral-500"
                                    : "text-neutral-700 dark:text-neutral-300",
                            )}
                        >
                            {item.text}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
