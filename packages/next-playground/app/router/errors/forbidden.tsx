/**
 * ============================================================================
 * 段级无权限 — /router/errors 的 forbidden() 活演示
 * ============================================================================
 *
 * forbidden() 抛出时渲染这份 UI(HTTP 403)。
 * 语义是「知道你是谁,但你没权限」:换账号、申请权限的引导
 * 放这里;未登录请先走 unauthorized()。
 *
 * 不需要 "use client":没有重试状态,和 not-found.tsx 同理。
 *
 * @module app/router/errors/forbidden
 */

import Link from "next/link";

export default function SegmentForbidden() {
    return (
        <div className="mx-auto max-w-6xl">
            <p className="font-mono text-[11px] tracking-[0.18em] text-signal-600 dark:text-signal-400">
                forbidden.tsx
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink dark:text-neutral-50">
                403 — 你登录了,但这个区域不向你开放
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                /router/errors/admin 在请求时校验角色并调用了 forbidden()。
                与 unauthorized() 的 401 区分:一个是认证问题,一个是授权问题。
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
