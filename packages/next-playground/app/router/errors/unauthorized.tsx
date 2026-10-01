/**
 * ============================================================================
 * 段级未认证 — /router/errors 的 unauthorized() 活演示
 * ============================================================================
 *
 * unauthorized() 抛出时渲染这份 UI(HTTP 401)。
 * 语义是「你是谁」:未登录、会话过期。登录入口应该出现在这里,
 * 而不是一个干巴巴的错误页。
 *
 * 不需要 "use client":没有重试状态,和 not-found.tsx 同理。
 *
 * @module app/router/errors/unauthorized
 */

import Link from "next/link";

export default function SegmentUnauthorized() {
    return (
        <div className="mx-auto max-w-6xl">
            <p className="font-mono text-[11px] tracking-[0.18em] text-signal-600 dark:text-signal-400">
                unauthorized.tsx
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink dark:text-neutral-50">
                401 — 先登录,再进这页
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                /router/errors/locked 在请求时校验登录态并调用了 unauthorized()。
                这是「不知道你是谁」,与 forbidden() 的「知道你是谁但没权限」不同。
            </p>
            <Link
                href="/router/errors"
                className="mt-6 inline-flex text-sm font-medium text-ink underline decoration-signal-500 underline-offset-4 dark:text-neutral-100"
            >
                回到错误与未找到
            </Link>
        </div>
    );
}
