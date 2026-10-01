/**
 * ============================================================================
 * /router/errors/locked — unauthorized() 的活演示
 * ============================================================================
 *
 * 页面渲染到 Gate 时抛出 unauthorized()(HTTP 401),
 * 由上一级 app/router/errors/unauthorized.tsx 接住 ——
 * 与 notFound() 一样,它是「中断」不是「异常」,不进 error.tsx。
 *
 * 真实项目里 Gate 的位置是「读 session,没有就 unauthorized()」;
 * 本站没有登录体系,固定演示未登录分支。
 *
 * cacheComponents 约束:unauthorized() 是请求时决策,不能出现在
 * 预渲染阶段,所以先 await connection() 且整体包在 Suspense 里。
 *
 * @module app/router/errors/locked/page
 */

import { unauthorized } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

/**
 * 权限闸门:真实项目在这里校验 session。
 * connection() 把它钉在请求时;unauthorized() 抛 401 中断。
 */
async function Gate(): Promise<never> {
    await connection();
    unauthorized();
}

export default function LockedPage() {
    return (
        <Suspense
            fallback={
                <p className="text-sm text-neutral-500">正在校验登录态…</p>
            }
        >
            <Gate />
        </Suspense>
    );
}
