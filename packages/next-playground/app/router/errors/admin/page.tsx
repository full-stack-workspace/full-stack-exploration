/**
 * ============================================================================
 * /router/errors/admin — forbidden() 的活演示
 * ============================================================================
 *
 * 页面渲染到 Gate 时抛出 forbidden()(HTTP 403),
 * 由上一级 app/router/errors/forbidden.tsx 接住。
 *
 * 真实项目里 Gate 的位置是「读 session → 已登录但角色不够 → forbidden()」;
 * 本站固定演示「权限不足」分支。
 *
 * cacheComponents 约束同 locked 页:权限是请求时决策,
 * 先 await connection() 并包在 Suspense 里。
 *
 * @module app/router/errors/admin/page
 */

import { forbidden } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

/**
 * 权限闸门:真实项目在这里校验角色。
 * forbidden() 抛 403 —— 已认证,但没权限。
 */
async function Gate(): Promise<never> {
    await connection();
    forbidden();
}

export default function AdminPage() {
    return (
        <Suspense
            fallback={
                <p className="text-sm text-neutral-500">正在校验权限…</p>
            }
        >
            <Gate />
        </Suspense>
    );
}
