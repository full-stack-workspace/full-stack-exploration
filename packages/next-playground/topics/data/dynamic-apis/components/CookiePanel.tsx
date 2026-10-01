/**
 * ============================================================================
 * CookiePanel — cookies() 读(Server)+ 写控件(Client)
 * ============================================================================
 *
 * cookies() 读的是本次请求的 Cookie 头:内容按请求不同而不同,
 * 因此它在 cacheComponents 下必须待在 Suspense 洞内(由 index.tsx 包),
 * 所在路由的这一格退出静态预渲染。
 *
 * 写的不对称:cookies().set 只能在 Server Action / Route Handler
 * 里调用(渲染期响应头已流出,无处可写),所以按钮在独立的
 * Client 组件里,写动作在 actions.ts。
 *
 * @module topics/data/dynamic-apis/components/CookiePanel
 */

import { cookies } from "next/headers";

import { DEMO_COOKIE } from "../constants";
import { CookieControls } from "./CookieControls";

export async function CookiePanel() {
    const store = await cookies();
    const value = store.get(DEMO_COOKIE)?.value;

    return (
        <div className="space-y-4">
            <div className="border border-rule px-4 py-3 dark:border-neutral-800">
                <p className="font-mono text-[11px] text-neutral-500">
                    cookies().get(&quot;{DEMO_COOKIE}&quot;)
                </p>
                <p className="mt-1 font-mono text-sm break-all text-ink dark:text-neutral-100">
                    {value ?? "(未设置)"}
                </p>
            </div>
            <CookieControls />
        </div>
    );
}
