/**
 * ============================================================================
 * LiveHeaders — 本页响应头的活证据
 * ============================================================================
 *
 * 客户端对本页再发一次 HEAD 请求,把响应里的安全头原样读出来渲染。
 * Server Component 的 headers() 读的是「请求头」,看不到 next.config.ts
 * 挂在响应上的头,所以活证据必须在客户端用 fetch 拿。
 *
 * 顺带也是 CSP 的自证:connect-src 'self' 允许这次同源 fetch,
 * 如果 CSP 配置写错了,这个面板自己会先挂掉。
 *
 * @module topics/security/headers/LiveHeaders
 * @client
 */

"use client";

import { useEffect, useState } from "react";

/** 关注的安全头(response.headers 的名字一律小写) */
const WATCHED_HEADERS = [
    "content-security-policy",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
    "permissions-policy",
] as const;

export function LiveHeaders() {
    const [snapshot, setSnapshot] = useState<Record<string, string> | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        fetch(window.location.pathname, { method: "HEAD", cache: "no-store" })
            .then((res) => {
                const next: Record<string, string> = {};
                for (const name of WATCHED_HEADERS) {
                    next[name] = res.headers.get(name) ?? "(响应中没有这个头)";
                }
                setSnapshot(next);
            })
            .catch(() => setFailed(true));
    }, []);

    if (failed) {
        return (
            <p className="text-sm text-red-600 dark:text-red-400">
                HEAD 请求失败 —— 如果是 CSP 拦的,说明 connect-src 配置需要修。
            </p>
        );
    }
    if (!snapshot) {
        return (
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
                正在对本页发 HEAD 请求…
            </p>
        );
    }

    return (
        <dl className="space-y-2.5">
            {WATCHED_HEADERS.map((name) => (
                <div key={name}>
                    <dt className="font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-100">
                        {name}
                    </dt>
                    <dd className="mt-0.5 font-mono text-xs break-all text-neutral-500 dark:text-neutral-400">
                        {snapshot[name]}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
