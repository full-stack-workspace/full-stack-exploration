/**
 * ============================================================================
 * 动态 API 专题的 Server Actions — 写 cookie
 * ============================================================================
 *
 * cookies() 的读写不对称:读可以在任何 Server Component(请求时),
 * 写只能在 Server Action / Route Handler 里 —— 渲染期响应头早已流出,
 * Set-Cookie 无处可写。这里提供设置/清除两个 action,
 * 写完调 refresh() 让客户端路由重取本页:cookie 是请求时数据,
 * 不进任何缓存标签,只能靠 refresh 让读侧重跑。
 *
 * @module topics/data/dynamic-apis/actions
 */

"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";

import { DEMO_COOKIE } from "./constants";

/** 写入演示 cookie(值为设置时刻,便于观察「真的换了」) */
export async function setDemoCookie(): Promise<void> {
    const store = await cookies();
    store.set(DEMO_COOKIE, `set-at-${new Date().toISOString()}`, {
        path: "/",
        // 教学演示不需要 JS 读它,httpOnly 是更安全的默认
        httpOnly: true,
        sameSite: "lax",
    });
    refresh();
}

/** 清除演示 cookie */
export async function clearDemoCookie(): Promise<void> {
    const store = await cookies();
    store.delete(DEMO_COOKIE);
    refresh();
}
