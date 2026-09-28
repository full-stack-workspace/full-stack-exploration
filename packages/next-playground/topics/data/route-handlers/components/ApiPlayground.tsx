/**
 * ============================================================================
 * ApiPlayground — Route Handler 交互演练(Client)
 * ============================================================================
 *
 * 对 /api/basic 的 GET/POST/PUT/DELETE 四个方法逐一发起请求,
 * 展示状态码与响应体,直观对照 Route Handler 的 REST 形态。
 *
 * @module topics/data/route-handlers/components/ApiPlayground
 * @client
 */

"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
type Method = (typeof METHODS)[number];

const METHOD_STYLE: Record<Method, string> = {
    GET: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    POST: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    PUT: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    DELETE: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

interface Result {
    method: Method;
    status: number;
    body: string;
}

export function ApiPlayground() {
    const [result, setResult] = useState<Result | null>(null);
    const [pending, setPending] = useState<Method | null>(null);

    const call = async (method: Method) => {
        setPending(method);
        try {
            const res = await fetch("/api/basic", {
                method,
                ...(method !== "GET"
                    ? {
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ from: "ApiPlayground" }),
                      }
                    : {}),
            });
            const body = await res.text();
            setResult({ method, status: res.status, body });
        } finally {
            setPending(null);
        }
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {METHODS.map((m) => (
                    <button
                        key={m}
                        onClick={() => void call(m)}
                        disabled={pending !== null}
                        className={cn(
                            "rounded-lg px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-50",
                            METHOD_STYLE[m],
                        )}
                    >
                        {pending === m ? "请求中…" : m}
                    </button>
                ))}
            </div>
            {result && (
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{`${result.method} /api/basic → ${result.status}
${result.body}`}
                </pre>
            )}
        </div>
    );
}
